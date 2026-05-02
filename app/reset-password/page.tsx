export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import ResetPasswordForm from './ResetPasswordForm';

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) redirect('/forgot-password');

  return (
    <div className="mx-auto max-w-[760px] xl:max-w-[1020px] px-6 py-24">
      <div className="max-w-[360px] mx-auto">
        <h1 className="font-serif text-[1.75rem] font-semibold text-[#1A1A1A] mb-2">
          Đặt lại mật khẩu
        </h1>
        <p className="text-[0.9375rem] text-[#6B7280] mb-10">
          Nhập mật khẩu mới cho tài khoản của bạn.
        </p>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
