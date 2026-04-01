import type { RowDataPacket } from 'mysql2/promise';

export type Category = 'life' | 'notes' | 'thoughts';

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

// ─── DB row types (for mysql2 typed execute) ─────────────────────
export interface PostRow extends RowDataPacket, Post {}
export interface PostSummaryRow extends RowDataPacket, PostSummary {}
export interface SlugRow extends RowDataPacket { slug: string; }
