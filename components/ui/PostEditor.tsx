'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface CategoryOption { slug: string; label: string; }

interface PostEditorProps {
  mode: 'new' | 'edit';
  postId?: number;
  initial?: {
    title: string; slug: string; excerpt: string; content: string;
    category: string; published: boolean;
  };
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function PostEditor({ mode, postId, initial }: PostEditorProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    title:     initial?.title     ?? '',
    slug:      initial?.slug      ?? '',
    excerpt:   initial?.excerpt   ?? '',
    content:   initial?.content   ?? '',
    category:  initial?.category  ?? '',
    published: initial?.published ?? false,
  });
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [error,      setError]      = useState('');
  const [saving,     setSaving]     = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [dragOver,   setDragOver]   = useState(false);
  const [preview,    setPreview]    = useState(false);
  const [html,       setHtml]       = useState('');
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Load categories
  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((data: Array<{ slug: string; label: string }>) => {
        setCategories(data);
        if (!form.category && data.length > 0) {
          setForm((f) => ({ ...f, category: data[0].slug }));
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-generate slug from title in new mode
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    setForm((f) => ({
      ...f,
      title,
      ...(mode === 'new' ? { slug: toSlug(title) } : {}),
    }));
  }

  // ─── File upload helper ────────────────────────────────────────
  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Upload thất bại'); return; }

      const url     = data.url as string;
      const isVideo = file.type.startsWith('video/');
      const snippet = isVideo
        ? `\n<video src="${url}" controls style="max-width:100%"></video>\n`
        : `\n![${file.name}](${url})\n`;

      // Insert at cursor position
      const ta    = contentRef.current;
      const start = ta?.selectionStart ?? form.content.length;
      const end   = ta?.selectionEnd   ?? form.content.length;
      const next  = form.content.slice(0, start) + snippet + form.content.slice(end);
      setForm((f) => ({ ...f, content: next }));
    } finally {
      setUploading(false);
    }
  }, [form.content]);

  // ─── Drag & drop ──────────────────────────────────────────────
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }
  function handleDragLeave() { setDragOver(false); }
  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) await uploadFile(file);
  }

  // ─── Preview ──────────────────────────────────────────────────
  async function togglePreview() {
    if (!preview) {
      const { renderMarkdown } = await import('@/lib/toc');
      setHtml(await renderMarkdown(form.content));
    }
    setPreview((v) => !v);
  }

  // ─── Submit ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Estimate reading time (~200 wpm)
    const words        = form.content.split(/\s+/).filter(Boolean).length;
    const reading_time = Math.max(1, Math.round(words / 200));

    const url    = mode === 'new' ? '/api/admin/posts' : `/api/admin/posts/${postId}`;
    const method = mode === 'new' ? 'POST'             : 'PUT';

    const res  = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, reading_time }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Lỗi không xác định');
    } else {
      router.push('/admin/posts');
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-[0.8125rem] font-medium text-[#1A1A1A] mb-1.5">Tiêu đề</label>
        <input
          type="text" required value={form.title} onChange={handleTitleChange}
          className="w-full px-3.5 py-2.5 text-[0.9375rem] border border-[#E5E5E3] rounded-md outline-none focus:border-[#2D2D2D] transition-colors"
          placeholder="Tiêu đề bài viết"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-[0.8125rem] font-medium text-[#1A1A1A] mb-1.5">Slug</label>
        <input
          type="text" required value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          className="w-full px-3.5 py-2.5 text-[0.9375rem] font-mono border border-[#E5E5E3] rounded-md outline-none focus:border-[#2D2D2D] transition-colors text-[#6B7280]"
          placeholder="url-slug-bai-viet"
        />
      </div>

      {/* Category + Published row */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-[0.8125rem] font-medium text-[#1A1A1A] mb-1.5">Danh mục</label>
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="w-full px-3.5 py-2.5 text-[0.9375rem] border border-[#E5E5E3] rounded-md outline-none focus:border-[#2D2D2D] transition-colors bg-white"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-2.5 gap-2">
          <input
            type="checkbox" id="published" checked={form.published}
            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            className="w-4 h-4 accent-[#1A1A1A]"
          />
          <label htmlFor="published" className="text-[0.875rem] text-[#1A1A1A] cursor-pointer select-none">
            Xuất bản
          </label>
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-[0.8125rem] font-medium text-[#1A1A1A] mb-1.5">Tóm tắt</label>
        <textarea
          required rows={2} value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          className="w-full px-3.5 py-2.5 text-[0.9375rem] border border-[#E5E5E3] rounded-md outline-none focus:border-[#2D2D2D] transition-colors resize-none"
          placeholder="Mô tả ngắn về bài viết"
        />
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[0.8125rem] font-medium text-[#1A1A1A]">
            Nội dung (Markdown)
            {uploading && <span className="ml-2 text-[#9CA3AF] font-normal">Đang upload…</span>}
          </label>
          <button
            type="button" onClick={togglePreview}
            className="text-[0.8125rem] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
          >
            {preview ? 'Chỉnh sửa' : 'Xem trước'}
          </button>
        </div>

        {preview ? (
          <div
            className="prose min-h-[400px] p-4 border border-[#E5E5E3] rounded-md overflow-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div
            className={[
              'relative rounded-md border transition-colors',
              dragOver ? 'border-[#2D2D2D] bg-[#FAFAF8]' : 'border-[#E5E5E3]',
            ].join(' ')}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {dragOver && (
              <div className="absolute inset-0 flex items-center justify-center text-[0.875rem] text-[#6B7280] pointer-events-none z-10 bg-[#FAFAF8]/80 rounded-md">
                Thả file để upload
              </div>
            )}
            <textarea
              ref={contentRef}
              required
              rows={20}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              className="w-full px-3.5 py-2.5 text-[0.875rem] font-mono outline-none resize-y bg-transparent rounded-md"
              placeholder="Nội dung bài viết bằng Markdown…&#10;&#10;Kéo thả ảnh/video vào đây để upload."
            />
          </div>
        )}
        <p className="mt-1.5 text-[0.75rem] text-[#9CA3AF]">
          Kéo thả ảnh (JPEG, PNG, WebP, GIF) hoặc video (MP4, WebM) vào khung trên để upload. Tối đa 10 MB/file.
        </p>
      </div>

      {error && <p className="text-[0.875rem] text-red-500">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit" disabled={saving}
          className="px-6 py-2.5 text-[0.9375rem] font-medium text-white bg-[#1A1A1A] rounded-md hover:bg-[#2D2D2D] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Đang lưu…' : mode === 'new' ? 'Tạo bài viết' : 'Lưu thay đổi'}
        </button>
        <a
          href="/admin/posts"
          className="px-6 py-2.5 text-[0.9375rem] border border-[#E5E5E3] rounded-md text-[#6B7280] hover:text-[#1A1A1A] hover:border-[#2D2D2D] transition-colors"
        >
          Hủy
        </a>
      </div>
    </form>
  );
}
