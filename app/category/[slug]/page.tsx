import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostsByCategory, getPostsCount } from '@/lib/posts';
import { getCategoryBySlug } from '@/lib/categories';
import { POSTS_PER_PAGE } from '@/lib/config';
import PostList from '@/components/ui/PostList';
import Pagination from '@/components/ui/Pagination';
import CategorySidebar from '@/components/ui/CategorySidebar';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.label,
    description: category.description ?? undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1);

  const [posts, total] = await Promise.all([
    getPostsByCategory(slug, currentPage, POSTS_PER_PAGE),
    getPostsCount(slug),
  ]);
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <div className="mx-auto max-w-[760px] xl:max-w-[1020px] px-6 py-16">
      <div className="xl:grid xl:gap-12" style={{ gridTemplateColumns: '1fr 200px' }}>
        <div>
          <header className="mb-12">
            <h1 className="font-serif text-[1.75rem] font-semibold text-[#1A1A1A] mb-2">
              {category.label}
            </h1>
            {category.description && (
              <p className="text-[0.9375rem] text-[#6B7280]">{category.description}</p>
            )}
          </header>
          <PostList posts={posts} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/category/${slug}`}
          />
        </div>
        <CategorySidebar />
      </div>
    </div>
  );
}
