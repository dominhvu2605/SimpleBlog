import { NextResponse } from 'next/server';
import { getSession, setSessionCookie } from '@/lib/auth';
import { query } from '@/lib/db';
import type { RowDataPacket } from 'mysql2/promise';

interface CountRow extends RowDataPacket { c: number; }

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });

  let body: { username?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const newUsername = body.username?.trim();
  if (!newUsername) {
    return NextResponse.json({ error: 'Tên đăng nhập không được để trống' }, { status: 400 });
  }

  if (newUsername === session.username) {
    return NextResponse.json({ ok: true, username: newUsername });
  }

  const existing = await query<CountRow>(
    'SELECT COUNT(*) AS c FROM users WHERE username = ? AND id != ?',
    [newUsername, session.userId]
  );
  if ((existing[0]?.c ?? 0) > 0) {
    return NextResponse.json({ error: 'Tên đăng nhập đã được sử dụng' }, { status: 409 });
  }

  await query('UPDATE users SET username = ? WHERE id = ?', [newUsername, session.userId]);

  await setSessionCookie({
    ...session,
    username: newUsername,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true, username: newUsername });
}
