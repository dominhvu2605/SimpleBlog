import type { Metadata } from 'next';
import { getAllPosts, getPostsCount } from '@/lib/posts';
import { POSTS_PER_PAGE } from '@/lib/config';
import PostList from '@/components/ui/PostList';
import Pagination from '@/components/ui/Pagination';
import CategorySidebar from '@/components/ui/CategorySidebar';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'MeoCuti Blog',
  description: 'Ghi chép về cuộc sống, công việc và những suy nghĩ hàng ngày.',
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const [posts, total] = await Promise.all([
    getAllPosts(currentPage, POSTS_PER_PAGE),
    getPostsCount(),
  ]);
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <div className="mx-auto max-w-[760px] xl:max-w-[1020px] px-6 py-16">
      <div className="xl:grid xl:gap-12" style={{ gridTemplateColumns: '1fr 200px' }}>

        {/* ── Main content ── */}
        <div>
          {/* Hero — chỉ hiện ở trang đầu */}
          {currentPage === 1 && (
            <section className="mb-16">
              <h1 className="font-serif text-[2rem] font-semibold text-[#1A1A1A] leading-tight mb-3">
                MeoCuti
              </h1>
              <p className="text-[1rem] text-[#6B7280] leading-relaxed">
                Ghi chép về cuộc sống, công việc và những suy nghĩ hàng ngày.
              </p>
            </section>
          )}

          <PostList posts={posts} />
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/" />
        </div>

        {/* ── Sidebar (xl+ only) ── */}
        <CategorySidebar />

      </div>
    </div>
  );
}
