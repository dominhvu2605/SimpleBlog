import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { requireAdmin } from '@/lib/admin';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED  = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];

// ─── POST /api/admin/upload — save file to /public/uploads/ ──────
export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  let formData: FormData;
  try { formData = await req.formData(); } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'Không có file được gửi lên' }, { status: 400 });
  }

  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: 'Chỉ hỗ trợ ảnh (JPEG, PNG, GIF, WebP) và video (MP4, WebM)' },
      { status: 415 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File không được vượt quá 10 MB' }, { status: 413 });
  }

  const bytes  = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Sanitize filename: keep only safe characters
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename  = `${Date.now()}-${safeName}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads');

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
