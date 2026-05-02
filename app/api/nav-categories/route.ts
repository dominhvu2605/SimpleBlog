import { NextResponse } from 'next/server';
import { getAllCategories } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
