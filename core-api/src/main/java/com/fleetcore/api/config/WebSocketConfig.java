package com.fleetcore.api.config;

import com.fleetcore.api.websocket.TelemetryWebSocketHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * Spring Boot WebSocket Configuration for FleetCore Enterprise.
 * Binds the real-time telemetry streaming handler to `/ws/telemetry`
 * with configurable allowed origin patterns for production and local environments.
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final TelemetryWebSocketHandler telemetryWebSocketHandler;

    @Value("${fleetcore.websocket.allowed-origins:*}")
    private String allowedOrigins;

    public WebSocketConfig(TelemetryWebSocketHandler telemetryWebSocketHandler) {
        this.telemetryWebSocketHandler = telemetryWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        String[] patterns = allowedOrigins.split(",");
        for (int i = 0; i < patterns.length; i++) {
            patterns[i] = patterns[i].trim();
        }
        registry.addHandler(telemetryWebSocketHandler, "/ws/telemetry")
                .setAllowedOriginPatterns(patterns);
    }
}
