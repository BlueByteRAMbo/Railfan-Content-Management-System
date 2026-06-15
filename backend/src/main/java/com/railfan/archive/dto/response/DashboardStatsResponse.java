package com.railfan.archive.dto.response;

import lombok.*;

/**
 * All stat card values for the dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {

    // Status counts
    private long totalVideos;
    private long uploadedVideos;
    private long pendingVideos;
    private long scheduledVideos;
    private long archivedVideos;

    // Storage & duration
    private long totalStorageBytes;
    private long totalDurationSeconds;
    private double averageDurationSeconds;

    // This month
    private long videosRecordedThisMonth;
    private long videosUploadedThisMonth;

    // Alerts
    private long unresolvedDuplicates;
}
