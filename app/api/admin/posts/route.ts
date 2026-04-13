import { NextResponse } from 'next/server';
import { getAllPostsAdmin, createPost } from '@/lib/posts';
import { requireAdmin } from '@/lib/admin';

// ─── GET /api/admin/posts — list all posts ───────────────────────
export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const search    = searchParams.get('search')   ?? undefined;
  const category  = searchParams.get('category') ?? undefined;
  const pubParam  = searchParams.get('published');
  const published = pubParam === null ? undefined : pubParam === 'true';

  const posts = await getAllPostsAdmin(search, category, published);
  return NextResponse.json(posts);
}

// ─── POST /api/admin/posts — create post ─────────────────────────
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

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

  const id = await createPost({
    title:        title.trim(),
    slug:         slug.trim(),
    excerpt:      excerpt.trim(),
    content:      content.trim(),
    category:     category.trim(),
    published:    body.published ?? false,
    reading_time: Math.max(1, Math.trunc(reading_time ?? 1)),
  });

  return NextResponse.json({ ok: true, id }, { status: 201 });
}
