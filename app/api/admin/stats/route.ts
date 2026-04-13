import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin, periodToInterval, type Period } from '@/lib/admin';
import type { RowDataPacket } from 'mysql2/promise';

interface CountRow extends RowDataPacket { c: number; }
interface TopPostRow extends RowDataPacket { title: string; slug: string; views: number; }

const PERIODS: Period[] = ['day', 'week', 'month', 'year'];

async function countSince(table: string, dateCol: string, interval: string): Promise<number> {
  const rows = await query<CountRow>(
    `SELECT COUNT(*) AS c FROM ${table} WHERE ${dateCol} >= NOW() - ${interval}`
  );
  return rows[0]?.c ?? 0;
}

async function topPosts(interval: string, limit = 5): Promise<TopPostRow[]> {
  return query<TopPostRow>(
    `SELECT p.title, p.slug, COUNT(pv.id) AS views
     FROM post_views pv
     JOIN posts p ON p.id = pv.post_id
     WHERE pv.viewed_at >= NOW() - ${interval}
     GROUP BY p.id
     ORDER BY views DESC
     LIMIT ${Math.trunc(limit)}`
  );
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const [newUsers, postViews, newPosts, topPostsData] = await Promise.all([
    Promise.all(PERIODS.map((p) => countSince('users', 'created_at', periodToInterval(p)))),
    Promise.all(PERIODS.map((p) => countSince('post_views', 'viewed_at', periodToInterval(p)))),
    Promise.all(PERIODS.map((p) => countSince('posts', 'created_at', periodToInterval(p)))),
    Promise.all(PERIODS.map((p) => topPosts(periodToInterval(p)))),
  ]);

  const toObj = (arr: number[]) =>
    Object.fromEntries(PERIODS.map((p, i) => [p, arr[i]]));

  return NextResponse.json({
    newUsers:  toObj(newUsers),
    postViews: toObj(postViews),
    newPosts:  toObj(newPosts),
    topPosts:  Object.fromEntries(PERIODS.map((p, i) => [p, topPostsData[i]])),
  });
}
