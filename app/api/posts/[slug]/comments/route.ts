import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCommentsBySlug, addComment } from '@/lib/comments';

interface Props {
  params: Promise<{ slug: string }>;
}

// ─── GET /api/posts/[slug]/comments — public ─────────────────────
export async function GET(
  _req: Request,
  { params }: Props
) {
  const { slug } = await params;
  const comments = await getCommentsBySlug(slug);
  return NextResponse.json(comments);
}

// ─── POST /api/posts/[slug]/comments — requires auth ─────────────
export async function POST(
  req: Request,
  { params }: Props
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const { slug } = await params;

  let content: string;
  try {
    const body = await req.json();
    content = (body.content ?? '').trim();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  if (!content) {
    return NextResponse.json({ error: 'Nội dung không được để trống' }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ error: 'Bình luận không được vượt quá 2000 ký tự' }, { status: 400 });
  }

  const ok = await addComment(slug, session.userId, content);
  if (!ok) {
    return NextResponse.json({ error: 'Bài viết không tồn tại' }, { status: 404 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
