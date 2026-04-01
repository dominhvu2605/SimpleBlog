import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  currentPage: number;
  totalPages: number;
  basePath: string; // e.g. "/" or "/notes"
}

export default function Pagination({ currentPage, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null;

  const href = (page: number) =>
    page === 1 ? basePath : `${basePath}?page=${page}`;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  // Page numbers to show: always show first, last, current ±1, with ellipsis
  const pages: (number | '…')[] = [];
  const range = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = [...range].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) pages.push('…');
    pages.push(sorted[i]);
  }

  return (
    <nav className="flex items-center justify-between mt-12 pt-8 border-t border-[#E5E5E3]">
      {/* Prev */}
      {hasPrev ? (
        <Link
          href={href(currentPage - 1)}
          className="inline-flex items-center gap-1.5 text-[0.875rem] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
        >
          <ChevronLeft size={15} />
          Trước
        </Link>
      ) : <span />}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-[0.8125rem] text-[#9CA3AF]">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={href(p)}
              className={[
                'w-8 h-8 flex items-center justify-center rounded text-[0.8125rem] transition-colors',
                p === currentPage
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F3F3F1]',
              ].join(' ')}
            >
              {p}
            </Link>
          )
        )}
      </div>

      {/* Next */}
      {hasNext ? (
        <Link
          href={href(currentPage + 1)}
          className="inline-flex items-center gap-1.5 text-[0.875rem] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
        >
          Sau
          <ChevronRight size={15} />
        </Link>
      ) : <span />}
    </nav>
  );
}
