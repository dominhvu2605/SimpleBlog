import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { getPostsCount } from '@/lib/posts';

export const metadata: Metadata = { title: 'Admin' };
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();

  if (!session)              redirect('/login');
  if (session.role !== 'admin') redirect('/');

  const totalPosts = await getPostsCount();

  return (
    <div className="mx-auto max-w-[760px] xl:max-w-[1020px] px-6 py-16">
      {/* Welcome */}
      <section className="mb-12">
        <p className="text-[0.8125rem] text-[#9CA3AF] mb-2 tracking-widest uppercase">
          Admin
        </p>
        <h1 className="font-serif text-[2rem] font-semibold text-[#1A1A1A] leading-tight mb-3">
          Xin chào, {session.username}!
        </h1>
        <p className="text-[1rem] text-[#6B7280]">
          Chào mừng bạn trở lại trang quản trị.
        </p>
      </section>

      <hr className="border-[#E5E5E3] mb-10" />

      {/* Stats */}
      <section className="mb-12">
        <h2 className="text-[0.8125rem] font-medium text-[#6B7280] tracking-widest uppercase mb-6">
          Tổng quan
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="border border-[#E5E5E3] rounded-lg p-5">
            <p className="text-[2rem] font-semibold text-[#1A1A1A]">{totalPosts}</p>
            <p className="text-[0.875rem] text-[#6B7280] mt-1">Bài viết</p>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 className="text-[0.8125rem] font-medium text-[#6B7280] tracking-widest uppercase mb-6">
          Liên kết nhanh
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/"
            className="px-4 py-2 text-[0.875rem] border border-[#E5E5E3] rounded-md text-[#6B7280] hover:text-[#1A1A1A] hover:border-[#2D2D2D] transition-colors"
          >
            ← Về trang chủ
          </Link>
        </div>
      </section>
    </div>
  );
}
