package com.fleetcore.api.controller;

import com.fleetcore.api.model.UserEntity;
import com.fleetcore.api.repository.UserRepository;
import com.fleetcore.api.security.JwtTokenProvider;
import com.fleetcore.api.security.SsoAuthenticationService;
import com.fleetcore.api.security.SsoAuthenticationService.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * REST API — Authentication & Single Sign-On (SSO) Controller.
 *   POST /api/v1/auth/login     (Standard Credential Login)
 *   POST /api/v1/auth/sso       (F32: Enterprise SSO with Okta, Azure AD, Keycloak)
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final JwtTokenProvider tokenProvider;
    private final SsoAuthenticationService ssoService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthController(JwtTokenProvider tokenProvider,
                          SsoAuthenticationService ssoService,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.tokenProvider = tokenProvider;
        this.ssoService = ssoService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public static class LoginRequest {
        public String email;
        public String password;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        if (loginRequest.email == null || loginRequest.password == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Email and password are required"));
        }

        // Verify credentials against database
        Optional<UserEntity> userOpt = userRepository.findByEmail(loginRequest.email);
        if (userOpt.isEmpty() || !passwordEncoder.matches(loginRequest.password, userOpt.get().getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }

        UserEntity user = userOpt.get();
        String role = user.getRole() != null ? user.getRole() : "ROLE_USER";
        String scope = determineScopeFromRole(role);

        String token = tokenProvider.generateToken(user.getEmail(), role);

        Map<String, Object> response = new HashMap<>();
        response.put("token_type", "Bearer");
        response.put("access_token", token);
        response.put("expires_in_seconds", 86400);
        response.put("role", role);
        response.put("email", user.getEmail());
        response.put("data_access_scope", scope); // F31 Hierarchical tenant visibility

        return ResponseEntity.ok(response);
    }

    @PostMapping("/sso")
    public ResponseEntity<SsoAuthResponse> authenticateViaSso(@RequestBody SsoLoginRequest ssoReq) {
        return ResponseEntity.ok(ssoService.authenticateViaSso(ssoReq));
    }

    private String determineScopeFromRole(String role) {
        if ("ROLE_GLOBAL_ADMIN".equals(role)) return "GLOBAL_ALL_REGIONS_UNMASKED";
        if ("ROLE_DISPATCHER".equals(role)) return "REGIONAL_DIVISION_MASKED";
        if ("ROLE_DEPOT_MANAGER".equals(role) || "ROLE_MECHANIC".equals(role)) return "LOCAL_DEPOT_ONLY_MASKED";
        return "SINGLE_ASSET_DRIVER_ONLY";
    }
}

