package com.railfan.archive.service;

import com.railfan.archive.dto.request.LoginRequest;
import com.railfan.archive.dto.request.RegisterRequest;
import com.railfan.archive.dto.response.AuthResponse;
import com.railfan.archive.entity.User;
import com.railfan.archive.exception.DuplicateVideoException;
import com.railfan.archive.repository.UserRepository;
import com.railfan.archive.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.authentication.BadCredentialsException;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.railfan.archive.exception.TooManyRequestsException;
import java.util.concurrent.TimeUnit;

/**
 * Authentication service: register, login, token generation.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    private final Cache<String, Integer> failedAttempts = Caffeine.newBuilder()
        .expireAfterWrite(15, TimeUnit.MINUTES)
        .build();

    /** Authenticate user and return JWT token */
    public AuthResponse login(LoginRequest request) {
        int attempts = failedAttempts.get(request.getUsername(), k -> 0);
        if (attempts >= 5) {
            throw new TooManyRequestsException("Account temporarily locked. Try again in 15 minutes.");
        }

        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            failedAttempts.invalidate(request.getUsername()); // reset on success
        } catch (BadCredentialsException e) {
            failedAttempts.put(request.getUsername(), attempts + 1);
            throw e;
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = tokenProvider.generateToken(authentication);
        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow();

        return AuthResponse.builder()
            .accessToken(token)
            .tokenType("Bearer")
            .expiresIn(jwtExpirationMs)
            .username(user.getUsername())
            .email(user.getEmail())
            .role(user.getRole())
            .build();
    }

    /** Register a new user account */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateVideoException("Username '" + request.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateVideoException("Email '" + request.getEmail() + "' is already registered");
        }

        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .role("ROLE_USER")
            .enabled(true)
            .build();
        userRepository.save(user);

        // Auto-login after registration
        LoginRequest loginReq = new LoginRequest();
        loginReq.setUsername(request.getUsername());
        loginReq.setPassword(request.getPassword());
        return login(loginReq);
    }
}
