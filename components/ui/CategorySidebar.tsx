import Link from 'next/link';
import { getPopularByCategory } from '@/lib/posts';
import { categoryLabel } from '@/lib/format';
import type { Category } from '@/types';

const CATEGORY_ORDER: Category[] = ['notes', 'life', 'thoughts'];

export default async function CategorySidebar() {
  const popular = await getPopularByCategory(4);

  // Filter out empty categories
  const sections = CATEGORY_ORDER.filter((cat) => popular[cat]?.length > 0);
  if (sections.length === 0) return null;

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-20 w-[200px] space-y-8">
        {sections.map((cat) => (
          <section key={cat}>
            <Link
              href={cat === 'thoughts' ? '/' : `/${cat}`}
              className="block text-[0.6875rem] font-semibold tracking-widest uppercase text-[#9CA3AF] hover:text-[#6B7280] transition-colors mb-3"
            >
              {categoryLabel[cat]}
            </Link>
            <ul className="space-y-2">
              {popular[cat].map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="group block"
                  >
                    <p className="text-[0.8125rem] text-[#6B7280] group-hover:text-[#1A1A1A] transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </p>
                    <span className="text-[0.6875rem] text-[#9CA3AF]">
                      {post.reading_time} phút
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  );
}
