package com.railfan.archive.controller;

import com.railfan.archive.entity.DuplicateAlert;
import com.railfan.archive.repository.DuplicateAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Duplicate alert management endpoints.
 */
@RestController
@RequestMapping("/api/duplicates")
@RequiredArgsConstructor
public class DuplicateController {

    private final DuplicateAlertRepository duplicateAlertRepository;
    private final com.railfan.archive.repository.UserRepository userRepository;

    private com.railfan.archive.entity.User getCurrentUser() {
        org.springframework.security.core.Authentication auth =
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new org.springframework.security.authentication.BadCredentialsException("Not authenticated");
        }
        String username = auth.getName();
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found: " + username));
    }

    @GetMapping
    public ResponseEntity<List<DuplicateAlert>> getUnresolved() {
        com.railfan.archive.entity.User currentUser = getCurrentUser();
        return ResponseEntity.ok(duplicateAlertRepository.findByResolvedFalseOrderByCreatedAtDesc(currentUser));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<Map<String, String>> resolve(@PathVariable Long id) {
        com.railfan.archive.entity.User currentUser = getCurrentUser();
        return duplicateAlertRepository.findById(id).map(alert -> {
            if (alert.getVideo().getUser() == null || !alert.getVideo().getUser().getId().equals(currentUser.getId())) {
                return ResponseEntity.status(403).<Map<String, String>>build();
            }
            alert.setResolved(true);
            duplicateAlertRepository.save(alert);
            return ResponseEntity.ok(Map.of("message", "Alert resolved"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
