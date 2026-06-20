package com.railfan.archive.controller;

import com.railfan.archive.dto.response.PagedResponse;
import com.railfan.archive.dto.response.VideoSummaryResponse;
import com.railfan.archive.entity.RailCollection;
import com.railfan.archive.repository.RailCollectionRepository;
import com.railfan.archive.service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Collection management endpoints.
 *
 * GET /api/collections → all collections
 * GET /api/collections/{id} → single collection
 * POST /api/collections → create collection
 * PUT /api/collections/{id} → update collection
 * DELETE /api/collections/{id} → delete collection
 * GET /api/collections/{id}/videos → paginated videos in collection
 */
@RestController
@RequestMapping("/api/collections")
@RequiredArgsConstructor
public class CollectionController {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
        "recordingDate", "uploadDate", "title", "locoNumber",
        "trainNumber", "priority", "createdAt", "durationSeconds", "fileSizeBytes"
    );

    private final RailCollectionRepository collectionRepository;
    private final VideoService videoService;

    @GetMapping
    public ResponseEntity<List<RailCollection>> getAll() {
        return ResponseEntity.ok(collectionRepository.findAll(Sort.by("name")));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RailCollection> getById(@PathVariable Long id) {
        return collectionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RailCollection> create(@RequestBody Map<String, String> body) {
        RailCollection col = new RailCollection();
        col.setName(body.get("name"));
        col.setDescription(body.get("description"));
        return ResponseEntity.status(HttpStatus.CREATED).body(collectionRepository.save(col));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RailCollection> update(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return collectionRepository.findById(id).map(col -> {
            if (body.containsKey("name"))
                col.setName(body.get("name"));
            if (body.containsKey("description"))
                col.setDescription(body.get("description"));
            if (body.containsKey("coverThumbnail"))
                col.setCoverThumbnail(body.get("coverThumbnail"));
            return ResponseEntity.ok(collectionRepository.save(col));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!collectionRepository.existsById(id))
            return ResponseEntity.notFound().build();
        collectionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/videos")
    public ResponseEntity<PagedResponse<VideoSummaryResponse>> getVideos(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "recordingDate") String sort,
            @RequestParam(defaultValue = "DESC") String direction) {
        if (!ALLOWED_SORT_FIELDS.contains(sort)) sort = "recordingDate";
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(Sort.Direction.fromString(direction), sort));

        Page<VideoSummaryResponse> result = videoService.findAll(
                null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,
                null, null, id, pageable);

        return ResponseEntity.ok(PagedResponse.<VideoSummaryResponse>builder()
                .content(result.getContent())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .size(result.getSize())
                .number(result.getNumber())
                .first(result.isFirst())
                .last(result.isLast())
                .build());
    }
}
