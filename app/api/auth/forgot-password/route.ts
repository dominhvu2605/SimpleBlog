import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateVerificationToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';
import type { RowDataPacket } from 'mysql2/promise';

interface UserRow extends RowDataPacket { id: number; email: string; }

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email) {
    return NextResponse.json({ error: 'Vui lòng nhập email' }, { status: 400 });
  }

  const rows = await query<UserRow>(
    'SELECT id, email FROM users WHERE email = ? AND email_verified = TRUE LIMIT 1',
    [email]
  );

  const user = rows[0];
  if (user) {
    const token      = generateVerificationToken();
    const expiresAt  = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

    await query(
      'UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?',
      [token, expiresAt.toISOString().slice(0, 19).replace('T', ' '), user.id]
    );

    try {
      await sendPasswordResetEmail(user.email, token);
    } catch (err) {
      console.error('sendPasswordResetEmail failed:', err);
    }
  }

  // Luôn trả về thành công để không lộ thông tin email có tồn tại hay không
  return NextResponse.json({
    ok: true,
    message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu trong vài phút.',
  });
}
