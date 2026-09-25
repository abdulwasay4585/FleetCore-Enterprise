package com.fleetcore.api.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${fleetcore.jwt.secret:}")
    private String jwtSecret;

    @Value("${fleetcore.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    private Key jwtSecretKey;

    @PostConstruct
    public void init() {
        if (jwtSecret != null && !jwtSecret.trim().isEmpty()) {
            byte[] keyBytes = jwtSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8);
            if (keyBytes.length < 32) {
                throw new IllegalStateException("FATAL: JWT_SECRET must be at least 32 characters (256 bits) for HMAC-SHA256 signing.");
            }
            this.jwtSecretKey = Keys.hmacShaKeyFor(keyBytes);
        } else {
            System.err.println("[SECURITY WARNING] JWT_SECRET environment variable is not defined! Generating an ephemeral 256-bit HMAC key for this instance. Configure JWT_SECRET in production.");
            this.jwtSecretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        }
    }

    public String generateToken(String email, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(jwtSecretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(jwtSecretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(jwtSecretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return (String) claims.get("role");
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(jwtSecretKey).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
