package com.railfan.archive.controller;

import com.railfan.archive.dto.request.ExpectedLocoConfigRequest;
import com.railfan.archive.entity.ExpectedLocoConfig;
import com.railfan.archive.entity.LocoType;
import com.railfan.archive.repository.ExpectedLocoConfigRepository;
import com.railfan.archive.repository.LocoTypeRepository;
import com.railfan.archive.repository.UserRepository;
import com.railfan.archive.entity.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expected-loco-config")
@RequiredArgsConstructor
public class ExpectedLocoConfigController {

    private final ExpectedLocoConfigRepository configRepository;
    private final LocoTypeRepository locoTypeRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new org.springframework.security.authentication.BadCredentialsException("Not authenticated");
        }
        String username = auth.getName();
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found: " + username));
    }

    @GetMapping
    public List<ExpectedLocoConfig> getAllConfigs() {
        return configRepository.findAllByUser(getCurrentUser());
    }

    @PostMapping
    @Transactional
    public ExpectedLocoConfig createConfig(@Valid @RequestBody ExpectedLocoConfigRequest request) {
        User currentUser = getCurrentUser();
        LocoType locoType = locoTypeRepository.findById(request.getExpectedLocoTypeId())
            .orElseThrow(() -> new IllegalArgumentException("Invalid Loco Type ID"));

        ExpectedLocoConfig config = configRepository.findByTrainNumberAndUser(request.getTrainNumber(), currentUser)
            .orElseGet(() -> {
                ExpectedLocoConfig newConfig = new ExpectedLocoConfig();
                newConfig.setTrainNumber(request.getTrainNumber());
                newConfig.setUser(currentUser);
                return newConfig;
            });

        config.setExpectedLocoType(locoType);
        return configRepository.save(config);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteConfig(@PathVariable Long id) {
        ExpectedLocoConfig config = configRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Config not found"));
        if (!config.getUser().getId().equals(getCurrentUser().getId())) {
            throw new AccessDeniedException("Not your config");
        }
        configRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
