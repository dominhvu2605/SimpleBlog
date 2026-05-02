import { NextResponse } from 'next/server';
import { getSession, verifyPassword, hashPassword } from '@/lib/auth';
import { query } from '@/lib/db';
import type { RowDataPacket } from 'mysql2/promise';

interface UserRow extends RowDataPacket { password_hash: string; }

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin' }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'Mật khẩu mới tối thiểu 8 ký tự' }, { status: 400 });
  }

  const rows = await query<UserRow>(
    'SELECT password_hash FROM users WHERE id = ? LIMIT 1',
    [session.userId]
  );
  const user = rows[0];
  if (!user) return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 });

  const valid = await verifyPassword(currentPassword, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: 'Mật khẩu hiện tại không đúng' }, { status: 400 });
  }

  const newHash = await hashPassword(newPassword);
  await query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, session.userId]);

  return NextResponse.json({ ok: true });
}
