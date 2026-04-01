'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

  // undefined = loading (show nothing), null = guest, object = logged in
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, []);

  async function handleSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
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

            {/* Auth — chỉ render sau khi biết trạng thái (tránh flash) */}
            {user !== undefined && (
              <li className="flex items-center gap-4 border-l border-[#E5E5E3] pl-6">
                {user ? (
                  <>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className={[
                          'text-[0.875rem] transition-colors',
                          pathname === '/admin'
                            ? 'text-[#1A1A1A] font-medium'
                            : 'text-[#6B7280] hover:text-[#1A1A1A]',
                        ].join(' ')}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="text-[0.875rem] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className={[
                      'text-[0.875rem] transition-colors',
                      pathname === '/login'
                        ? 'text-[#1A1A1A] font-medium'
                        : 'text-[#6B7280] hover:text-[#1A1A1A]',
                    ].join(' ')}
                  >
                    Đăng nhập
                  </Link>
                )}
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
