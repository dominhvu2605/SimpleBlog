import Link from 'next/link';
import { getPopularByCategory } from '@/lib/posts';
import { getAllCategories } from '@/lib/categories';

export default async function CategorySidebar() {
  const [popular, categories] = await Promise.all([
    getPopularByCategory(4),
    getAllCategories(),
  ]);

  // Keep DB order; skip categories with no published posts
  const sections = categories.filter((cat) => popular[cat.slug]?.length > 0);
  if (sections.length === 0) return null;

  return (
    <aside className="hidden xl:block">
      <div className="sticky top-20 w-[200px]">
        {sections.map((cat, i) => (
          <section key={cat.slug} className={i > 0 ? 'border-t border-[#E5E5E3] pt-6' : ''}>
            <Link
              href={`/category/${cat.slug}`}
              className="block text-[0.6875rem] font-semibold tracking-widest uppercase text-[#9CA3AF] hover:text-[#6B7280] transition-colors mb-3"
            >
              {cat.label}
            </Link>
            <ul className="space-y-2">
              {popular[cat.slug].map((post) => (
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
