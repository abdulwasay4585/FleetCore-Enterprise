package com.fleetcore.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS Configuration for FleetCore Enterprise Core API.
 * Configured via fleetcore.cors.allowed-origins property or CORS_ALLOWED_ORIGINS env var.
 * Enables Next.js App Router front end running on any host or port (e.g. Vercel, localhost)
 * to communicate seamlessly with REST endpoints without browser cross-origin blocks.
 */
@Configuration
public class CorsConfig {

    @Value("${fleetcore.cors.allowed-origins:http://localhost:3000,http://127.0.0.1:3000,http://localhost:8080}")
    private String allowedOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                String[] origins = allowedOrigins.split(",");
                for (int i = 0; i < origins.length; i++) {
                    origins[i] = origins[i].trim();
                }

                registry.addMapping("/**")
                        .allowedOriginPatterns(origins)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}
