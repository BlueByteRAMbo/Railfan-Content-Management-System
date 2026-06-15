package com.railfan.archive.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Tracks potential duplicate video records.
 *
 * A duplicate is flagged when a new video has the same
 * train number + recording date, or same loco number + recording date
 * as an existing record. The user can mark alerts as resolved.
 */
@Entity
@Table(name = "duplicate_alerts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DuplicateAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "video_id", nullable = false)
    private Video video;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conflicting_video_id", nullable = false)
    private Video conflictingVideo;

    @Column(nullable = false, length = 300)
    private String reason;

    @Column(nullable = false)
    private Boolean resolved = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
