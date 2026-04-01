import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, setSessionCookie } from '@/lib/auth';
import type { UserRole } from '@/lib/auth';
import type { RowDataPacket } from 'mysql2/promise';

interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
  role: UserRole;
}

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const { username, password } = body;
  if (!username?.trim() || !password) {
    return NextResponse.json({ error: 'Vui lòng nhập đầy đủ thông tin' }, { status: 400 });
  }

  const rows = await query<UserRow>(
    'SELECT id, username, password_hash, role FROM users WHERE username = ? LIMIT 1',
    [username.trim()]
  );

  const user = rows[0];
  const valid = user ? await verifyPassword(password, user.password_hash) : false;

  // Same error for wrong username OR wrong password (prevent user enumeration)
  if (!user || !valid) {
    return NextResponse.json(
      { error: 'Tên đăng nhập hoặc mật khẩu không đúng' },
      { status: 401 }
    );
  }

  await setSessionCookie({
    userId:   user.id,
    username: user.username,
    role:     user.role,
    exp:      Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true, role: user.role, username: user.username });
}
