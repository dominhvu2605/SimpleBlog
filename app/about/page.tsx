import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description: 'Đôi điều về tôi.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[760px] xl:max-w-[1020px] px-6 py-16">
      <article>
        <header className="mb-10">
          <h1 className="font-serif text-[2rem] font-semibold text-[#1A1A1A] leading-tight">
            About
          </h1>
        </header>

        <hr className="border-[#E5E5E3] mb-10" />

        <div className="prose">
          <p>
            Xin chào. Tôi là <strong>MeoCuti</strong> — một người thích quan sát, ghi chép và thỉnh thoảng viết lách.
          </p>

          <p>
            Blog này là nơi tôi lưu lại những thứ tôi nghĩ đáng nhớ: ghi chú công việc, trải nghiệm cuộc sống, và những suy nghĩ tản mạn.
          </p>

          <p>
            Không có lịch đăng bài. Không có SEO chiến lược. Chỉ là viết khi có điều gì đó cần viết.
          </p>

          <h2>Tìm tôi ở đâu</h2>

          <ul>
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              <a href="https://www.facebook.com/minhvux99" target="_blank" rel="noopener noreferrer">@minhvux99</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} aria-hidden="true" />
              <a href="mailto:dominhvu2605@gmail.com">dominhvu2605@gmail.com</a>
            </li>
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              <a href="https://github.com/dominhvu2605" target="_blank" rel="noopener noreferrer">@dominhvu2605</a>
            </li>
          </ul>
        </div>

        <hr className="border-[#E5E5E3] mt-12 mb-8" />

        <Link
          href="/"
          className="text-[0.875rem] text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
        >
          ← Về trang chủ
        </Link>
      </article>
    </div>
  );
}
