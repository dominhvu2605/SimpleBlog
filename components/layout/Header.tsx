'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { User } from 'lucide-react';

const NAV_LINKS = [
  { href: '/',       label: 'Home' },
  { href: '/notes',  label: 'Notes' },
  { href: '/life',   label: 'Life' },
  { href: '/about',  label: 'About' },
];

interface SessionUser {
  username: string;
  role: 'user' | 'admin';
}

export default function Header() {
  const pathname = usePathname();
  const router   = useRouter();

  // undefined = loading, null = guest, object = logged in
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const dropdownRef     = useRef<HTMLLIElement>(null);

  useEffect(() => {
    setUser(undefined);
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  // Close on navigation
  useEffect(() => { setOpen(false); }, [pathname]);

  async function handleSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setOpen(false);
    router.push('/');
    router.refresh();
  }

  return (
    <header className="border-b border-[#E5E5E3] bg-[#FAFAF8]">
      <div className="mx-auto max-w-[760px] xl:max-w-[1020px] px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-['Lora',Georgia,serif] text-[1.1rem] font-semibold text-[#1A1A1A] tracking-tight hover:opacity-70 transition-opacity"
        >
          MeoCuti
        </Link>

        {/* Navigation */}
        <nav>
          <ul className="flex items-center gap-6">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = href === '/'
                ? pathname === '/'
                : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={[
                      'text-[0.875rem] transition-colors',
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

            {/* Auth — icon khi chưa đăng nhập, username khi đã đăng nhập */}
            <li className="border-l border-[#E5E5E3] pl-6 relative" ref={dropdownRef}>
              <button
                onClick={() => user !== undefined && setOpen((v) => !v)}
                aria-label="Tài khoản"
                aria-expanded={open}
                className={[
                  'flex items-center transition-colors',
                  user === undefined
                    ? 'text-[#D1D5DB] cursor-default'
                    : user
                    ? 'text-[#1A1A1A] hover:opacity-70'
                    : 'text-[#6B7280] hover:text-[#1A1A1A]',
                ].join(' ')}
              >
                {user
                  ? <span className="text-[0.875rem] font-medium">{user.username}</span>
                  : <User size={16} strokeWidth={1.75} />}
              </button>

              {open && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-[#E5E5E3] rounded-md shadow-sm py-1 z-50">
                  {user ? (
                    <>
                      {user.role === 'admin' ? (
                        <Link
                          href="/admin"
                          className="block px-3.5 py-2 text-[0.8125rem] text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#FAFAF8] transition-colors"
                        >
                          Xem trang admin
                        </Link>
                      ) : (
                        <Link
                          href="/profile"
                          className="block px-3.5 py-2 text-[0.8125rem] text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#FAFAF8] transition-colors"
                        >
                          Xem profile
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3.5 py-2 text-[0.8125rem] text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#FAFAF8] transition-colors"
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="block px-3.5 py-2 text-[0.8125rem] text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#FAFAF8] transition-colors"
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        href="/register"
                        className="block px-3.5 py-2 text-[0.8125rem] text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#FAFAF8] transition-colors"
                      >
                        Đăng ký
                      </Link>
                    </>
                  )}
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
