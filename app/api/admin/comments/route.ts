import { NextResponse } from 'next/server';
import { getAllComments } from '@/lib/comments';
import { requireAdmin } from '@/lib/admin';

// ─── GET /api/admin/comments — list with optional search ────────
export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? undefined;

  const comments = await getAllComments(search);
  return NextResponse.json(comments);
}
