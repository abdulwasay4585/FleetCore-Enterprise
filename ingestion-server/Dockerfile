# Build Stage
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod ./
COPY main.go ./
COPY parser/ ./parser/
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o ingestion_server main.go

# Runtime Stage (Minimal, non-root, secure Alpine container)
FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/ingestion_server .
EXPOSE 8080 9095 9096/udp
USER 1000:1000
ENTRYPOINT ["./ingestion_server"]
