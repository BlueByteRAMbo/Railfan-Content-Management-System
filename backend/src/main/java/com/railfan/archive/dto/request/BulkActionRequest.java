package com.railfan.archive.dto.request;

import lombok.Data;
import java.util.List;

/**
 * Bulk action request applied to a list of video IDs.
 *
 * Supported actions:
 *  MARK_UPLOADED   → mark all as UPLOADED (requires uploadDate + uploadTime)
 *  SCHEDULE_UPLOAD → mark all as SCHEDULED_UPLOAD (requires scheduledDate)
 *  ARCHIVE         → mark all as ARCHIVED
 *  DELETE          → soft-delete all
 */
@Data
public class BulkActionRequest {
    private List<Long> videoIds;
    private String action;          // MARK_UPLOADED | SCHEDULE_UPLOAD | ARCHIVE | DELETE
    private String uploadDate;      // ISO date "2025-07-20" — used with MARK_UPLOADED
    private String uploadTime;      // "HH:mm" — used with MARK_UPLOADED
    private String scheduledDate;   // ISO date — used with SCHEDULE_UPLOAD
}
