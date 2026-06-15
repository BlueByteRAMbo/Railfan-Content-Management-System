package com.railfan.archive.dto.response;

import com.railfan.archive.enums.Priority;
import com.railfan.archive.enums.UploadStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Full video response DTO — returned by GET /api/videos/{id}
 * Contains all fields including nested objects and lists.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoResponse {

    private Long id;

    // Basic
    private String title;
    private String description;
    private LocalDate recordingDate;
    private LocalTime recordingTime;
    private UploadStatus uploadStatus;

    // Upload
    private LocalDate uploadDate;
    private LocalTime uploadTime;
    private String youtubeUrl;
    private String youtubeVideoId;
    private LocalDate scheduledUploadDate;
    private Priority priority;

    // Media
    private String fileName;
    private Long durationSeconds;
    private Long fileSizeBytes;
    private String resolution;
    private BigDecimal fps;
    private String thumbnail;

    // Train
    private String trainNumber;
    private String trainName;
    private Long trainCategoryId;
    private String trainCategoryName;

    // Loco
    private String locoNumber;
    private Long locoTypeId;
    private String locoTypeName;
    private Long locoShedId;
    private String locoShedName;
    private String locoLivery;
    private Boolean kavachFitted;

    // Location
    private Long stationId;
    private String stationName;
    private String section;
    private String state;
    private String railwayZone;
    private BigDecimal gpsLat;
    private BigDecimal gpsLng;

    // Content
    private String notes;
    private String interestingEvents;
    private String observationNotes;

    // Relations
    private List<TagResponse> tags;
    private List<CollectionResponse> collections;

    // Audit + computed
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long daysBetweenRecordingAndUpload;

    // ── Nested reference types ─────────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TagResponse {
        private Long id;
        private String name;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CollectionResponse {
        private Long id;
        private String name;
    }
}
