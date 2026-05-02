'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import type { CategoryDef, PostSummary } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  defaultCategory?: string | null;
  categories: CategoryDef[];
}

export default function SearchOverlay({ open, onClose, defaultCategory, categories }: Props) {
  const [value,   setValue]   = useState('');
  const [results, setResults] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const labelMap    = Object.fromEntries(categories.map((c) => [c.slug, c.label]));
  const categoryHint = defaultCategory ? (labelMap[defaultCategory] ?? defaultCategory) : null;

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Focus + reset on open
  useEffect(() => {
    if (!open) return;
    setValue('');
    setResults([]);
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Debounced search
  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const qs = new URLSearchParams({ q: trimmed });
    if (defaultCategory) qs.set('category', defaultCategory);

    const timer = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/search?${qs}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, defaultCategory]);

  if (!open) return null;

  const showResults = value.trim().length >= 2;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute top-[18vh] left-1/2 -translate-x-1/2 w-full max-w-[560px] px-4">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden ring-1 ring-black/5">

          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Search size={16} strokeWidth={1.75} className="text-[#9CA3AF] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={categoryHint ? `Tìm trong "${categoryHint}"…` : 'Tìm bài viết…'}
              className="flex-1 text-[0.9375rem] text-[#1A1A1A] placeholder:text-[#9CA3AF] bg-transparent outline-none"
            />
            <button
              onClick={onClose}
              aria-label="Đóng tìm kiếm"
              className="text-[#9CA3AF] hover:text-[#6B7280] transition-colors shrink-0"
            >
              <X size={16} strokeWidth={1.75} />
            </button>
          </div>

          {/* Results */}
          {showResults && (
            <div className="border-t border-[#E5E5E3] max-h-[400px] overflow-y-auto">
              {loading ? (
                <p className="px-4 py-5 text-[0.8125rem] text-[#9CA3AF] text-center">Đang tìm…</p>
              ) : results.length === 0 ? (
                <p className="px-4 py-5 text-[0.8125rem] text-[#9CA3AF] text-center">
                  Không tìm thấy kết quả nào
                </p>
              ) : (
                <ul>
                  {results.map((post) => (
                    <li key={post.slug} className="border-b border-[#E5E5E3] last:border-0">
                      <Link
                        href={`/posts/${post.slug}`}
                        onClick={onClose}
                        className="flex flex-col gap-1 px-4 py-3 hover:bg-[#FAFAF8] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-[0.875rem] font-medium text-[#1A1A1A] leading-snug line-clamp-1">
                            {post.title}
                          </span>
                          <span className="text-[0.6875rem] text-[#6B7280] bg-[#F3F4F6] rounded px-1.5 py-0.5 shrink-0 mt-px whitespace-nowrap">
                            {labelMap[post.category] ?? post.category}
                          </span>
                        </div>
                        <p className="text-[0.8125rem] text-[#6B7280] line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
