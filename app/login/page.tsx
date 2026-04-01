'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Metadata } from 'next';

// Note: metadata không hoạt động trong 'use client' — khai báo ở layout riêng nếu cần

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Đăng nhập thất bại');
      } else {
        router.push(data.role === 'admin' ? '/admin' : '/');
        router.refresh();
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
          Đăng nhập
        </h1>
        <p className="text-[0.9375rem] text-[#6B7280] mb-10">
          Chào mừng trở lại.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-[0.8125rem] font-medium text-[#1A1A1A] mb-1.5"
            >
              Tên đăng nhập
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-3.5 py-2.5 text-[0.9375rem] text-[#1A1A1A] bg-white border border-[#E5E5E3] rounded-md outline-none focus:border-[#2D2D2D] transition-colors placeholder:text-[#9CA3AF]"
              placeholder="username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[0.8125rem] font-medium text-[#1A1A1A] mb-1.5"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3.5 py-2.5 text-[0.9375rem] text-[#1A1A1A] bg-white border border-[#E5E5E3] rounded-md outline-none focus:border-[#2D2D2D] transition-colors placeholder:text-[#9CA3AF]"
              placeholder="••••••••"
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
            {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
