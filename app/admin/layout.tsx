'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/admin',            label: 'Dashboard' },
  { href: '/admin/posts',      label: 'Bài viết' },
  { href: '/admin/categories', label: 'Category' },
  { href: '/admin/comments',   label: 'Bình luận' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-[1020px] px-6 py-10">
      <div className="flex flex-col gap-8 md:flex-row md:gap-10">
        {/* Sidebar */}
        <aside className="md:w-36 md:shrink-0">
          <p className="text-[0.7rem] font-medium text-[#9CA3AF] tracking-widest uppercase mb-3">
            Quản trị
          </p>
          <nav>
            <ul className="flex gap-4 md:flex-col md:gap-0 md:space-y-1 overflow-x-auto pb-1 md:pb-0">
              {NAV.map(({ href, label }) => {
                const isActive = href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(href);
                return (
                  <li key={href} className="shrink-0">
                    <Link
                      href={href}
                      className={[
                        'block py-1.5 text-[0.8125rem] transition-colors whitespace-nowrap',
                        isActive
                          ? 'text-[#1A1A1A] font-medium'
                          : 'text-[#6B7280] hover:text-[#1A1A1A]',
                      ].join(' ')}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
              <li className="shrink-0 md:hidden">
                <Link
                  href="/"
                  className="block py-1.5 text-[0.8125rem] text-[#6B7280] hover:text-[#1A1A1A] transition-colors whitespace-nowrap"
                >
                  ← Trang chủ
                </Link>
              </li>
            </ul>
          </nav>
          <div className="hidden md:block mt-6 pt-6 border-t border-[#E5E5E3]">
            <Link
              href="/"
              className="text-[0.8125rem] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
            >
              ← Trang chủ
            </Link>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
