import { query } from './db';
import type { CommentRow, Comment } from '@/types';
import type { RowDataPacket } from 'mysql2/promise';

type QP = string | number | boolean | null;

interface PostIdRow extends RowDataPacket { id: number; }

const COMMENT_COLS = `
  c.id, c.post_id, c.user_id, u.username,
  p.title AS post_title, p.slug AS post_slug,
  c.content, c.created_at`;

// ─── Get all comments for a post (sorted newest first) ───────────
export async function getCommentsBySlug(slug: string): Promise<Comment[]> {
  return query<CommentRow>(
    `SELECT ${COMMENT_COLS}
     FROM comments c
     JOIN users u ON u.id = c.user_id
     JOIN posts p ON p.id = c.post_id
     WHERE p.slug = ? AND p.published = TRUE
     ORDER BY c.created_at DESC`,
    [slug as QP]
  );
}

// ─── Add a comment — returns false if post not found ─────────────
export async function addComment(
  slug: string,
  userId: number,
  content: string
): Promise<boolean> {
  const rows = await query<PostIdRow>(
    `SELECT id FROM posts WHERE slug = ? AND published = TRUE LIMIT 1`,
    [slug as QP]
  );
  if (!rows[0]) return false;
  await query(
    `INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)`,
    [rows[0].id as QP, userId as QP, content as QP]
  );
  return true;
}

// ─── Get a single comment by id ───────────────────────────────────
export async function getCommentById(id: number): Promise<Comment | null> {
  const rows = await query<CommentRow>(
    `SELECT ${COMMENT_COLS}
     FROM comments c
     JOIN users u ON u.id = c.user_id
     JOIN posts p ON p.id = c.post_id
     WHERE c.id = ? LIMIT 1`,
    [id as QP]
  );
  return rows[0] ?? null;
}

// ─── Delete a comment by id ───────────────────────────────────────
export async function deleteComment(id: number): Promise<void> {
  await query(`DELETE FROM comments WHERE id = ?`, [id as QP]);
}

// ─── Admin: get all comments with optional search ────────────────
export async function getAllComments(search?: string): Promise<Comment[]> {
  if (search) {
    return query<CommentRow>(
      `SELECT ${COMMENT_COLS}
       FROM comments c
       JOIN users u ON u.id = c.user_id
       JOIN posts p ON p.id = c.post_id
       WHERE c.content LIKE ? OR u.username LIKE ?
       ORDER BY c.created_at DESC`,
      [`%${search}%` as QP, `%${search}%` as QP]
    );
  }
  return query<CommentRow>(
    `SELECT ${COMMENT_COLS}
     FROM comments c
     JOIN users u ON u.id = c.user_id
     JOIN posts p ON p.id = c.post_id
     ORDER BY c.created_at DESC`
  );
}
