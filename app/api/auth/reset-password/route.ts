import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import type { RowDataPacket } from 'mysql2/promise';

interface TokenRow extends RowDataPacket { id: number; reset_token_expires_at: string; }

export async function POST(req: Request) {
  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const { token, password } = body;
  if (!token || !password) {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Mật khẩu tối thiểu 8 ký tự' }, { status: 400 });
  }

  const rows = await query<TokenRow>(
    'SELECT id, reset_token_expires_at FROM users WHERE reset_token = ? LIMIT 1',
    [token]
  );
  const user = rows[0];
  if (!user) {
    return NextResponse.json(
      { error: 'Liên kết không hợp lệ hoặc đã được sử dụng' },
      { status: 400 }
    );
  }

  if (new Date(user.reset_token_expires_at) < new Date()) {
    return NextResponse.json(
      { error: 'Liên kết đã hết hạn. Vui lòng yêu cầu đặt lại mật khẩu lại.' },
      { status: 400 }
    );
  }

  const newHash = await hashPassword(password);
  await query(
    'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?',
    [newHash, user.id]
  );

  return NextResponse.json({ ok: true });
}
