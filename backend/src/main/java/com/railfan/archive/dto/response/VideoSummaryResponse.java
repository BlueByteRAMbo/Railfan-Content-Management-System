package com.railfan.archive.dto.response;

import com.railfan.archive.enums.Priority;
import com.railfan.archive.enums.UploadStatus;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Lightweight video summary DTO — returned by GET /api/videos (list).
 * Excludes heavy fields like thumbnail, base64, and long text.
 * Optimised for rendering video cards and table rows.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoSummaryResponse {

    private Long id;
    private String title;
    private LocalDate recordingDate;
    private UploadStatus uploadStatus;
    private Priority priority;

    // Train
    private String trainNumber;
    private String trainName;
    private String trainCategoryName;

    // Loco
    private String locoNumber;
    private String locoTypeName;
    private String locoShedName;

    // Location
    private String stationName;
    private String railwayZone;

    // Media (lightweight)
    private Long durationSeconds;
    private Long fileSizeBytes;
    private String thumbnail;         // Included for cards; excluded in table-only queries

    // YouTube
    private String youtubeVideoId;
    private LocalDate scheduledUploadDate;

    // Flags
    private Boolean kavachFitted;

    // Tags
    private List<String> tagNames;
}
