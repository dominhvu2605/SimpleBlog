'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Có lỗi xảy ra, vui lòng thử lại');
      } else {
        setSuccess(data.message);
      }
    } catch {
      setError('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[760px] xl:max-w-[1020px] px-6 py-24">
      <div className="max-w-[360px] mx-auto">
        <h1 className="font-serif text-[1.75rem] font-semibold text-[#1A1A1A] mb-2">
          Quên mật khẩu
        </h1>
        <p className="text-[0.9375rem] text-[#6B7280] mb-10">
          Nhập email đã đăng ký. Chúng tôi sẽ gửi liên kết đặt lại mật khẩu về hộp thư của bạn.
        </p>

        {success ? (
          <div className="space-y-6">
            <p className="text-[0.9375rem] text-[#1A1A1A] bg-[#F0FDF4] border border-[#BBF7D0] rounded-md px-4 py-3">
              {success}
            </p>
            <p className="text-[0.875rem] text-[#6B7280]">
              Nhớ mật khẩu rồi?{' '}
              <Link href="/login" className="text-[#1A1A1A] underline underline-offset-2">
                Đăng nhập
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-[0.8125rem] font-medium text-[#1A1A1A] mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-[0.9375rem] text-[#1A1A1A] bg-white border border-[#E5E5E3] rounded-md outline-none focus:border-[#2D2D2D] transition-colors placeholder:text-[#9CA3AF]"
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <p className="text-[0.875rem] text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-[0.9375rem] font-medium text-white bg-[#1A1A1A] rounded-md hover:bg-[#2D2D2D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Đang gửi…' : 'Gửi liên kết đặt lại'}
            </button>

            <p className="text-[0.875rem] text-[#6B7280] text-center">
              Nhớ mật khẩu rồi?{' '}
              <Link href="/login" className="text-[#1A1A1A] underline underline-offset-2">
                Đăng nhập
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
