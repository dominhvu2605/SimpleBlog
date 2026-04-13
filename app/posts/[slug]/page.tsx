import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getAdjacentPosts } from '@/lib/posts';
import { formatDate, categoryLabel } from '@/lib/format';
import { extractHeadings, renderMarkdown } from '@/lib/toc';
import TableOfContents from '@/components/ui/TableOfContents';
import ViewTracker from '@/components/ui/ViewTracker';
import CommentSection from '@/components/ui/CommentSection';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.created_at,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [{ prev, next }, htmlContent] = await Promise.all([
    getAdjacentPosts(post.created_at),
    renderMarkdown(post.content),
  ]);
  const headings = extractHeadings(post.content);

  return (
    <>
      <ViewTracker slug={slug} />

      {/* Outer wrapper — wide on xl to accommodate TOC */}
      <div className="mx-auto max-w-[760px] xl:max-w-[1020px] px-6 py-16">
        <div className="xl:grid xl:gap-12" style={{ gridTemplateColumns: '1fr 200px' }}>

          {/* ── Main article ── */}
          <article>
            {/* Back link */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[0.8125rem] text-[#6B7280] hover:text-[#1A1A1A] transition-colors mb-12"
            >
              <ArrowLeft size={14} />
              Tất cả bài viết
            </Link>

            {/* Header */}
            <header className="mb-10">
              <div className="flex items-center gap-2 text-[0.8125rem] text-[#9CA3AF] mb-4">
                <span>{categoryLabel[post.category] ?? post.category}</span>
                <span>·</span>
                <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
                <span>·</span>
                <span>{post.reading_time} phút đọc</span>
              </div>
              <h1 className="font-serif text-[2rem] font-semibold text-[#1A1A1A] leading-tight">
                {post.title}
              </h1>
            </header>

            <hr className="border-[#E5E5E3] mb-10" />

            {/* Content */}
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            <hr className="border-[#E5E5E3] mt-16 mb-10" />

            {/* Prev / Next */}
            <nav className="flex items-start justify-between gap-8">
              {prev ? (
                <Link
                  href={`/posts/${prev.slug}`}
                  className="group flex items-start gap-2 text-left max-w-[45%]"
                >
                  <ArrowLeft size={16} className="mt-0.5 shrink-0 text-[#9CA3AF] group-hover:text-[#1A1A1A] transition-colors" />
                  <div>
                    <p className="text-[0.75rem] text-[#9CA3AF] mb-1">Bài trước</p>
                    <p className="text-[0.875rem] text-[#6B7280] group-hover:text-[#1A1A1A] transition-colors leading-snug">
                      {prev.title}
                    </p>
                  </div>
                </Link>
              ) : <div />}

              {next ? (
                <Link
                  href={`/posts/${next.slug}`}
                  className="group flex items-start gap-2 text-right ml-auto max-w-[45%]"
                >
                  <div>
                    <p className="text-[0.75rem] text-[#9CA3AF] mb-1">Bài sau</p>
                    <p className="text-[0.875rem] text-[#6B7280] group-hover:text-[#1A1A1A] transition-colors leading-snug">
                      {next.title}
                    </p>
                  </div>
                  <ArrowRight size={16} className="mt-0.5 shrink-0 text-[#9CA3AF] group-hover:text-[#1A1A1A] transition-colors" />
                </Link>
              ) : <div />}
            </nav>

            <hr className="border-[#E5E5E3] mt-10" />

            {/* Comments */}
            <CommentSection slug={slug} />
          </article>

          {/* ── TOC Sidebar (xl+ only) ── */}
          <TableOfContents headings={headings} />

        </div>
      </div>
    </>
  );
}
