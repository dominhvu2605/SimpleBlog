-- ─── Migration: Admin Panel ───────────────────────────────────────
-- Chạy: mysql -u <user> -p simple_blog < db/migration_admin.sql
USE simple_blog;

-- ─── 1. Bảng categories ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  slug        VARCHAR(50)  NOT NULL,
  label       VARCHAR(100) NOT NULL,
  description TEXT         NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO categories (slug, label) VALUES
  ('life',     'Cuộc sống'),
  ('notes',    'Ghi chú'),
  ('thoughts', 'Suy nghĩ');

-- ─── 2. Chuyển posts.category từ ENUM → VARCHAR(50) + FK ─────────
-- Thêm cột tạm
ALTER TABLE posts
  ADD COLUMN category_new VARCHAR(50) NOT NULL DEFAULT 'thoughts' AFTER category;

-- Sao chép dữ liệu
UPDATE posts SET category_new = category;

-- Xóa cột ENUM cũ
ALTER TABLE posts DROP COLUMN category;

-- Đổi tên cột mới
ALTER TABLE posts CHANGE category_new category VARCHAR(50) NOT NULL DEFAULT 'thoughts';

-- Thêm FK + index
ALTER TABLE posts
  ADD CONSTRAINT fk_post_category
    FOREIGN KEY (category) REFERENCES categories(slug) ON UPDATE CASCADE,
  ADD INDEX idx_category (category);

-- ─── 3. Bảng post_views (track view theo thời gian) ─────────────
CREATE TABLE IF NOT EXISTS post_views (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  post_id   INT      NOT NULL,
  viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pv_post (post_id),
  INDEX idx_pv_date (viewed_at),
  CONSTRAINT fk_pv_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
