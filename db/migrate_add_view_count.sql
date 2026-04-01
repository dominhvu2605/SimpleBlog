-- Run this if your DB is already created (skip if starting fresh with schema.sql)
ALTER TABLE posts
  ADD COLUMN view_count INT NOT NULL DEFAULT 0 AFTER reading_time,
  ADD INDEX idx_view_count (view_count DESC);
