package com.railfan.archive.controller;

import com.railfan.archive.dto.request.BulkActionRequest;
import com.railfan.archive.dto.request.VideoCreateRequest;
import com.railfan.archive.dto.response.PagedResponse;
import com.railfan.archive.dto.response.VideoResponse;
import com.railfan.archive.dto.response.VideoSummaryResponse;
import com.railfan.archive.enums.Priority;
import com.railfan.archive.enums.UploadStatus;
import com.railfan.archive.service.VideoService;
import com.railfan.archive.service.YouTubeService;
import com.railfan.archive.dto.response.YouTubeMetadataResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

/**
 * REST controller for video CRUD operations.
 *
 * Endpoints:
 *   GET    /api/videos               → paginated list with filters
 *   GET    /api/videos/{id}          → full detail
 *   POST   /api/videos               → create
 *   PUT    /api/videos/{id}          → update
 *   PATCH  /api/videos/{id}/status   → status change
 *   DELETE /api/videos/{id}          → soft delete
 *   POST   /api/videos/bulk-action   → bulk operations
 *   GET    /api/videos/check-duplicate → duplicate check
 */
@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;
    private final YouTubeService youtubeService;

    // ── Spotter Map ───────────────────────────────────────────
    @GetMapping("/map-points")
    public ResponseEntity<List<com.railfan.archive.dto.response.MapPointDto>> getMapPoints() {
        return ResponseEntity.ok(videoService.getMapPoints());
    }

    // ── List / Search ─────────────────────────────────────────
    @GetMapping
    public ResponseEntity<PagedResponse<VideoSummaryResponse>> findAll(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) UploadStatus uploadStatus,
        @RequestParam(required = false) Priority priority,
        @RequestParam(required = false) String trainNumber,
        @RequestParam(required = false) String trainName,
        @RequestParam(required = false) String locoNumber,
        @RequestParam(required = false) Long locoTypeId,
        @RequestParam(required = false) Long locoShedId,
        @RequestParam(required = false) Long trainCategoryId,
        @RequestParam(required = false) Long stationId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate recordingDateFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate recordingDateTo,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate uploadDateFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate uploadDateTo,
        @RequestParam(required = false) Boolean kavachFitted,
        @RequestParam(required = false) Boolean isOfflink,
        @RequestParam(required = false) Long collectionId,
        @RequestParam(defaultValue = "0")    int page,
        @RequestParam(defaultValue = "20")   int size,
        @RequestParam(defaultValue = "recordingDate") String sort,
        @RequestParam(defaultValue = "DESC") String direction
    ) {
        Sort.Direction dir = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, Math.min(size, 100), Sort.by(dir, sort));

        Page<VideoSummaryResponse> result = videoService.findAll(
            q, uploadStatus, priority, trainNumber, trainName, locoNumber,
            locoTypeId, locoShedId, trainCategoryId, stationId,
            recordingDateFrom, recordingDateTo, uploadDateFrom, uploadDateTo,
            kavachFitted, isOfflink, collectionId, pageable
        );

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

    // ── Single record ─────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<VideoResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(videoService.findById(id));
    }

    // ── Create ────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<VideoResponse> create(@Valid @RequestBody VideoCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(videoService.create(request));
    }

    // ── Update ────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<VideoResponse> update(
        @PathVariable Long id,
        @Valid @RequestBody VideoCreateRequest request
    ) {
        return ResponseEntity.ok(videoService.update(id, request));
    }

    // ── Status change ─────────────────────────────────────────
    @PatchMapping("/{id}/status")
    public ResponseEntity<VideoResponse> updateStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> body
    ) {
        UploadStatus status = UploadStatus.valueOf(body.get("uploadStatus"));
        LocalDate uploadDate = body.containsKey("uploadDate")
            ? LocalDate.parse(body.get("uploadDate")) : null;
        LocalTime uploadTime = body.containsKey("uploadTime")
            ? LocalTime.parse(body.get("uploadTime")) : null;
        LocalDate scheduledDate = body.containsKey("scheduledUploadDate")
            ? LocalDate.parse(body.get("scheduledUploadDate")) : null;

        return ResponseEntity.ok(
            videoService.updateStatus(id, status, uploadDate, uploadTime, scheduledDate)
        );
    }

    // ── Soft delete ───────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        videoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Bulk action ───────────────────────────────────────────
    @PostMapping("/bulk-action")
    public ResponseEntity<Map<String, String>> bulkAction(@RequestBody BulkActionRequest request) {
        videoService.bulkAction(request);
        return ResponseEntity.ok(Map.of("message", "Bulk action applied successfully"));
    }

    // ── Duplicate check ───────────────────────────────────────
    @GetMapping("/check-duplicate")
    public ResponseEntity<List<VideoSummaryResponse>> checkDuplicate(
        @RequestParam(required = false) String trainNumber,
        @RequestParam(required = false) String locoNumber,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate recordingDate,
        @RequestParam(required = false) Long excludeId
    ) {
        return ResponseEntity.ok(
            videoService.checkDuplicates(trainNumber, locoNumber, recordingDate, excludeId)
        );
    }

    // ── YouTube Metadata ──────────────────────────────────────
    @GetMapping("/youtube-metadata/{videoId}")
    public ResponseEntity<YouTubeMetadataResponse> getYouTubeMetadata(@PathVariable String videoId) {
        return ResponseEntity.ok(youtubeService.fetchMetadata(videoId));
    }
}
