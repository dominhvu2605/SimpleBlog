'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/format';
import type { Comment } from '@/types';

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error,    setError]    = useState('');

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const res  = await fetch(`/api/admin/comments?${params}`);
    const data = await res.json();
    setComments(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  async function handleDelete(id: number) {
    if (!confirm('Xóa bình luận này?')) return;
    setDeleting(id);
    setError('');
    const res  = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Xóa thất bại'); }
    else { await fetchComments(); }
    setDeleting(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-[1.75rem] font-semibold text-[#1A1A1A] mb-1">Bình luận</h1>
          <p className="text-[0.9375rem] text-[#6B7280]">{comments.length} bình luận</p>
        </div>
      </div>

      {error && <p className="text-[0.875rem] text-red-500 mb-4">{error}</p>}

      {/* Search */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Tìm theo nội dung hoặc tên người dùng…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3.5 py-2 text-[0.875rem] border border-[#E5E5E3] rounded-md outline-none focus:border-[#2D2D2D] transition-colors"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-[#E5E5E3] rounded animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-[0.875rem] text-[#9CA3AF] py-8 text-center">Không tìm thấy bình luận nào.</p>
      ) : (
        <div className="border border-[#E5E5E3] rounded-lg overflow-x-auto">
          <table className="w-full text-[0.8125rem] min-w-[560px]">
            <thead className="bg-[#FAFAF8] border-b border-[#E5E5E3]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[#6B7280] w-28">Người dùng</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B7280] w-40">Bài viết</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B7280]">Nội dung</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B7280] w-28">Ngày</th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E3]">
              {comments.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1A1A1A]">{c.username}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/posts/${c.post_slug}`}
                      target="_blank"
                      className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors line-clamp-1"
                    >
                      {c.post_title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    <span className="line-clamp-2">{c.content}</span>
                  </td>
                  <td className="px-4 py-3 text-[#9CA3AF]">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={deleting === c.id}
                      className="text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors"
                    >
                      {deleting === c.id ? '…' : 'Xóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
