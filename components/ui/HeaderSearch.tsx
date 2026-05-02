'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import type { CategoryDef, PostSummary } from '@/types';

interface Props {
  defaultCategory?: string | null;
  categories: CategoryDef[];
}

export default function HeaderSearch({ defaultCategory, categories }: Props) {
  const [value,   setValue]   = useState('');
  const [results, setResults] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [open,    setOpen]    = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);

  const labelMap     = Object.fromEntries(categories.map((c) => [c.slug, c.label]));
  const categoryHint = defaultCategory ? (labelMap[defaultCategory] ?? defaultCategory) : null;

  // Click outside → close dropdown
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  // Escape → close + blur
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Debounced search
  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed.length < 2) { setResults([]); setLoading(false); return; }

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

  const showDropdown = open && value.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <div className="flex items-center w-44 xl:w-56 border border-[#E5E5E3] rounded-md bg-[#FAFAF8] focus-within:border-[#D1D5DB] transition-colors">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={categoryHint ? `Tìm trong "${categoryHint}"…` : 'Tìm bài viết…'}
          className="flex-1 min-w-0 text-[0.8125rem] text-[#1A1A1A] placeholder:text-[#9CA3AF] bg-transparent px-3 py-[5px] outline-none"
        />
        <button
          onClick={() => inputRef.current?.focus()}
          aria-label="Tìm kiếm"
          className="px-2.5 py-[5px] text-[#9CA3AF] hover:text-[#6B7280] transition-colors shrink-0"
        >
          <Search size={14} strokeWidth={1.75} />
        </button>
      </div>

      {showDropdown && (
        <div className="absolute left-0 top-full mt-1.5 w-80 bg-white rounded-lg shadow-xl border border-[#E5E5E3] overflow-hidden z-50">
          {loading ? (
            <p className="px-4 py-4 text-[0.8125rem] text-[#9CA3AF] text-center">Đang tìm…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-4 text-[0.8125rem] text-[#9CA3AF] text-center">Không tìm thấy kết quả nào</p>
          ) : (
            <ul>
              {results.map((post) => (
                <li key={post.slug} className="border-b border-[#E5E5E3] last:border-0">
                  <Link
                    href={`/posts/${post.slug}`}
                    onClick={() => { setOpen(false); setValue(''); }}
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
  );
}
