import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCommentById, deleteComment } from '@/lib/comments';

interface Props {
  params: Promise<{ id: string }>;
}

// ─── DELETE /api/comments/[id] — requires auth ───────────────────
// User can delete their own comment; admin can delete any comment.
export async function DELETE(
  _req: Request,
  { params }: Props
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
  }

  const { id } = await params;
  const commentId = parseInt(id, 10);
  if (isNaN(commentId)) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
  }

  const comment = await getCommentById(commentId);
  if (!comment) {
    return NextResponse.json({ error: 'Bình luận không tồn tại' }, { status: 404 });
  }

  const isOwner = comment.user_id === session.userId;
  const isAdmin = session.role === 'admin';
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Không có quyền xóa bình luận này' }, { status: 403 });
  }

  await deleteComment(commentId);
  return NextResponse.json({ ok: true });
}
