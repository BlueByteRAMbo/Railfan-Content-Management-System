-- ══════════════════════════════════════════════════════════════
-- V1__initial_schema.sql
-- Railfan Archive Manager — Initial Database Schema
-- ══════════════════════════════════════════════════════════════

-- ── Users (authentication) ────────────────────────────────────
CREATE TABLE users (
    id           BIGSERIAL    PRIMARY KEY,
    username     VARCHAR(50)  NOT NULL UNIQUE,
    email        VARCHAR(150) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    role         VARCHAR(20)  NOT NULL DEFAULT 'ROLE_USER',
    enabled      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Reference: Train Categories ───────────────────────────────
CREATE TABLE train_categories (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Reference: Locomotive Types ───────────────────────────────
CREATE TABLE loco_types (
    id           BIGSERIAL   PRIMARY KEY,
    name         VARCHAR(50) NOT NULL UNIQUE,
    traction     VARCHAR(20),          -- ELECTRIC, DIESEL, DUAL
    description  TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Reference: Locomotive Sheds ───────────────────────────────
CREATE TABLE loco_sheds (
    id         BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    zone       VARCHAR(50),
    location   VARCHAR(150),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Reference: Stations ───────────────────────────────────────
CREATE TABLE stations (
    id           BIGSERIAL    PRIMARY KEY,
    name         VARCHAR(200) NOT NULL UNIQUE,
    station_code VARCHAR(10),
    state        VARCHAR(100),
    railway_zone VARCHAR(50)
);

-- ── Tags ──────────────────────────────────────────────────────
CREATE TABLE tags (
    id         BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Collections ───────────────────────────────────────────────
CREATE TABLE collections (
    id               BIGSERIAL    PRIMARY KEY,
    name             VARCHAR(200) NOT NULL UNIQUE,
    description      TEXT,
    cover_thumbnail  TEXT,              -- Base64 encoded cover image
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── Core: Videos ──────────────────────────────────────────────
CREATE TABLE videos (
    id               BIGSERIAL    PRIMARY KEY,

    -- Basic Details
    title            VARCHAR(500) NOT NULL,
    recording_date   DATE         NOT NULL,
    recording_time   TIME,
    upload_status    VARCHAR(30)  NOT NULL DEFAULT 'PENDING_UPLOAD',

    -- Upload Details (upload_date/time mandatory when status = UPLOADED)
    upload_date           DATE,
    upload_time           TIME,
    youtube_url           VARCHAR(500),
    youtube_video_id      VARCHAR(50),
    scheduled_upload_date DATE,
    priority              VARCHAR(10)  NOT NULL DEFAULT 'MEDIUM',

    -- Media Details
    file_name        VARCHAR(500),
    duration_seconds BIGINT,
    file_size_bytes  BIGINT,
    resolution       VARCHAR(20),
    fps              DECIMAL(5,2),
    thumbnail        TEXT,              -- Base64 encoded thumbnail

    -- Train Details
    train_number         VARCHAR(10),
    train_name           VARCHAR(200),
    train_category_id    BIGINT REFERENCES train_categories(id) ON DELETE SET NULL,

    -- Locomotive Details
    loco_number      VARCHAR(20),
    loco_type_id     BIGINT REFERENCES loco_types(id) ON DELETE SET NULL,
    loco_shed_id     BIGINT REFERENCES loco_sheds(id) ON DELETE SET NULL,
    loco_livery      VARCHAR(200),
    kavach_fitted    BOOLEAN NOT NULL DEFAULT FALSE,

    -- Location Details
    station_id       BIGINT REFERENCES stations(id) ON DELETE SET NULL,
    section          VARCHAR(200),
    state            VARCHAR(100),
    railway_zone     VARCHAR(50),
    gps_lat          DECIMAL(10,8),
    gps_lng          DECIMAL(11,8),

    -- Content Details
    description      TEXT,
    notes            TEXT,
    interesting_events TEXT,
    observation_notes  TEXT,

    -- Audit
    is_deleted       BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_upload_status CHECK (
        upload_status IN ('PENDING_UPLOAD', 'SCHEDULED_UPLOAD', 'UPLOADED', 'ARCHIVED')
    ),
    CONSTRAINT chk_priority CHECK (
        priority IN ('HIGH', 'MEDIUM', 'LOW')
    ),
    -- Business rule: upload_date + upload_time required when status = UPLOADED
    CONSTRAINT chk_uploaded_requires_date CHECK (
        upload_status != 'UPLOADED'
        OR (upload_date IS NOT NULL AND upload_time IS NOT NULL)
    )
);

-- ── Junction: Video ↔ Tags ────────────────────────────────────
CREATE TABLE video_tags (
    video_id  BIGINT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    tag_id    BIGINT NOT NULL REFERENCES tags(id)   ON DELETE CASCADE,
    PRIMARY KEY (video_id, tag_id)
);

-- ── Junction: Video ↔ Collections ────────────────────────────
CREATE TABLE video_collections (
    video_id       BIGINT NOT NULL REFERENCES videos(id)       ON DELETE CASCADE,
    collection_id  BIGINT NOT NULL REFERENCES collections(id)  ON DELETE CASCADE,
    PRIMARY KEY (video_id, collection_id)
);

-- ── Duplicate Alerts ──────────────────────────────────────────
CREATE TABLE duplicate_alerts (
    id                   BIGSERIAL    PRIMARY KEY,
    video_id             BIGINT       NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    conflicting_video_id BIGINT       NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    reason               VARCHAR(300) NOT NULL,
    resolved             BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
