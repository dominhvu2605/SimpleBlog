import type { Metadata } from 'next';
import { getPostsByCategory, getPostsCount } from '@/lib/posts';
import { POSTS_PER_PAGE } from '@/lib/config';
import PostList from '@/components/ui/PostList';
import Pagination from '@/components/ui/Pagination';
import CategorySidebar from '@/components/ui/CategorySidebar';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Life',
  description: 'Trải nghiệm, chuyến đi và những khoảnh khắc đáng nhớ.',
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function LifePage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const [posts, total] = await Promise.all([
    getPostsByCategory('life', currentPage, POSTS_PER_PAGE),
    getPostsCount('life'),
  ]);
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <div className="mx-auto max-w-[760px] xl:max-w-[1020px] px-6 py-16">
      <div className="xl:grid xl:gap-12" style={{ gridTemplateColumns: '1fr 200px' }}>
        <div>
          <header className="mb-12">
            <h1 className="font-serif text-[1.75rem] font-semibold text-[#1A1A1A] mb-2">
              Life
            </h1>
            <p className="text-[0.9375rem] text-[#6B7280]">
              Trải nghiệm, chuyến đi và những khoảnh khắc đáng nhớ.
            </p>
          </header>
          <PostList posts={posts} />
          <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/life" />
        </div>
        <CategorySidebar />
      </div>
    </div>
  );
}
