-- ─── Blog Database Schema ───────────────────────────────────────
CREATE DATABASE IF NOT EXISTS simple_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE simple_blog;

CREATE TABLE IF NOT EXISTS posts (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(255)  NOT NULL,
  slug         VARCHAR(255)  NOT NULL UNIQUE,
  excerpt      TEXT          NOT NULL,
  content      LONGTEXT      NOT NULL,
  category     ENUM('life', 'notes', 'thoughts') NOT NULL DEFAULT 'thoughts',
  published    BOOLEAN       NOT NULL DEFAULT FALSE,
  reading_time INT           NOT NULL DEFAULT 1,  -- minutes
  view_count   INT           NOT NULL DEFAULT 0,
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug       (slug),
  INDEX idx_category   (category),
  INDEX idx_published  (published),
  INDEX idx_created    (created_at DESC),
  INDEX idx_view_count (view_count DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Seed data ───────────────────────────────────────────────────
INSERT INTO posts (title, slug, excerpt, content, category, published, reading_time) VALUES
(
  'Bắt đầu viết blog',
  'bat-dau-viet-blog',
  'Đây là bài viết đầu tiên. Tôi muốn có một nơi để ghi lại những suy nghĩ, trải nghiệm và học hỏi của mình.',
  '# Bắt đầu viết blog\n\nĐây là bài viết đầu tiên của tôi.\n\nTôi muốn có một nơi để ghi lại những suy nghĩ, trải nghiệm và những điều tôi học được mỗi ngày. Không cần hoàn hảo, chỉ cần thật.\n\n## Tại sao viết?\n\nViết giúp tôi suy nghĩ rõ hơn. Khi phải chuyển suy nghĩ thành chữ, tôi phải hiểu thứ mình đang nghĩ.\n\n> "Writing is thinking. To write well is to think clearly." — David McCullough\n\n## Kế hoạch\n\n- Viết về cuộc sống hàng ngày\n- Ghi chú công việc và kỹ thuật\n- Suy nghĩ và quan sát\n\nKhông có lịch trình cứng nhắc. Khi có điều gì đó đáng ghi lại, tôi sẽ viết.',
  'thoughts',
  TRUE,
  2
),
(
  'Ghi chú về Next.js App Router',
  'ghi-chu-nextjs-app-router',
  'Những điều tôi học được khi chuyển từ Pages Router sang App Router trong Next.js 14+.',
  '# Ghi chú về Next.js App Router\n\nSau vài tuần làm việc với App Router, đây là những điểm quan trọng tôi ghi lại.\n\n## Server Components là mặc định\n\nTrong App Router, mọi component đều là Server Component theo mặc định. Chỉ dùng `"use client"` khi thực sự cần:\n\n- Dùng `useState`, `useEffect`\n- Xử lý sự kiện browser\n- Dùng browser API\n\n## Data Fetching\n\n```typescript\n// Server Component - fetch trực tiếp\nasync function PostList() {\n  const posts = await getPosts();\n  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;\n}\n```\n\n## Layouts lồng nhau\n\nApp Router cho phép layout lồng nhau rất tự nhiên. Mỗi segment có thể có `layout.tsx` riêng.',
  'notes',
  TRUE,
  3
),
(
  'Buổi sáng ở Đà Lạt',
  'buoi-sang-o-da-lat',
  'Một buổi sáng bình thường ở Đà Lạt, với cà phê, sương mù và tiếng chim.',
  '# Buổi sáng ở Đà Lạt\n\n6 giờ sáng. Trời vẫn còn tối và sương mù dày đặc bao phủ toàn bộ thành phố.\n\nTôi ngồi ở ban công với một tách cà phê đen, nhìn ra khu vườn nhỏ phía dưới. Tiếng chim bắt đầu vang lên từng đợt, như thể chúng đang điểm danh nhau.\n\nĐà Lạt có điều gì đó rất đặc biệt vào buổi sáng. Không khí lạnh nhưng không buốt. Yên tĩnh nhưng không vắng vẻ.\n\nTôi không cần làm gì. Chỉ ngồi và uống cà phê.\n\nĐôi khi đó là tất cả những gì ta cần.',
  'life',
  TRUE,
  2
);
