-- ══════════════════════════════════════════════════════════════
-- V3__add_indexes.sql
-- Performance indexes optimized for 10k–100k+ video records
-- ══════════════════════════════════════════════════════════════

-- ── Core query patterns ───────────────────────────────────────
CREATE INDEX idx_videos_recording_date     ON videos(recording_date)        WHERE is_deleted = FALSE;
CREATE INDEX idx_videos_upload_date        ON videos(upload_date)           WHERE is_deleted = FALSE;
CREATE INDEX idx_videos_upload_status      ON videos(upload_status)         WHERE is_deleted = FALSE;
CREATE INDEX idx_videos_priority           ON videos(priority)              WHERE is_deleted = FALSE;
CREATE INDEX idx_videos_train_number       ON videos(train_number)          WHERE is_deleted = FALSE;
CREATE INDEX idx_videos_train_name         ON videos(train_name)            WHERE is_deleted = FALSE;
CREATE INDEX idx_videos_loco_number        ON videos(loco_number)           WHERE is_deleted = FALSE;
CREATE INDEX idx_videos_loco_type_id       ON videos(loco_type_id)          WHERE is_deleted = FALSE;
CREATE INDEX idx_videos_loco_shed_id       ON videos(loco_shed_id)          WHERE is_deleted = FALSE;
CREATE INDEX idx_videos_station_id         ON videos(station_id)            WHERE is_deleted = FALSE;
CREATE INDEX idx_videos_train_category_id  ON videos(train_category_id)     WHERE is_deleted = FALSE;
CREATE INDEX idx_videos_kavach_fitted      ON videos(kavach_fitted)         WHERE is_deleted = FALSE;
CREATE INDEX idx_videos_created_at         ON videos(created_at)            WHERE is_deleted = FALSE;
CREATE INDEX idx_videos_youtube_video_id   ON videos(youtube_video_id)      WHERE youtube_video_id IS NOT NULL;

-- ── Composite indexes for dashboard month queries ─────────────
CREATE INDEX idx_videos_status_rec_date   ON videos(upload_status, recording_date)  WHERE is_deleted = FALSE;
CREATE INDEX idx_videos_status_upl_date   ON videos(upload_status, upload_date)     WHERE is_deleted = FALSE;
CREATE INDEX idx_videos_rec_year_month    ON videos(EXTRACT(YEAR FROM recording_date), EXTRACT(MONTH FROM recording_date)) WHERE is_deleted = FALSE;
CREATE INDEX idx_videos_upl_year_month    ON videos(EXTRACT(YEAR FROM upload_date),   EXTRACT(MONTH FROM upload_date))    WHERE is_deleted = FALSE;

-- ── Scheduled upload date (for Upload Planner) ────────────────
CREATE INDEX idx_videos_scheduled_date    ON videos(scheduled_upload_date)   WHERE upload_status = 'SCHEDULED_UPLOAD' AND is_deleted = FALSE;

-- ── Full-text search index (title + notes + description) ──────
CREATE INDEX idx_videos_fts ON videos USING GIN (
    to_tsvector('english',
        coalesce(title, '') || ' ' ||
        coalesce(train_name, '') || ' ' ||
        coalesce(train_number, '') || ' ' ||
        coalesce(loco_number, '') || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce(notes, '')
    )
) WHERE is_deleted = FALSE;

-- ── Junction tables ───────────────────────────────────────────
CREATE INDEX idx_video_tags_tag_id        ON video_tags(tag_id);
CREATE INDEX idx_video_tags_video_id      ON video_tags(video_id);
CREATE INDEX idx_video_collections_col    ON video_collections(collection_id);

-- ── Duplicate alerts ──────────────────────────────────────────
CREATE INDEX idx_dup_alerts_video_id      ON duplicate_alerts(video_id)     WHERE resolved = FALSE;

-- ── Users ─────────────────────────────────────────────────────
CREATE INDEX idx_users_username           ON users(username);
CREATE INDEX idx_users_email              ON users(email);
