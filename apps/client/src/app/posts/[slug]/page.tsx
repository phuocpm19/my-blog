import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import PostDetailClient from './_components/PostDetailClient';

// Force dynamic rendering (metadata depends on DB data)
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { title: 'Bài viết' };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: post } = await supabase
      .from('posts')
      .select('title, excerpt, category:categories(name)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (!post) {
      return { title: 'Không tìm thấy bài viết' };
    }

    const description = post.excerpt || `Đọc bài viết "${post.title}" trên PhuocPM Blog.`;

    return {
      title: post.title,
      description,
      openGraph: {
        title: post.title,
        description,
        type: 'article',
      },
    };
  } catch {
    return { title: 'Bài viết' };
  }
}

export default function PostDetailPage() {
  return <PostDetailClient />;
}
