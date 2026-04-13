import type { RowDataPacket } from 'mysql2/promise';

export type Category = string; // was ENUM — now references categories.slug

// ─── Application-level types ─────────────────────────────────────
export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: Category;
  published: boolean;
  reading_time: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export type PostSummary = Omit<Post, 'content'>;

export interface CategoryDef {
  slug: string;
  label: string;
  description: string | null;
  created_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  username: string;  // joined from users table
  post_title: string; // joined from posts table (for admin view)
  post_slug: string;
  content: string;
  created_at: string;
}

// ─── DB row types (for mysql2 typed execute) ─────────────────────
export interface PostRow extends RowDataPacket, Post {}
export interface PostSummaryRow extends RowDataPacket, PostSummary {}
export interface SlugRow extends RowDataPacket { slug: string; }
export interface CommentRow extends RowDataPacket, Comment {}
export interface CategoryRow extends RowDataPacket, CategoryDef {}
