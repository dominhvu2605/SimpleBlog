export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getPostById } from '@/lib/posts';
import PostEditor from '@/components/ui/PostEditor';

interface Props { params: Promise<{ id: string }> }

export default async function EditPostPage({ params }: Props) {
  const { id: rawId } = await params;
  const id = parseInt(rawId, 10);
  if (isNaN(id)) notFound();

  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-[1.75rem] font-semibold text-[#1A1A1A] mb-1">Sửa bài viết</h1>
        <p className="text-[0.9375rem] text-[#6B7280] truncate">{post.title}</p>
      </div>
      <PostEditor
        mode="edit"
        postId={post.id}
        initial={{
          title:     post.title,
          slug:      post.slug,
          excerpt:   post.excerpt,
          content:   post.content,
          category:  post.category,
          published: post.published,
        }}
      />
    </div>
  );
}
