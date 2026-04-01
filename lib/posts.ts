import { query } from './db';
import type { PostRow, PostSummaryRow, SlugRow, Post, PostSummary, Category } from '@/types';
import type { RowDataPacket } from 'mysql2/promise';

type QP = string | number | boolean | null;

const SUMMARY_COLS = `id, title, slug, excerpt, category, published, reading_time, view_count, created_at, updated_at`;

// Sort by updated_at DESC — if post was never edited, updated_at equals created_at
const ORDER_BY = `ORDER BY updated_at DESC`;

// ─── All published posts with optional pagination ────────────────
export async function getAllPosts(page?: number, limit?: number): Promise<PostSummary[]> {
  if (page !== undefined && limit !== undefined) {
    const offset = (page - 1) * limit;
    return query<PostSummaryRow>(
      `SELECT ${SUMMARY_COLS} FROM posts WHERE published = TRUE ${ORDER_BY} LIMIT ${Math.trunc(limit)} OFFSET ${Math.trunc(offset)}`
    );
  }
  return query<PostSummaryRow>(
    `SELECT ${SUMMARY_COLS} FROM posts WHERE published = TRUE ${ORDER_BY}`
  );
}

// ─── Posts filtered by category with optional pagination ─────────
export async function getPostsByCategory(
  category: Category,
  page?: number,
  limit?: number
): Promise<PostSummary[]> {
  if (page !== undefined && limit !== undefined) {
    const offset = (page - 1) * limit;
    return query<PostSummaryRow>(
      `SELECT ${SUMMARY_COLS} FROM posts WHERE published = TRUE AND category = ? ${ORDER_BY} LIMIT ${Math.trunc(limit)} OFFSET ${Math.trunc(offset)}`,
      [category as QP]
    );
  }
  return query<PostSummaryRow>(
    `SELECT ${SUMMARY_COLS} FROM posts WHERE published = TRUE AND category = ? ${ORDER_BY}`,
    [category as QP]
  );
}

// ─── Total count (for pagination) ───────────────────────────────
interface CountRow extends RowDataPacket { total: number; }

export async function getPostsCount(category?: Category): Promise<number> {
  if (category) {
    const rows = await query<CountRow>(
      `SELECT COUNT(*) AS total FROM posts WHERE published = TRUE AND category = ?`,
      [category as QP]
    );
    return rows[0]?.total ?? 0;
  }
  const rows = await query<CountRow>(
    `SELECT COUNT(*) AS total FROM posts WHERE published = TRUE`
  );
  return rows[0]?.total ?? 0;
}

// ─── Top N posts per category, ordered by view_count ────────────
export async function getPopularByCategory(
  limit = 4
): Promise<Record<Category, PostSummary[]>> {
  const categories: Category[] = ['life', 'notes', 'thoughts'];
  const results = await Promise.all(
    categories.map((cat) =>
      query<PostSummaryRow>(
        // LIMIT inlined as integer — safe (app-controlled value, not user input)
        `SELECT ${SUMMARY_COLS} FROM posts
         WHERE published = TRUE AND category = ?
         ORDER BY view_count DESC, updated_at DESC
         LIMIT ${Math.trunc(limit)}`,
        [cat as QP]
      )
    )
  );
  return Object.fromEntries(
    categories.map((cat, i) => [cat, results[i]])
  ) as Record<Category, PostSummary[]>;
}

// ─── Single post by slug (full content) ─────────────────────────
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const rows = await query<PostRow>(
    `SELECT * FROM posts WHERE slug = ? AND published = TRUE LIMIT 1`, // LIMIT 1 literal
    [slug]
  );
  return rows[0] ?? null;
}

// ─── Adjacent posts for prev/next navigation ────────────────────
export async function getAdjacentPosts(
  createdAt: string
): Promise<{ prev: PostSummary | null; next: PostSummary | null }> {
  const [prevRows, nextRows] = await Promise.all([
    query<PostSummaryRow>(
      `SELECT ${SUMMARY_COLS} FROM posts WHERE published = TRUE AND created_at < ? ORDER BY created_at DESC LIMIT 1`,
      [createdAt as QP]
    ),
    query<PostSummaryRow>(
      `SELECT ${SUMMARY_COLS} FROM posts WHERE published = TRUE AND created_at > ? ORDER BY created_at ASC LIMIT 1`,
      [createdAt as QP]
    ),
  ]);
  return { prev: prevRows[0] ?? null, next: nextRows[0] ?? null };
}

// ─── Slugs for static generation ────────────────────────────────
export async function getAllSlugs(): Promise<string[]> {
  const rows = await query<SlugRow>(
    `SELECT slug FROM posts WHERE published = TRUE`
  );
  return rows.map((r) => r.slug);
}
