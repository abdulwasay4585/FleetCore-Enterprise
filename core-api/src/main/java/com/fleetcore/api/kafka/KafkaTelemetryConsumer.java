package com.fleetcore.api.kafka;

import com.fleetcore.api.websocket.TelemetryWebSocketHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class KafkaTelemetryConsumer {

    /**
     * Listens to Kafka topic 'telemetry.raw' published by Go Ingestion Server,
     * and broadcasts real-time telemetry frames to all connected WebSockets clients on /ws/telemetry
     */
    @KafkaListener(topics = "telemetry.raw", groupId = "fleetcore-web-group")
    public void consumeTelemetryFrame(String messageJson) {
        System.out.println("[Kafka Consumer] Received Telemetry Frame -> Relaying to /ws/telemetry WebSockets");
        TelemetryWebSocketHandler.broadcastTelemetry(messageJson);
    }
}
