'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/format';
import type { Comment } from '@/types';

interface SessionUser {
  userId: number;
  username: string;
  role: 'user' | 'admin';
}

interface Props {
  slug: string;
}

export default function CommentSection({ slug }: Props) {
  // undefined = đang tải, null = chưa đăng nhập, object = đã đăng nhập
  const [user, setUser]           = useState<SessionUser | null | undefined>(undefined);
  const [comments, setComments]   = useState<Comment[]>([]);
  const [content, setContent]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError]         = useState('');

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/posts/${slug}/comments`);
    if (res.ok) setComments(await res.json());
  }, [slug]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));

    fetchComments();
  }, [fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Có lỗi xảy ra, vui lòng thử lại.');
      } else {
        setContent('');
        await fetchComments();
      }
    } catch {
      setError('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  const canDelete = (comment: Comment) =>
    user != null && (user.role === 'admin' || user.userId === comment.user_id);

  return (
    <section className="mt-16">
      <h2 className="font-serif text-[1.25rem] font-semibold text-[#1A1A1A] mb-8">
        Bình luận
        {comments.length > 0 && (
          <span className="ml-2 text-[0.875rem] font-normal text-[#9CA3AF]">
            ({comments.length})
          </span>
        )}
      </h2>

      {/* ── Form thêm bình luận ── */}
      {user === undefined ? null : user ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <p className="text-[0.8125rem] text-[#6B7280] mb-3">
            Đang bình luận với tư cách{' '}
            <span className="text-[#1A1A1A] font-medium">{user.username}</span>
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết bình luận..."
            rows={4}
            maxLength={2000}
            disabled={submitting}
            className="w-full border border-[#E5E5E3] rounded-md px-4 py-3 text-[0.9375rem] text-[#1A1A1A] placeholder-[#9CA3AF] bg-[#FFFFFF] focus:outline-none focus:border-[#9CA3AF] resize-none disabled:opacity-50"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[0.75rem] text-[#9CA3AF]">
              {content.length}/2000
            </span>
            <div className="flex items-center gap-3">
              {error && (
                <p className="text-[0.8125rem] text-red-500">{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="px-4 py-1.5 text-[0.875rem] bg-[#1A1A1A] text-white rounded-md hover:bg-[#2D2D2D] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang gửi...' : 'Gửi'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <p className="text-[0.9375rem] text-[#6B7280] mb-10">
          <Link
            href="/login"
            className="text-[#1A1A1A] underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Đăng nhập
          </Link>{' '}
          để bình luận.
        </p>
      )}

      {/* ── Danh sách bình luận ── */}
      {comments.length === 0 ? (
        <p className="text-[0.9375rem] text-[#9CA3AF]">Chưa có bình luận nào.</p>
      ) : (
        <ul className="space-y-6">
          {comments.map((comment) => (
            <li key={comment.id} className="border-b border-[#E5E5E3] pb-6 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[0.8125rem]">
                  <span className="font-medium text-[#1A1A1A]">{comment.username}</span>
                  <span className="text-[#D1D5DB]">·</span>
                  <time className="text-[#9CA3AF]" dateTime={comment.created_at}>
                    {formatDate(comment.created_at)}
                  </time>
                </div>
                {canDelete(comment) && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={deletingId === comment.id}
                    title="Xóa bình luận"
                    className="text-[#9CA3AF] hover:text-red-400 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-[0.9375rem] text-[#374151] leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
