import { query } from './db';
import type { CategoryRow, CategoryDef } from '@/types';

export async function getAllCategories(): Promise<CategoryDef[]> {
  return query<CategoryRow>(
    `SELECT slug, label, description, created_at FROM categories ORDER BY created_at ASC`
  );
}

export async function getCategoryBySlug(slug: string): Promise<CategoryDef | null> {
  const rows = await query<CategoryRow>(
    `SELECT slug, label, description, created_at FROM categories WHERE slug = ? LIMIT 1`,
    [slug]
  );
  return rows[0] ?? null;
}
