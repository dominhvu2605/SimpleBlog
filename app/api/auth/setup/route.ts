/**
 * One-time admin setup endpoint.
 * POST /api/auth/setup  { username, password }
 * Returns 409 if an admin already exists — call it only once.
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import type { RowDataPacket } from 'mysql2/promise';

interface CountRow extends RowDataPacket { c: number; }

export async function POST(req: Request) {
  // Block if admin already exists
  const rows = await query<CountRow>(
    `SELECT COUNT(*) AS c FROM users WHERE role = 'admin'`
  );
  if ((rows[0]?.c ?? 0) > 0) {
    return NextResponse.json({ error: 'Admin đã tồn tại' }, { status: 409 });
  }

  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const { username, password } = body;
  if (!username?.trim() || !password || password.length < 8) {
    return NextResponse.json(
      { error: 'Username không được trống, password tối thiểu 8 ký tự' },
      { status: 400 }
    );
  }

  const hash = await hashPassword(password);
  await query(
    `INSERT INTO users (username, password_hash, role, email_verified) VALUES (?, ?, 'admin', TRUE)`,
    [username.trim(), hash]
  );

  return NextResponse.json({ ok: true, message: `Admin "${username.trim()}" đã được tạo` });
}
