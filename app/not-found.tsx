import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[760px] px-6 py-32 text-center">
      <p className="font-serif text-[4rem] font-semibold text-[#E5E5E3] leading-none mb-6">
        404
      </p>
      <h1 className="text-[1.25rem] font-medium text-[#1A1A1A] mb-3">
        Trang không tồn tại
      </h1>
      <p className="text-[0.9375rem] text-[#6B7280] mb-8">
        Bài viết này có thể đã bị xoá hoặc chưa được đăng.
      </p>
      <Link
        href="/"
        className="text-[0.875rem] text-[#6B7280] hover:text-[#1A1A1A] transition-colors underline underline-offset-4"
      >
        Quay về trang chủ
      </Link>
    </div>
  );
}
