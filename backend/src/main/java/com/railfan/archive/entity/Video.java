package com.railfan.archive.entity;

import com.railfan.archive.enums.Priority;
import com.railfan.archive.enums.UploadStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Core entity: represents one train video recording.
 *
 * Business rules enforced:
 *  - uploadDate + uploadTime become mandatory when status = UPLOADED
 *  - scheduledUploadDate used when status = SCHEDULED_UPLOAD
 *  - thumbnail stored as Base64 TEXT
 */
@Entity
@Table(name = "videos")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Video {

    // ── Identity ─────────────────────────────────────────────
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Basic Details ─────────────────────────────────────────
    @NotBlank(message = "Title is required")
    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Recording date is required")
    @Column(nullable = false)
    private LocalDate recordingDate;

    private LocalTime recordingTime;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UploadStatus uploadStatus = UploadStatus.PENDING_UPLOAD;

    // ── Upload Details ────────────────────────────────────────
    /** Required when uploadStatus = UPLOADED (enforced in service layer) */
    private LocalDate uploadDate;

    /** Required when uploadStatus = UPLOADED (enforced in service layer) */
    private LocalTime uploadTime;

    @Column(length = 500)
    private String youtubeUrl;

    @Column(length = 50)
    private String youtubeVideoId;

    /** Target date when status = SCHEDULED_UPLOAD */
    private LocalDate scheduledUploadDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Priority priority = Priority.MEDIUM;

    // ── Media Details ─────────────────────────────────────────
    @Column(length = 500)
    private String fileName;

    /** Video duration in seconds */
    private Long durationSeconds;

    /** Raw file size in bytes */
    private Long fileSizeBytes;

    /** e.g. 1920x1080 */
    @Column(length = 20)
    private String resolution;

    @Column(precision = 5, scale = 2)
    private BigDecimal fps;

    /** Base64 encoded thumbnail image */
    @Column(columnDefinition = "TEXT")
    private String thumbnail;

    // ── Train Details ─────────────────────────────────────────
    @Column(length = 10)
    private String trainNumber;

    @Column(length = 200)
    private String trainName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "train_category_id")
    private TrainCategory trainCategory;

    // ── Locomotive Details ────────────────────────────────────
    @Column(length = 20)
    private String locoNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loco_type_id")
    private LocoType locoType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loco_shed_id")
    private LocoShed locoShed;

    @Column(length = 200)
    private String locoLivery;

    @Column(nullable = false)
    private Boolean kavachFitted = false;

    @OneToMany(mappedBy = "video", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<SecondaryLoco> secondaryLocos = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "video", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<TrainEncounter> trainEncounters = new java.util.ArrayList<>();

    // ── Location Details ──────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id")
    private Station station;

    @Column(length = 200)
    private String section;

    @Column(length = 100)
    private String state;

    @Column(length = 50)
    private String railwayZone;

    @Column(precision = 10, scale = 8)
    private BigDecimal gpsLat;

    @Column(precision = 11, scale = 8)
    private BigDecimal gpsLng;

    // ── Content Details ───────────────────────────────────────
    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String interestingEvents;

    @Column(columnDefinition = "TEXT")
    private String observationNotes;

    // ── Tags ──────────────────────────────────────────────────
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "video_tags",
        joinColumns = @JoinColumn(name = "video_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<Tag> tags = new HashSet<>();

    // ── Collections ───────────────────────────────────────────
    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "video_collections",
        joinColumns = @JoinColumn(name = "video_id"),
        inverseJoinColumns = @JoinColumn(name = "collection_id")
    )
    @Builder.Default
    private Set<RailCollection> collections = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // ── Audit ─────────────────────────────────────────────────
    @Column(nullable = false)
    private Boolean isDeleted = false;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // ── Helper methods ────────────────────────────────────────
    public boolean isUploaded() {
        return UploadStatus.UPLOADED.equals(this.uploadStatus);
    }

    public boolean isPending() {
        return UploadStatus.PENDING_UPLOAD.equals(this.uploadStatus);
    }

    public boolean isScheduled() {
        return UploadStatus.SCHEDULED_UPLOAD.equals(this.uploadStatus);
    }

    /** Days elapsed between recording and upload (null if not yet uploaded) */
    public Long getDaysBetweenRecordingAndUpload() {
        if (uploadDate == null || recordingDate == null) return null;
        return java.time.temporal.ChronoUnit.DAYS.between(recordingDate, uploadDate);
    }
}
