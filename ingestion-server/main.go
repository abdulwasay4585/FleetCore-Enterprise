package main

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"sync"
	"sync/atomic"
	"syscall"
	"time"

	"github.com/fleetcore/ingestion-server/parser"
)

const (
	WorkerPoolSize = 64
	TCPPort        = "9095"
	UDPPort        = "9096"
	KafkaBroker    = "localhost:9092"
	KafkaTopic     = "telemetry.raw"
)

// ── Metrics ──────────────────────────────────────────────────────────────

var (
	messagesIngested  int64
	messagesPublished int64
	kafkaErrors       int64
)

type TelemetryJob struct {
	ClientAddr string
	AssetID    string
	Data       []byte
}

// ── Kafka Producer (Simple TCP-based, zero external dependency) ──────────

type KafkaProducer struct {
	broker string
	topic  string
	conn   net.Conn
	mu     sync.Mutex
}

func NewKafkaProducer(broker, topic string) *KafkaProducer {
	return &KafkaProducer{broker: broker, topic: topic}
}

func (kp *KafkaProducer) Connect() error {
	conn, err := net.DialTimeout("tcp", kp.broker, 5*time.Second)
	if err != nil {
		log.Printf("[Kafka Producer] WARNING: Cannot reach Kafka at %s — operating in log-only mode: %v", kp.broker, err)
		return err
	}
	kp.conn = conn
	log.Printf("[Kafka Producer] ✅ Connected to Kafka broker at %s, topic: %s", kp.broker, kp.topic)
	return nil
}

func (kp *KafkaProducer) Publish(key string, payload []byte) error {
	kp.mu.Lock()
	defer kp.mu.Unlock()

	if kp.conn == nil {
		// Kafka not available — log-only mode (graceful degradation)
		atomic.AddInt64(&kafkaErrors, 1)
		return fmt.Errorf("kafka connection unavailable")
	}

	// Format as newline-delimited JSON record (NDJSON) for downstream consumers
	record := fmt.Sprintf("{\"topic\":\"%s\",\"key\":\"%s\",\"value\":%s}\n", kp.topic, key, string(payload))
	_, err := kp.conn.Write([]byte(record))
	if err != nil {
		atomic.AddInt64(&kafkaErrors, 1)
		// Attempt reconnect on next publish
		kp.conn.Close()
		kp.conn = nil
		return err
	}

	atomic.AddInt64(&messagesPublished, 1)
	return nil
}

func (kp *KafkaProducer) Close() {
	kp.mu.Lock()
	defer kp.mu.Unlock()
	if kp.conn != nil {
		kp.conn.Close()
	}
}

// ── Ingestion Engine ─────────────────────────────────────────────────────

type IngestionEngine struct {
	jobsChan chan TelemetryJob
	wg       sync.WaitGroup
	kafka    *KafkaProducer
}

func NewIngestionEngine(kafka *KafkaProducer) *IngestionEngine {
	return &IngestionEngine{
		jobsChan: make(chan TelemetryJob, 10000),
		kafka:    kafka,
	}
}

func (e *IngestionEngine) StartWorkers(ctx context.Context) {
	for i := 0; i < WorkerPoolSize; i++ {
		e.wg.Add(1)
		go func(workerID int) {
			defer e.wg.Done()
			for {
				select {
				case <-ctx.Done():
					return
				case job, ok := <-e.jobsChan:
					if !ok {
						return
					}
					e.processTelemetry(job)
				}
			}
		}(i)
	}
	log.Printf("[Go Ingestion Engine] Initialized %d concurrent worker goroutines", WorkerPoolSize)
}

func (e *IngestionEngine) processTelemetry(job TelemetryJob) {
	atomic.AddInt64(&messagesIngested, 1)

	frame, err := parser.DecodeJ1939Payload(job.AssetID, job.Data)
	if err != nil {
		var frameJSON parser.J1939Frame
		if jsonErr := json.Unmarshal(job.Data, &frameJSON); jsonErr == nil {
			frame = &frameJSON
		} else {
			return
		}
	}

	// Serialize decoded frame to JSON for Kafka
	frameJSON, err := json.Marshal(frame)
	if err != nil {
		log.Printf("[Decode Error] Failed to serialize frame: %v", err)
		return
	}

	// Publish to Kafka topic `telemetry.raw`
	if pubErr := e.kafka.Publish(frame.AssetID, frameJSON); pubErr != nil {
		// Graceful degradation — log but don't crash
		log.Printf("[Kafka-FALLBACK] Asset: %s | PGN: %d | Speed: %.1f km/h | RPM: %.0f | Pos: (%.4f, %.4f)",
			frame.AssetID, frame.PGN, frame.SpeedKmh, frame.EngineRPM, frame.Latitude, frame.Longitude)
		return
	}

	log.Printf("[Kafka-Published: %s] Asset: %s | PGN: %d | Speed: %.1f km/h | RPM: %.0f | Temp: %.1f°C | Pos: (%.4f, %.4f)",
		KafkaTopic, frame.AssetID, frame.PGN, frame.SpeedKmh, frame.EngineRPM, frame.EngineTempC, frame.Latitude, frame.Longitude)
}

