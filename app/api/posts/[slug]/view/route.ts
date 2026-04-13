import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { RowDataPacket } from 'mysql2/promise';

interface PostIdRow extends RowDataPacket { id: number; }

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const rows = await query<PostIdRow>(
    `SELECT id FROM posts WHERE slug = ? AND published = TRUE LIMIT 1`,
    [slug]
  );

  if (!rows[0]) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const postId = rows[0].id;

  // Increment total counter + record timestamped view in parallel
  await Promise.all([
    query(
      `UPDATE posts SET view_count = view_count + 1, updated_at = updated_at WHERE id = ?`,
      [postId]
    ),
    query(
      `INSERT INTO post_views (post_id) VALUES (?)`,
      [postId]
    ),
  ]);

  return NextResponse.json({ ok: true });
}
