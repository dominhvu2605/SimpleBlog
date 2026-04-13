import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

// ─── Auth guard — returns session or a 401/403 Response ──────────
export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return { session: null, error: NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 }) };
  }
  if (session.role !== 'admin') {
    return { session: null, error: NextResponse.json({ error: 'Không có quyền' }, { status: 403 }) };
  }
  return { session, error: null };
}

// ─── Date-range SQL helper ────────────────────────────────────────
export type Period = 'day' | 'week' | 'month' | 'year';

export function periodToInterval(period: Period): string {
  const map: Record<Period, string> = {
    day:   'INTERVAL 1 DAY',
    week:  'INTERVAL 7 DAY',
    month: 'INTERVAL 30 DAY',
    year:  'INTERVAL 365 DAY',
  };
  return map[period];
}
