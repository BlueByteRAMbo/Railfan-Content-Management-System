package com.railfan.archive.dto.request;

import com.railfan.archive.enums.Priority;
import com.railfan.archive.enums.UploadStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Request DTO for creating or updating a video record.
 *
 * Business rule enforced in VideoService:
 *  - If uploadStatus == UPLOADED → uploadDate and uploadTime are mandatory
 *  - If uploadStatus == SCHEDULED_UPLOAD → scheduledUploadDate should be provided
 */
@Data
public class VideoCreateRequest {

    // ── Basic Details ─────────────────────────────────────────
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Recording date is required")
    private LocalDate recordingDate;

    private LocalTime recordingTime;

    @NotNull(message = "Upload status is required")
    private UploadStatus uploadStatus;

    // ── Upload Details ────────────────────────────────────────
    private LocalDate uploadDate;
    private LocalTime uploadTime;
    private String youtubeUrl;
    private String youtubeVideoId;
    private LocalDate scheduledUploadDate;
    private Priority priority = Priority.MEDIUM;

    // ── Media Details ─────────────────────────────────────────
    private String fileName;
    private Long durationSeconds;
    private Long fileSizeBytes;
    private String resolution;
    private BigDecimal fps;
    private String thumbnail;  // Base64 encoded image

    // ── Train Details ─────────────────────────────────────────
    private String trainNumber;
    private String trainName;
    private Long trainCategoryId;

    // ── Locomotive Details ────────────────────────────────────
    private String locoNumber;
    private Long locoTypeId;
    private Long locoShedId;
    private String locoLivery;
    private Boolean kavachFitted = false;

    // ── Location Details ──────────────────────────────────────
    private Long stationId;
    private String section;
    private String state;
    private String railwayZone;
    private BigDecimal gpsLat;
    private BigDecimal gpsLng;

    // ── Content Details ───────────────────────────────────────
    private String notes;
    private String interestingEvents;
    private String observationNotes;

    // ── Relations ─────────────────────────────────────────────
    private Set<Long> tagIds = new HashSet<>();
    private Set<String> newTagNames = new HashSet<>();  // Auto-create tags on the fly
    private Set<Long> collectionIds = new HashSet<>();
}
