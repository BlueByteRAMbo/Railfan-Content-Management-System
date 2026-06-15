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

    @GetMapping
    public ResponseEntity<List<DuplicateAlert>> getUnresolved() {
        return ResponseEntity.ok(duplicateAlertRepository.findByIsResolvedFalseOrderByCreatedAtDesc());
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<Map<String, String>> resolve(@PathVariable Long id) {
        return duplicateAlertRepository.findById(id).map(alert -> {
            alert.setIsResolved(true);
            duplicateAlertRepository.save(alert);
            return ResponseEntity.ok(Map.of("message", "Alert resolved"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
