'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  token: string;
}

export default function ResetPasswordForm({ token }: Props) {
  const router = useRouter();
  const [form, setForm]     = useState({ password: '', confirmPassword: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Đặt lại mật khẩu thất bại');
      } else {
        router.push('/login?reset=1');
      }
    } catch {
      setError('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="password"
          className="block text-[0.8125rem] font-medium text-[#1A1A1A] mb-1.5"
        >
          Mật khẩu mới
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full px-3.5 py-2.5 text-[0.9375rem] text-[#1A1A1A] bg-white border border-[#E5E5E3] rounded-md outline-none focus:border-[#2D2D2D] transition-colors placeholder:text-[#9CA3AF]"
          placeholder="Tối thiểu 8 ký tự"
        />
      </div>

      <div>
        <label
          htmlFor="confirm-password"
          className="block text-[0.8125rem] font-medium text-[#1A1A1A] mb-1.5"
        >
          Xác nhận mật khẩu mới
        </label>
        <input
          id="confirm-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          className="w-full px-3.5 py-2.5 text-[0.9375rem] text-[#1A1A1A] bg-white border border-[#E5E5E3] rounded-md outline-none focus:border-[#2D2D2D] transition-colors placeholder:text-[#9CA3AF]"
          placeholder="Nhập lại mật khẩu mới"
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
        {loading ? 'Đang lưu…' : 'Đặt lại mật khẩu'}
      </button>
    </form>
  );
}
