package com.railfan.archive.enums;

/**
 * Upload lifecycle status for a video record.
 *
 * Business rules:
 *  - UPLOADED      → upload_date and upload_time are MANDATORY
 *  - SCHEDULED_UPLOAD → scheduled_upload_date should be set
 *  - PENDING_UPLOAD   → no date constraints
 *  - ARCHIVED         → video removed from active queue
 */
public enum UploadStatus {
    PENDING_UPLOAD,
    SCHEDULED_UPLOAD,
    UPLOADED,
    ARCHIVED
}
