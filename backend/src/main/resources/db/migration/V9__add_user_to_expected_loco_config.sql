-- 1. Delete existing rules (since it's a new feature and dummy data, and we need NOT NULL user_id)
DELETE FROM expected_loco_config;

-- 2. Add the user_id column
ALTER TABLE expected_loco_config
ADD COLUMN user_id BIGINT NOT NULL REFERENCES users(id);

-- 3. Drop the old global unique constraint
ALTER TABLE expected_loco_config
DROP CONSTRAINT expected_loco_config_train_number_key;

-- 4. Add the new composite unique constraint
ALTER TABLE expected_loco_config
ADD CONSTRAINT uq_config_user_train UNIQUE (user_id, train_number);
