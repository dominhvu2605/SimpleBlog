'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  username: string;
}

export default function ProfileForms({ username }: Props) {
  const router = useRouter();

  // ─── Đổi tên đăng nhập ───────────────────────────────────────────
  const [newUsername, setNewUsername]     = useState(username);
  const [usernameMsg, setUsernameMsg]     = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);

  async function handleUsernameSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUsernameLoading(true);
    setUsernameMsg('');
    setUsernameError('');

    try {
      const res = await fetch('/api/auth/profile', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username: newUsername }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUsernameError(data.error ?? 'Cập nhật thất bại');
      } else {
        setUsernameMsg('Đã cập nhật tên đăng nhập.');
        router.refresh();
      }
    } catch {
      setUsernameError('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setUsernameLoading(false);
    }
  }

  // ─── Đổi mật khẩu ────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg]   = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg('');
    setPwError('');

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Mật khẩu mới không khớp');
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword:     pwForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error ?? 'Đổi mật khẩu thất bại');
      } else {
        setPwMsg('Mật khẩu đã được cập nhật.');
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch {
      setPwError('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="space-y-12">
      {/* ── Đổi tên đăng nhập ── */}
      <section>
        <h2 className="text-[0.8125rem] font-medium text-[#6B7280] tracking-widest uppercase mb-6">
          Đổi tên đăng nhập
        </h2>
        <form onSubmit={handleUsernameSubmit} className="space-y-4 max-w-[360px]">
          <div>
            <label
              htmlFor="new-username"
              className="block text-[0.8125rem] font-medium text-[#1A1A1A] mb-1.5"
            >
              Tên đăng nhập mới
            </label>
            <input
              id="new-username"
              type="text"
              required
              maxLength={100}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 text-[0.9375rem] text-[#1A1A1A] bg-white border border-[#E5E5E3] rounded-md outline-none focus:border-[#2D2D2D] transition-colors"
            />
          </div>

          {usernameError && (
            <p className="text-[0.875rem] text-red-500">{usernameError}</p>
          )}
          {usernameMsg && (
            <p className="text-[0.875rem] text-green-600">{usernameMsg}</p>
          )}

          <button
            type="submit"
            disabled={usernameLoading}
            className="px-4 py-2 text-[0.875rem] font-medium text-white bg-[#1A1A1A] rounded-md hover:bg-[#2D2D2D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {usernameLoading ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </form>
      </section>

      {/* ── Đổi mật khẩu ── */}
      <section>
        <h2 className="text-[0.8125rem] font-medium text-[#6B7280] tracking-widest uppercase mb-6">
          Đổi mật khẩu
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-[360px]">
          <div>
            <label
              htmlFor="current-password"
              className="block text-[0.8125rem] font-medium text-[#1A1A1A] mb-1.5"
            >
              Mật khẩu hiện tại
            </label>
            <input
              id="current-password"
              type="password"
              required
              autoComplete="current-password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 text-[0.9375rem] text-[#1A1A1A] bg-white border border-[#E5E5E3] rounded-md outline-none focus:border-[#2D2D2D] transition-colors placeholder:text-[#9CA3AF]"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="block text-[0.8125rem] font-medium text-[#1A1A1A] mb-1.5"
            >
              Mật khẩu mới
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
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
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 text-[0.9375rem] text-[#1A1A1A] bg-white border border-[#E5E5E3] rounded-md outline-none focus:border-[#2D2D2D] transition-colors placeholder:text-[#9CA3AF]"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          {pwError && (
            <p className="text-[0.875rem] text-red-500">{pwError}</p>
          )}
          {pwMsg && (
            <p className="text-[0.875rem] text-green-600">{pwMsg}</p>
          )}

          <button
            type="submit"
            disabled={pwLoading}
            className="px-4 py-2 text-[0.875rem] font-medium text-white bg-[#1A1A1A] rounded-md hover:bg-[#2D2D2D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pwLoading ? 'Đang lưu…' : 'Đổi mật khẩu'}
          </button>
        </form>
      </section>
    </div>
  );
}
