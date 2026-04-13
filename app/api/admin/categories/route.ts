import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
import type { CategoryRow } from '@/types';
import type { RowDataPacket } from 'mysql2/promise';

interface CountRow extends RowDataPacket { c: number; }

// ─── GET /api/admin/categories — list with post counts ──────────
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const rows = await query<CategoryRow & { post_count: number }>(
    `SELECT c.slug, c.label, c.description, c.created_at,
            COUNT(p.id) AS post_count
     FROM categories c
     LEFT JOIN posts p ON p.category = c.slug
     GROUP BY c.slug
     ORDER BY c.created_at ASC`
  );
  return NextResponse.json(rows);
}

// ─── POST /api/admin/categories — create ─────────────────────────
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  let body: { slug?: string; label?: string; description?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const { slug, label, description } = body;
  if (!slug?.trim() || !label?.trim()) {
    return NextResponse.json({ error: 'Slug và label không được để trống' }, { status: 400 });
  }

  // Validate slug: lowercase letters, numbers, hyphens only
  if (!/^[a-z0-9-]+$/.test(slug.trim())) {
    return NextResponse.json(
      { error: 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang' },
      { status: 400 }
    );
  }

  const existing = await query<CountRow>(
    'SELECT COUNT(*) AS c FROM categories WHERE slug = ?', [slug.trim()]
  );
  if ((existing[0]?.c ?? 0) > 0) {
    return NextResponse.json({ error: 'Slug đã tồn tại' }, { status: 409 });
  }

  await query(
    'INSERT INTO categories (slug, label, description) VALUES (?, ?, ?)',
    [slug.trim(), label.trim(), description?.trim() ?? null]
  );

  return NextResponse.json({ ok: true, slug: slug.trim() }, { status: 201 });
}
