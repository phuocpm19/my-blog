// apps/client/src/app/feed.xml/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://my-blog-client.vercel.app';
const SITE_TITLE = 'PhuocPM Blog';
const SITE_DESCRIPTION = 'Chia sẻ kiến thức từ sách, tài liệu và hành trình giao dịch crypto cá nhân.';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: posts } = await supabase
    .from('posts')
    .select('title, slug, excerpt, content, published_at, author_name, category:categories(name)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20);

  const items = (posts ?? []).map((post: any) => {
    const url = `${SITE_URL}/posts/${post.slug}`;
    const description = post.excerpt
      ? escapeXml(post.excerpt)
      : escapeXml(stripHtml(post.content ?? '').slice(0, 200) + '...');
    const pubDate = post.published_at
      ? new Date(post.published_at).toUTCString()
      : new Date().toUTCString();

    return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      ${post.author_name ? `<author>${escapeXml(post.author_name)}</author>` : ''}
      ${post.category?.name ? `<category>${escapeXml(post.category.name)}</category>` : ''}
    </item>`;
  }).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>vi</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}