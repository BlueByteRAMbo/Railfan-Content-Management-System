-- Create the expected locomotive configuration table
CREATE TABLE expected_loco_config (
    id BIGSERIAL PRIMARY KEY,
    train_number VARCHAR(10) NOT NULL UNIQUE,
    expected_loco_type_id BIGINT NOT NULL,
    CONSTRAINT fk_expected_loco_type FOREIGN KEY (expected_loco_type_id) REFERENCES loco_types(id)
);

-- Add is_offlink flag to videos
ALTER TABLE videos ADD COLUMN is_offlink BOOLEAN NOT NULL DEFAULT FALSE;

-- Optional: Seed some initial data for testing
-- Example: 12951 Mumbai Rajdhani expected to get WAP-7
INSERT INTO expected_loco_config (train_number, expected_loco_type_id)
SELECT '12951', id FROM loco_types WHERE name = 'WAP-7'
ON CONFLICT DO NOTHING;
