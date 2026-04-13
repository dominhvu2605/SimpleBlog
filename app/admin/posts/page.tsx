'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/format';
import type { PostSummary } from '@/types';

type Filter = 'all' | 'published' | 'draft';

export default function AdminPostsPage() {
  const [posts, setPosts]     = useState<PostSummary[]>([]);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)           params.set('search', search);
    if (filter !== 'all') params.set('published', String(filter === 'published'));
    const res  = await fetch(`/api/admin/posts?${params}`);
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, filter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Xóa bài "${title}"?\n\nHành động này không thể hoàn tác.`)) return;
    setDeleting(id);
    await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
    await fetchPosts();
    setDeleting(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-[1.75rem] font-semibold text-[#1A1A1A] mb-1">Bài viết</h1>
          <p className="text-[0.9375rem] text-[#6B7280]">{posts.length} bài viết</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 text-[0.875rem] font-medium bg-[#1A1A1A] text-white rounded-md hover:bg-[#2D2D2D] transition-colors"
        >
          + Thêm bài
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <input
          type="text"
          placeholder="Tìm theo tiêu đề…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3.5 py-2 text-[0.875rem] border border-[#E5E5E3] rounded-md outline-none focus:border-[#2D2D2D] transition-colors"
        />
        {(['all', 'published', 'draft'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={[
              'px-3 py-2 text-[0.8125rem] rounded-md border transition-colors',
              filter === f
                ? 'border-[#2D2D2D] text-[#1A1A1A] font-medium'
                : 'border-[#E5E5E3] text-[#6B7280] hover:border-[#2D2D2D]',
            ].join(' ')}
          >
            {{ all: 'Tất cả', published: 'Đã xuất bản', draft: 'Bản nháp' }[f]}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-[#E5E5E3] rounded animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-[0.875rem] text-[#9CA3AF] py-8 text-center">Không tìm thấy bài viết nào.</p>
      ) : (
        <div className="border border-[#E5E5E3] rounded-lg overflow-hidden">
          <table className="w-full text-[0.8125rem]">
            <thead className="bg-[#FAFAF8] border-b border-[#E5E5E3]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[#6B7280]">Tiêu đề</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B7280] w-24">Category</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B7280] w-24">Trạng thái</th>
                <th className="text-right px-4 py-3 font-medium text-[#6B7280] w-20">Views</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B7280] w-32">Ngày tạo</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E3]">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/posts/${post.slug}`}
                      target="_blank"
                      className="text-[#1A1A1A] hover:opacity-70 transition-opacity line-clamp-1"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">{post.category}</td>
                  <td className="px-4 py-3">
                    <span className={[
                      'inline-block px-2 py-0.5 rounded-full text-[0.75rem]',
                      post.published
                        ? 'bg-[#F0FDF4] text-[#15803D]'
                        : 'bg-[#F9FAFB] text-[#6B7280]',
                    ].join(' ')}>
                      {post.published ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#6B7280]">{post.view_count.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#9CA3AF]">{formatDate(post.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        disabled={deleting === post.id}
                        className="text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors"
                      >
                        {deleting === post.id ? '…' : 'Xóa'}
                      </button>
                    </div>
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
