import type { Metadata } from 'next';
import PostsPageClient from './_components/PostsClient';

export const metadata: Metadata = {
  title: 'Bài viết',
  description: 'Danh sách bài viết review sách, kiến thức tổng hợp và phân tích chuyên sâu.',
  openGraph: {
    title: 'Bài viết | PhuocPM Blog',
    description: 'Danh sách bài viết review sách, kiến thức tổng hợp và phân tích chuyên sâu.',
  },
};

export default function PostsPage() {
  return <PostsPageClient />;
}
