import { NextResponse } from 'next/server';
import { getPostById, updatePost, deletePost } from '@/lib/posts';
import { requireAdmin } from '@/lib/admin';

interface Props { params: Promise<{ id: string }> }

function parseId(raw: string): number | null {
  const n = parseInt(raw, 10);
  return isNaN(n) ? null : n;
}

// ─── GET /api/admin/posts/[id] ───────────────────────────────────
export async function GET(_req: Request, { params }: Props) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });

  const post = await getPostById(id);
  if (!post) return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 });

  return NextResponse.json(post);
}

// ─── PUT /api/admin/posts/[id] ───────────────────────────────────
export async function PUT(req: Request, { params }: Props) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });

  let body: {
    title?: string; slug?: string; excerpt?: string; content?: string;
    category?: string; published?: boolean; reading_time?: number;
  };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const { title, slug, excerpt, content, category, reading_time } = body;
  if (!title?.trim() || !slug?.trim() || !excerpt?.trim() || !content?.trim() || !category?.trim()) {
    return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin' }, { status: 400 });
  }

  await updatePost(id, {
    title:        title.trim(),
    slug:         slug.trim(),
    excerpt:      excerpt.trim(),
    content:      content.trim(),
    category:     category.trim(),
    published:    body.published ?? false,
    reading_time: Math.max(1, Math.trunc(reading_time ?? 1)),
  });

  return NextResponse.json({ ok: true });
}

// ─── DELETE /api/admin/posts/[id] ────────────────────────────────
export async function DELETE(_req: Request, { params }: Props) {
  const { error } = await requireAdmin();
  if (error) return error;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });

  const post = await getPostById(id);
  if (!post) return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 });

  await deletePost(id);
  return NextResponse.json({ ok: true });
}
