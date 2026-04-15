'use client';

import { useEffect, useState } from 'react';

interface Category {
  slug: string; label: string; description: string | null;
  post_count: number; created_at: string;
}

export default function AdminCategoriesPage() {
  const [cats,    setCats]    = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // New category form
  const [newSlug, setNewSlug]  = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newDesc,  setNewDesc]  = useState('');
  const [adding,   setAdding]   = useState(false);

  // Inline edit state
  const [editSlug, setEditSlug]   = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editDesc,  setEditDesc]  = useState('');
  const [saving,    setSaving]    = useState(false);

  async function loadCats() {
    setLoading(true);
    const res  = await fetch('/api/admin/categories');
    const data = await res.json();
    setCats(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { loadCats(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError('');
    const res  = await fetch('/api/admin/categories', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ slug: newSlug, label: newLabel, description: newDesc }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); }
    else { setNewSlug(''); setNewLabel(''); setNewDesc(''); await loadCats(); }
    setAdding(false);
  }

  function startEdit(cat: Category) {
    setEditSlug(cat.slug);
    setEditLabel(cat.label);
    setEditDesc(cat.description ?? '');
  }

  async function handleSave(slug: string) {
    setSaving(true);
    setError('');
    const res  = await fetch(`/api/admin/categories/${slug}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ label: editLabel, description: editDesc }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); }
    else { setEditSlug(null); await loadCats(); }
    setSaving(false);
  }

  async function handleDelete(slug: string, label: string) {
    if (!confirm(`Xóa category "${label}"?`)) return;
    const res  = await fetch(`/api/admin/categories/${slug}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { setError(data.error); }
    else { await loadCats(); }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-[1.75rem] font-semibold text-[#1A1A1A] mb-1">Category</h1>
        <p className="text-[0.9375rem] text-[#6B7280]">Quản lý danh mục bài viết.</p>
      </div>

      {error && (
        <p className="text-[0.875rem] text-red-500 mb-4">{error}</p>
      )}

      {/* Add new category */}
      <form onSubmit={handleAdd} className="mb-8 p-5 border border-[#E5E5E3] rounded-lg space-y-4">
        <p className="text-[0.8125rem] font-medium text-[#1A1A1A]">Thêm category mới</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="sm:w-36">
            <label className="block text-[0.75rem] text-[#9CA3AF] mb-1">Slug</label>
            <input
              type="text" required value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="my-category"
              className="w-full px-3 py-2 text-[0.875rem] font-mono border border-[#E5E5E3] rounded-md outline-none focus:border-[#2D2D2D] transition-colors"
            />
          </div>
          <div className="sm:w-40">
            <label className="block text-[0.75rem] text-[#9CA3AF] mb-1">Label</label>
            <input
              type="text" required value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Tên hiển thị"
              className="w-full px-3 py-2 text-[0.875rem] border border-[#E5E5E3] rounded-md outline-none focus:border-[#2D2D2D] transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[0.75rem] text-[#9CA3AF] mb-1">Mô tả (tùy chọn)</label>
            <input
              type="text" value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Mô tả ngắn"
              className="w-full px-3 py-2 text-[0.875rem] border border-[#E5E5E3] rounded-md outline-none focus:border-[#2D2D2D] transition-colors"
            />
          </div>
          <div className="flex sm:items-end">
            <button
              type="submit" disabled={adding}
              className="w-full sm:w-auto px-4 py-2 text-[0.875rem] font-medium bg-[#1A1A1A] text-white rounded-md hover:bg-[#2D2D2D] disabled:opacity-50 transition-colors"
            >
              {adding ? '…' : '+ Thêm'}
            </button>
          </div>
        </div>
      </form>

      {/* Category list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-[#E5E5E3] rounded animate-pulse" />)}
        </div>
      ) : (
        <div className="border border-[#E5E5E3] rounded-lg overflow-x-auto">
          <table className="w-full text-[0.8125rem] min-w-[480px]">
            <thead className="bg-[#FAFAF8] border-b border-[#E5E5E3]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[#6B7280] w-32">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B7280]">Label</th>
                <th className="text-left px-4 py-3 font-medium text-[#6B7280]">Mô tả</th>
                <th className="text-right px-4 py-3 font-medium text-[#6B7280] w-20">Bài viết</th>
                <th className="px-4 py-3 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E3]">
              {cats.map((cat) => (
                <tr key={cat.slug} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-4 py-3 font-mono text-[#6B7280]">{cat.slug}</td>
                  {editSlug === cat.slug ? (
                    <>
                      <td className="px-4 py-2">
                        <input
                          value={editLabel} onChange={(e) => setEditLabel(e.target.value)}
                          className="w-full px-2 py-1 text-[0.8125rem] border border-[#E5E5E3] rounded outline-none focus:border-[#2D2D2D]"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                          className="w-full px-2 py-1 text-[0.8125rem] border border-[#E5E5E3] rounded outline-none focus:border-[#2D2D2D]"
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-[#1A1A1A]">{cat.label}</td>
                      <td className="px-4 py-3 text-[#9CA3AF]">{cat.description ?? '—'}</td>
                    </>
                  )}
                  <td className="px-4 py-3 text-right text-[#6B7280]">{cat.post_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {editSlug === cat.slug ? (
                        <>
                          <button
                            onClick={() => handleSave(cat.slug)} disabled={saving}
                            className="text-[#1A1A1A] hover:opacity-70 disabled:opacity-40 transition-opacity"
                          >
                            {saving ? '…' : 'Lưu'}
                          </button>
                          <button
                            onClick={() => setEditSlug(null)}
                            className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                          >
                            Hủy
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(cat)}
                            className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(cat.slug, cat.label)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            Xóa
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
