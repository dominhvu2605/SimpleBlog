'use client';

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type Period = 'day' | 'week' | 'month' | 'year';

interface TopPost { title: string; slug: string; views: number; }

interface Stats {
  newUsers:  Record<Period, number>;
  postViews: Record<Period, number>;
  newPosts:  Record<Period, number>;
  topPosts:  Record<Period, TopPost[]>;
}

const PERIOD_LABELS: Record<Period, string> = {
  day:   'Hôm nay',
  week:  'Tuần này',
  month: 'Tháng này',
  year:  'Năm nay',
};

export default function AdminDashboard() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [period, setPeriod] = useState<Period>('week');
  const [error, setError]   = useState('');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => {
        if (r.status === 401 || r.status === 403) { redirect('/login'); }
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setStats)
      .catch(() => setError('Không thể tải dữ liệu'));
  }, []);

  const statCards = stats
    ? [
        { label: 'Người dùng mới',    value: stats.newUsers[period] },
        { label: 'Lượt xem',          value: stats.postViews[period] },
        { label: 'Bài viết mới',      value: stats.newPosts[period] },
      ]
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-[1.75rem] font-semibold text-[#1A1A1A] mb-1">Tổng quan</h1>
        <p className="text-[0.9375rem] text-[#6B7280]">Tổng quan hoạt động blog.</p>
      </div>

      {error && <p className="text-[0.875rem] text-red-500 mb-6">{error}</p>}

      {/* Period tabs */}
      <div className="flex gap-1 mb-6 border-b border-[#E5E5E3]">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={[
              'px-3 py-2 text-[0.8125rem] transition-colors border-b-2 -mb-px',
              period === p
                ? 'border-[#1A1A1A] text-[#1A1A1A] font-medium'
                : 'border-transparent text-[#6B7280] hover:text-[#1A1A1A]',
            ].join(' ')}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {statCards.map(({ label, value }) => (
            <div key={label} className="border border-[#E5E5E3] rounded-lg p-5">
              <p className="text-[2rem] font-semibold text-[#1A1A1A] leading-none">{value.toLocaleString()}</p>
              <p className="text-[0.8125rem] text-[#6B7280] mt-2">{label}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-[#E5E5E3] rounded-lg p-5 animate-pulse">
              <div className="h-8 w-16 bg-[#E5E5E3] rounded mb-2" />
              <div className="h-3 w-24 bg-[#E5E5E3] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Top posts */}
      <section>
        <h2 className="text-[0.8125rem] font-medium text-[#6B7280] tracking-widest uppercase mb-4">
          Bài đọc nhiều nhất — {PERIOD_LABELS[period]}
        </h2>
        {stats ? (
          stats.topPosts[period].length > 0 ? (
            <ol className="space-y-2">
              {stats.topPosts[period].map((post, idx) => (
                <li key={post.slug} className="flex items-center gap-4">
                  <span className="text-[0.8125rem] text-[#9CA3AF] w-4 shrink-0">{idx + 1}</span>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="flex-1 text-[0.875rem] text-[#1A1A1A] hover:opacity-70 transition-opacity truncate"
                  >
                    {post.title}
                  </Link>
                  <span className="text-[0.8125rem] text-[#6B7280] shrink-0">
                    {post.views.toLocaleString()} lượt xem
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-[0.875rem] text-[#9CA3AF]">Chưa có dữ liệu cho kỳ này.</p>
          )
        ) : (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-5 bg-[#E5E5E3] rounded animate-pulse" />
            ))}
          </div>
        )}
      </section>

      {/* Quick links */}
      <div className="mt-10 pt-8 border-t border-[#E5E5E3] flex flex-wrap gap-3">
        <Link href="/admin/posts/new" className="px-4 py-2 text-[0.875rem] bg-[#1A1A1A] text-white rounded-md hover:bg-[#2D2D2D] transition-colors">
          + Bài viết mới
        </Link>
        <Link href="/admin/posts" className="px-4 py-2 text-[0.875rem] border border-[#E5E5E3] rounded-md text-[#6B7280] hover:text-[#1A1A1A] hover:border-[#2D2D2D] transition-colors">
          Quản lý bài viết
        </Link>
      </div>
    </div>
  );
}
