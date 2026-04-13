export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { query } from '@/lib/db';
import type { RowDataPacket } from 'mysql2/promise';

interface TokenRow extends RowDataPacket {
  id: number;
  token_expires_at: string;
}

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <Result type="invalid" />;
  }

  const rows = await query<TokenRow>(
    `SELECT id, token_expires_at
     FROM users
     WHERE verification_token = ? AND email_verified = FALSE
     LIMIT 1`,
    [token]
  );

  const user = rows[0];

  if (!user) {
    return <Result type="invalid" />;
  }

  const expiresAt = new Date(user.token_expires_at);
  if (expiresAt < new Date()) {
    return <Result type="expired" />;
  }

  await query(
    `UPDATE users
     SET email_verified = TRUE, verification_token = NULL, token_expires_at = NULL
     WHERE id = ?`,
    [user.id]
  );

  return <Result type="success" />;
}

// ─── UI ──────────────────────────────────────────────────────────

function Result({ type }: { type: 'success' | 'invalid' | 'expired' }) {
  const config = {
    success: {
      heading: 'Email đã được xác nhận',
      body:    'Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.',
      cta:     { href: '/login', label: 'Đăng nhập' },
    },
    invalid: {
      heading: 'Liên kết không hợp lệ',
      body:    'Liên kết xác nhận không tồn tại hoặc đã được sử dụng.',
      cta:     { href: '/', label: 'Về trang chủ' },
    },
    expired: {
      heading: 'Liên kết đã hết hạn',
      body:    'Liên kết xác nhận chỉ có hiệu lực trong 24 giờ. Vui lòng đăng ký lại.',
      cta:     { href: '/register', label: 'Đăng ký lại' },
    },
  }[type];

  return (
    <div className="mx-auto max-w-[760px] xl:max-w-[1020px] px-6 py-24">
      <div className="max-w-[360px] mx-auto space-y-4">
        <h1 className="font-serif text-[1.75rem] font-semibold text-[#1A1A1A]">
          {config.heading}
        </h1>
        <p className="text-[0.9375rem] text-[#6B7280]">{config.body}</p>
        <Link
          href={config.cta.href}
          className="inline-block mt-4 text-[0.9375rem] font-medium text-[#1A1A1A] underline underline-offset-2"
        >
          {config.cta.label}
        </Link>
      </div>
    </div>
  );
}
