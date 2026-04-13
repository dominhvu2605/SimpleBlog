import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/admin';
import type { RowDataPacket } from 'mysql2/promise';

interface Props { params: Promise<{ slug: string }> }
interface CountRow extends RowDataPacket { c: number; }

// ─── PUT /api/admin/categories/[slug] — update label/description ─
export async function PUT(req: Request, { params }: Props) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { slug } = await params;

  let body: { label?: string; description?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  if (!body.label?.trim()) {
    return NextResponse.json({ error: 'Label không được để trống' }, { status: 400 });
  }

  await query(
    'UPDATE categories SET label = ?, description = ? WHERE slug = ?',
    [body.label.trim(), body.description?.trim() ?? null, slug]
  );

  return NextResponse.json({ ok: true });
}

// ─── DELETE /api/admin/categories/[slug] — block if in use ───────
export async function DELETE(_req: Request, { params }: Props) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { slug } = await params;

  const inUse = await query<CountRow>(
    'SELECT COUNT(*) AS c FROM posts WHERE category = ?', [slug]
  );
  if ((inUse[0]?.c ?? 0) > 0) {
    return NextResponse.json(
      { error: `Không thể xóa: có ${inUse[0].c} bài viết đang dùng category này` },
      { status: 409 }
    );
  }

  await query('DELETE FROM categories WHERE slug = ?', [slug]);
  return NextResponse.json({ ok: true });
}
