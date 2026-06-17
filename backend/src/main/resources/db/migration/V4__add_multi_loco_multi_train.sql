-- Create secondary_locos table
CREATE TABLE secondary_locos (
    id BIGSERIAL PRIMARY KEY,
    video_id BIGINT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    loco_number VARCHAR(20),
    loco_type_id BIGINT REFERENCES loco_types(id) ON DELETE SET NULL,
    loco_shed_id BIGINT REFERENCES loco_sheds(id) ON DELETE SET NULL,
    role VARCHAR(20) NOT NULL
);

CREATE INDEX idx_secondary_locos_video_id ON secondary_locos(video_id);

-- Create train_encounters table
CREATE TABLE train_encounters (
    id BIGSERIAL PRIMARY KEY,
    video_id BIGINT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    encounter_type VARCHAR(20) NOT NULL,
    train_number VARCHAR(10),
    train_name VARCHAR(200),
    train_category_id BIGINT REFERENCES train_categories(id) ON DELETE SET NULL,
    loco_number VARCHAR(20),
    loco_type_id BIGINT REFERENCES loco_types(id) ON DELETE SET NULL,
    loco_shed_id BIGINT REFERENCES loco_sheds(id) ON DELETE SET NULL
);

CREATE INDEX idx_train_encounters_video_id ON train_encounters(video_id);
