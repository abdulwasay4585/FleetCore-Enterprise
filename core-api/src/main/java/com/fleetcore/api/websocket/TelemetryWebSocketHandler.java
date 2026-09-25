package com.fleetcore.api.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * High-concurrency WebSocket handler streaming real-time telemetry frames
 * to enterprise operator dashboards. Origin security is enforced at the
 * handshake layer by WebSocketConfig.
 */
@Component
public class TelemetryWebSocketHandler extends TextWebSocketHandler {

    private static final CopyOnWriteArrayList<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        System.out.println("[WebSocket /ws/telemetry] Client connected: " + session.getId());
        session.sendMessage(new TextMessage("{\"status\":\"CONNECTED\",\"channel\":\"telemetry.raw\"}"));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) throws Exception {
        sessions.remove(session);
        System.out.println("[WebSocket /ws/telemetry] Client disconnected: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // Echo back or process incoming client commands
        session.sendMessage(new TextMessage("{\"ack\":true, \"received\":" + message.getPayload() + "}"));
    }

    public static void broadcastTelemetry(String telemetryJson) {
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(telemetryJson));
                } catch (IOException e) {
                    sessions.remove(session);
                }
            }
        }
    }
}