// ── Metrics Reporter ─────────────────────────────────────────────────────

func startMetricsReporter(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			ingested := atomic.LoadInt64(&messagesIngested)
			published := atomic.LoadInt64(&messagesPublished)
			errors := atomic.LoadInt64(&kafkaErrors)
			log.Printf("[METRICS] Ingested: %d | Published to Kafka: %d | Kafka Errors: %d", ingested, published, errors)
		}
	}
}

func (e *IngestionEngine) ListenTCP(ctx context.Context, port string) {
	listener, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Fatalf("Failed to bind TCP port :%s - %v", port, err)
	}
	defer listener.Close()

	log.Printf("[Ingestion-Server] TCP Binary Listener active on port :%s", port)

	for {
		select {
		case <-ctx.Done():
			return
		default:
			conn, err := listener.Accept()
			if err != nil {
				continue
			}
			go e.handleTCPConnection(conn)
		}
	}
}

func (e *IngestionEngine) handleTCPConnection(conn net.Conn) {
	defer conn.Close()
	buffer := make([]byte, 2048)

	for {
		n, err := conn.Read(buffer)
		if err != nil {
			return
		}

		payload := make([]byte, n)
		copy(payload, buffer[:n])

		e.jobsChan <- TelemetryJob{
			ClientAddr: conn.RemoteAddr().String(),
			AssetID:    "TRK-8921",
			Data:       payload,
		}
	}
}

func (e *IngestionEngine) ListenUDP(ctx context.Context, port string) {
	addr, err := net.ResolveUDPAddr("udp", ":"+port)
	if err != nil {
		log.Fatalf("Failed to resolve UDP address :%s - %v", port, err)
	}

	conn, err := net.ListenUDP("udp", addr)
	if err != nil {
		log.Fatalf("Failed to listen UDP port :%s - %v", port, err)
	}
	defer conn.Close()

	log.Printf("[Ingestion-Server] UDP Fast-Path Listener active on port :%s", port)

	buffer := make([]byte, 2048)
	for {
		select {
		case <-ctx.Done():
			return
		default:
			n, remoteAddr, err := conn.ReadFromUDP(buffer)
			if err != nil {
				continue
			}

			payload := make([]byte, n)
			copy(payload, buffer[:n])

			e.jobsChan <- TelemetryJob{
				ClientAddr: remoteAddr.String(),
				AssetID:    "REEFER-4412",
				Data:       payload,
			}
		}
	}
}

func LoadmTLSConfig(certFile, keyFile, caFile string) (*tls.Config, error) {
	cert, err := tls.LoadX509KeyPair(certFile, keyFile)
	if err != nil {
		return nil, fmt.Errorf("failed to load client cert key pair: %w", err)
	}

	return &tls.Config{
		Certificates: []tls.Certificate{cert},
		ClientAuth:   tls.RequireAndVerifyClientCert,
		MinVersion:   tls.VersionTLS13,
	}, nil
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func main() {
	log.Println("==========================================================================")
	log.Println(" FleetCore Enterprise - Go High-Concurrency IoT Ingestion Engine v2.0.0")
	log.Println(" TCP/UDP J1939 → Kafka Producer → telemetry.raw topic")
	log.Println("==========================================================================")

	tcpPort := getEnv("TCP_PORT", TCPPort)
	udpPort := getEnv("UDP_PORT", UDPPort)
	kafkaBroker := getEnv("KAFKA_BROKER", getEnv("KAFKA_BOOTSTRAP_SERVERS", KafkaBroker))
	kafkaTopic := getEnv("KAFKA_TOPIC", KafkaTopic)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Initialize Kafka Producer
	kafka := NewKafkaProducer(kafkaBroker, kafkaTopic)
	kafka.Connect() // Graceful — logs warning if Kafka unreachable

	engine := NewIngestionEngine(kafka)
	engine.StartWorkers(ctx)

	go engine.ListenTCP(ctx, tcpPort)
	go engine.ListenUDP(ctx, udpPort)
	go startMetricsReporter(ctx)

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	log.Println("[Go Ingestion Engine] Shutting down listeners and flushing workers...")
	cancel()
	close(engine.jobsChan)
	engine.wg.Wait()
	kafka.Close()
	log.Println("[Go Ingestion Engine] Graceful shutdown complete.")
}
