-- ─── Migration: Add comments table ───────────────────────────────
-- Chạy: mysql -u <user> -p simple_blog < db/migration_add_comments.sql
USE simple_blog;

CREATE TABLE IF NOT EXISTS comments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  post_id    INT  NOT NULL,
  user_id    INT  NOT NULL,
  content    TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_comment_post (post_id),
  INDEX idx_comment_user (user_id),
  CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES posts(id)  ON DELETE CASCADE,
  CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
