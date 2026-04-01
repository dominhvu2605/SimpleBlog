import Link from 'next/link';
import type { PostSummary } from '@/types';
import { formatDate, getYear, categoryLabel } from '@/lib/format';

interface Props {
  posts: PostSummary[];
}

export default function PostList({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <p className="text-[#6B7280] text-[0.9375rem] py-12 text-center">
        Chưa có bài viết nào.
      </p>
    );
  }

  // Group by updated_at year
  const grouped = posts.reduce<Record<string, PostSummary[]>>((acc, post) => {
    const year = getYear(post.updated_at);
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {});

  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="space-y-12">
      {years.map((year) => (
        <section key={year}>
          {/* Year heading */}
          <h2 className="text-[0.8125rem] font-medium text-[#6B7280] tracking-widest uppercase mb-5">
            {year}
          </h2>
          <div className="border-t border-[#E5E5E3]">
            {grouped[year].map((post) => (
              <article
                key={post.id}
                className="group border-b border-[#E5E5E3] py-5"
              >
                <Link href={`/posts/${post.slug}`} className="block">
                  <div className="flex items-baseline gap-4 sm:gap-8">
                    {/* Date */}
                    <time
                      dateTime={post.updated_at}
                      className="shrink-0 text-[0.8125rem] text-[#6B7280] w-[88px]"
                    >
                      {formatDate(post.updated_at)}
                    </time>

                    {/* Content */}
                    <div className="min-w-0">
                      <h3 className="text-[1rem] font-medium text-[#1A1A1A] group-hover:opacity-60 transition-opacity leading-snug">
                        {post.title}
                      </h3>
                      <p className="mt-1 text-[0.875rem] text-[#6B7280] line-clamp-2 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-[0.75rem] text-[#9CA3AF]">
                          {categoryLabel[post.category] ?? post.category}
                        </span>
                        <span className="text-[#D1D5DB]">·</span>
                        <span className="text-[0.75rem] text-[#9CA3AF]">
                          {post.reading_time} phút đọc
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
