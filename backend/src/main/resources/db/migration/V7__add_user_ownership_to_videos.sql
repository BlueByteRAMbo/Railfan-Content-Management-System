-- Add user_id column to videos table referencing users(id)
ALTER TABLE videos ADD COLUMN user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

-- Assign existing videos to the first user (default user id = 1)
UPDATE videos SET user_id = (SELECT id FROM users ORDER BY id ASC LIMIT 1) WHERE user_id IS NULL;
