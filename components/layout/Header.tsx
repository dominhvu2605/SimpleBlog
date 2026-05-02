'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, User, X } from 'lucide-react';
import type { CategoryDef } from '@/types';

interface SessionUser {
  username: string;
  role: 'user' | 'admin';
}

function categoryHref(slug: string) {
  return `/category/${slug}`;
}

// Active check: cover both /category/<slug>
function isCategoryActive(slug: string, pathname: string) {
  return (
    pathname.startsWith(`/category/${slug}`) ||
    pathname === `/${slug}` ||
    pathname.startsWith(`/${slug}/`)
  );
}

export default function Header() {
  const pathname = usePathname();
  const router   = useRouter();

  const [user, setUser]               = useState<SessionUser | null | undefined>(undefined);
  const [categories, setCategories]   = useState<CategoryDef[]>([]);
  const [open, setOpen]               = useState(false);
  const [catOpen, setCatOpen]         = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);

  const dropdownRef    = useRef<HTMLLIElement>(null);
  const catDropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    setUser(undefined);
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  useEffect(() => {
    fetch('/api/nav-categories')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  useEffect(() => {
    setOpen(false);
    setCatOpen(false);
    setMobileOpen(false);
    setMobileCatOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setOpen(false);
    router.push('/');
    router.refresh();
  }

  const anyCatActive = categories.some((cat) => isCategoryActive(cat.slug, pathname));

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

        {/* Desktop navigation (sm+) */}
        <nav className="hidden sm:block">
          <ul className="flex items-center gap-6">

            {/* Home */}
            <li>
              <Link
                href="/"
                className={[
                  'text-[0.875rem] transition-colors',
                  pathname === '/'
                    ? 'text-[#1A1A1A] font-medium'
                    : 'text-[#6B7280] hover:text-[#1A1A1A]',
                ].join(' ')}
              >
                Home
              </Link>
            </li>

            {/* Categories dropdown */}
            {categories.length > 0 && (
              <li className="relative" ref={catDropdownRef}>
                <button
                  onClick={() => { setCatOpen((v) => !v); setOpen(false); }}
                  aria-expanded={catOpen}
                  className={[
                    'flex items-center gap-1 text-[0.875rem] transition-colors',
                    anyCatActive
                      ? 'text-[#1A1A1A] font-medium'
                      : 'text-[#6B7280] hover:text-[#1A1A1A]',
                  ].join(' ')}
                >
                  Categories
                  <ChevronDown
                    size={13}
                    strokeWidth={2}
                    className={`transition-transform duration-150 ${catOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {catOpen && (
                  <div className="absolute left-0 top-full mt-2 w-44 bg-white border border-[#E5E5E3] rounded-md shadow-sm py-1 z-50">
                    {categories.map((cat) => {
                      const href    = categoryHref(cat.slug);
                      const active  = isCategoryActive(cat.slug, pathname);
                      return (
                        <Link
                          key={cat.slug}
                          href={href}
                          className={[
                            'block px-3.5 py-2 text-[0.8125rem] transition-colors',
                            active
                              ? 'text-[#1A1A1A] font-medium bg-[#FAFAF8]'
                              : 'text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#FAFAF8]',
                          ].join(' ')}
                        >
                          {cat.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </li>
            )}

            {/* About */}
            <li>
              <Link
                href="/about"
                className={[
                  'text-[0.875rem] transition-colors',
                  pathname.startsWith('/about')
                    ? 'text-[#1A1A1A] font-medium'
                    : 'text-[#6B7280] hover:text-[#1A1A1A]',
                ].join(' ')}
              >
                About
              </Link>
            </li>

            {/* Auth */}
            <li className="border-l border-[#E5E5E3] pl-6 relative" ref={dropdownRef}>
              <button
                onClick={() => user !== undefined && (setOpen((v) => !v), setCatOpen(false))}
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

        {/* Mobile hamburger button (< sm) */}
        <button
          className="sm:hidden flex items-center text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Mở menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
        </button>
      </div>

      {/* Mobile navigation dropdown (< sm) */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-[#E5E5E3] bg-[#FAFAF8] px-6 py-4">
          <nav>
            <ul className="space-y-1">

              {/* Home */}
              <li>
                <Link
                  href="/"
                  className={[
                    'block py-2 text-[0.9375rem] transition-colors',
                    pathname === '/'
                      ? 'text-[#1A1A1A] font-medium'
                      : 'text-[#6B7280] hover:text-[#1A1A1A]',
                  ].join(' ')}
                >
                  Home
                </Link>
              </li>

              {/* Categories (collapsible) */}
              {categories.length > 0 && (
                <li>
                  <button
                    onClick={() => setMobileCatOpen((v) => !v)}
                    className={[
                      'flex items-center gap-1 w-full py-2 text-[0.9375rem] transition-colors',
                      anyCatActive
                        ? 'text-[#1A1A1A] font-medium'
                        : 'text-[#6B7280] hover:text-[#1A1A1A]',
                    ].join(' ')}
                  >
                    Categories
                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      className={`transition-transform duration-150 ${mobileCatOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {mobileCatOpen && (
                    <ul className="pl-4">
                      {categories.map((cat) => {
                        const href   = categoryHref(cat.slug);
                        const active = isCategoryActive(cat.slug, pathname);
                        return (
                          <li key={cat.slug}>
                            <Link
                              href={href}
                              className={[
                                'block py-2 text-[0.875rem] transition-colors',
                                active
                                  ? 'text-[#1A1A1A] font-medium'
                                  : 'text-[#6B7280] hover:text-[#1A1A1A]',
                              ].join(' ')}
                            >
                              {cat.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              )}

              {/* About */}
              <li>
                <Link
                  href="/about"
                  className={[
                    'block py-2 text-[0.9375rem] transition-colors',
                    pathname.startsWith('/about')
                      ? 'text-[#1A1A1A] font-medium'
                      : 'text-[#6B7280] hover:text-[#1A1A1A]',
                  ].join(' ')}
                >
                  About
                </Link>
              </li>

              {/* Auth */}
              <li className="border-t border-[#E5E5E3] pt-3 mt-2">
                {user === undefined ? null : user ? (
                  <div className="space-y-1">
                    {user.role === 'admin' ? (
                      <Link
                        href="/admin"
                        className="block py-2 text-[0.9375rem] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                      >
                        Trang admin
                      </Link>
                    ) : (
                      <Link
                        href="/profile"
                        className="block py-2 text-[0.9375rem] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                      >
                        {user.username}
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left py-2 text-[0.9375rem] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                    >
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Link
                      href="/login"
                      className="block py-2 text-[0.9375rem] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      href="/register"
                      className="block py-2 text-[0.9375rem] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                    >
                      Đăng ký
                    </Link>
                  </div>
                )}
              </li>

            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
