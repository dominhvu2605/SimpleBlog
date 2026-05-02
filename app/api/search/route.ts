import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { PostSummaryRow } from '@/types';

const COLS = `id, title, slug, excerpt, category, published, reading_time, view_count, created_at, updated_at`;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q        = (searchParams.get('q') ?? '').trim();
  const category = (searchParams.get('category') ?? '').trim();

  if (q.length < 2) return NextResponse.json([]);

  const params: (string | number | boolean | null)[] = [`%${q}%`, `%${q}%`];
  let sql = `SELECT ${COLS} FROM posts WHERE published = TRUE AND (title LIKE ? OR excerpt LIKE ?)`;

  if (category) {
    sql += ` AND category = ?`;
    params.push(category);
  }

  sql += ` ORDER BY view_count DESC LIMIT 8`;

  try {
    const rows = await query<PostSummaryRow>(sql, params);
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
