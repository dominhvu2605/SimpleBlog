import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, generateVerificationToken } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';
import type { RowDataPacket } from 'mysql2/promise';

interface CountRow extends RowDataPacket { c: number; }

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { username?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const { username, email, password } = body;

  if (!username?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Mật khẩu tối thiểu 8 ký tự' }, { status: 400 });
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 });
  }

  // Check uniqueness
  const existing = await query<CountRow>(
    'SELECT COUNT(*) AS c FROM users WHERE username = ? OR email = ?',
    [username.trim(), email.trim()]
  );
  if ((existing[0]?.c ?? 0) > 0) {
    return NextResponse.json(
      { error: 'Tên đăng nhập hoặc email đã được sử dụng' },
      { status: 409 }
    );
  }

  const passwordHash  = await hashPassword(password);
  const token         = generateVerificationToken();
  const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

  await query(
    `INSERT INTO users
       (username, email, password_hash, role, email_verified, verification_token, token_expires_at)
     VALUES (?, ?, ?, 'user', FALSE, ?, ?)`,
    [username.trim(), email.trim(), passwordHash, token, tokenExpiresAt]
  );

  try {
    await sendVerificationEmail(email.trim(), token);
  } catch (err) {
    console.error('sendVerificationEmail failed:', err);
    // Account created; email send failure is non-fatal — user can contact support.
  }

  return NextResponse.json({
    ok: true,
    message: 'Đăng ký thành công! Kiểm tra email để xác nhận tài khoản.',
  });
}
