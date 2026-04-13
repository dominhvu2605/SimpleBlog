import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import { formatDate } from '@/lib/format';
import type { RowDataPacket } from 'mysql2/promise';

export const metadata: Metadata = { title: 'Profile' };
export const dynamic = 'force-dynamic';

interface UserRow extends RowDataPacket {
  email:      string | null;
  created_at: string;
}

const ROLE_LABEL: Record<string, string> = {
  user:  'Thành viên',
  admin: 'Quản trị viên',
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const rows = await query<UserRow>(
    'SELECT email, created_at FROM users WHERE id = ? LIMIT 1',
    [session.userId]
  );
  const userRow = rows[0];

  return (
    <div className="mx-auto max-w-[760px] xl:max-w-[1020px] px-6 py-16">
      <section className="mb-12">
        <p className="text-[0.8125rem] text-[#9CA3AF] mb-2 tracking-widest uppercase">
          Tài khoản
        </p>
        <h1 className="font-serif text-[2rem] font-semibold text-[#1A1A1A] leading-tight">
          {session.username}
        </h1>
      </section>

      <hr className="border-[#E5E5E3] mb-10" />

      <section className="mb-12">
        <h2 className="text-[0.8125rem] font-medium text-[#6B7280] tracking-widest uppercase mb-6">
          Thông tin
        </h2>
        <dl className="space-y-4">
          <div className="flex gap-8">
            <dt className="w-32 text-[0.875rem] text-[#9CA3AF] shrink-0">Tên đăng nhập</dt>
            <dd className="text-[0.875rem] text-[#1A1A1A]">{session.username}</dd>
          </div>
          {userRow?.email && (
            <div className="flex gap-8">
              <dt className="w-32 text-[0.875rem] text-[#9CA3AF] shrink-0">Email</dt>
              <dd className="text-[0.875rem] text-[#1A1A1A]">{userRow.email}</dd>
            </div>
          )}
          <div className="flex gap-8">
            <dt className="w-32 text-[0.875rem] text-[#9CA3AF] shrink-0">Vai trò</dt>
            <dd className="text-[0.875rem] text-[#1A1A1A]">
              {ROLE_LABEL[session.role] ?? session.role}
            </dd>
          </div>
          {userRow?.created_at && (
            <div className="flex gap-8">
              <dt className="w-32 text-[0.875rem] text-[#9CA3AF] shrink-0">Ngày tạo</dt>
              <dd className="text-[0.875rem] text-[#1A1A1A]">{formatDate(userRow.created_at)}</dd>
            </div>
          )}
        </dl>
      </section>

      <section>
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
