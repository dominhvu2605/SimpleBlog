'use client';

import { useEffect, useRef, useState } from 'react';
import type { TocHeading } from '@/lib/toc';

interface Props {
  headings: TocHeading[];
}

export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length < 2) return;

    const ids = headings.map((h) => h.id);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Pick the topmost visible heading
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '0px 0px -70% 0px',
        threshold: 0,
      }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-20 w-[200px]">
        <p className="text-[0.6875rem] font-semibold tracking-widest uppercase text-[#9CA3AF] mb-4">
          Mục lục
        </p>
        <nav>
          <ul className="space-y-1">
            {headings.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setActiveId(h.id);
                  }}
                  className={[
                    'block text-[0.8125rem] leading-snug transition-colors py-0.5',
                    h.level === 3 ? 'pl-3' : '',
                    activeId === h.id
                      ? 'text-[#1A1A1A] font-medium'
                      : 'text-[#9CA3AF] hover:text-[#6B7280]',
                  ].join(' ')}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
