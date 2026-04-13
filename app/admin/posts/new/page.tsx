import PostEditor from '@/components/ui/PostEditor';

export default function NewPostPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-[1.75rem] font-semibold text-[#1A1A1A] mb-1">Tạo bài viết</h1>
        <p className="text-[0.9375rem] text-[#6B7280]">Bài viết mới sẽ được lưu dưới dạng bản nháp cho đến khi xuất bản.</p>
      </div>
      <PostEditor mode="new" />
    </div>
  );
}
