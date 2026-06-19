package com.railfan.archive.controller;

import com.railfan.archive.entity.Tag;
import com.railfan.archive.repository.TagRepository;
import com.railfan.archive.service.TagCollectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Tag management endpoints.
 *
 * GET  /api/tags                → all tags (ordered by usage)
 * GET  /api/tags/autocomplete?q= → prefix autocomplete
 * POST /api/tags                → create a new tag
 */
@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagRepository tagRepository;
    private final TagCollectionService tagCollectionService;

    @GetMapping
    public ResponseEntity<List<Tag>> getAll() {
        return ResponseEntity.ok(tagRepository.findAllOrderedByVideoCount());
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<List<Tag>> autocomplete(
        @RequestParam(required = false, defaultValue = "") String q
    ) {
        if (q.isBlank()) {
            return ResponseEntity.ok(tagRepository.findAllOrderedByVideoCount());
        }
        return ResponseEntity.ok(
            tagRepository.findByNameStartingWithIgnoreCaseOrderByNameAsc(q)
        );
    }

    @PostMapping
    public ResponseEntity<Tag> create(@RequestBody Map<String, String> body) {
        Tag tag = tagCollectionService.findOrCreateTag(body.get("name"));
        return ResponseEntity.status(HttpStatus.CREATED).body(tag);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tag> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Tag updated = tagCollectionService.updateTag(id, body.get("name"));
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tagCollectionService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }
}
