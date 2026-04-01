import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { RowDataPacket } from 'mysql2/promise';

interface ExistsRow extends RowDataPacket { c: number; }

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Verify post exists and is published before incrementing
  const rows = await query<ExistsRow>(
    `SELECT COUNT(*) AS c FROM posts WHERE slug = ? AND published = TRUE`,
    [slug]
  );

  if (!rows[0] || rows[0].c === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await query(
    `UPDATE posts SET view_count = view_count + 1, updated_at = updated_at WHERE slug = ?`,
    [slug]
  );

  return NextResponse.json({ ok: true });
}
