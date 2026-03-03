'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Post, Tag as TagType } from 'shared';

import {
  Typography,
  Tag,
  Space,
  Skeleton,
  Button,
  Divider,
  Card,
  Row,
  Col,
  theme,
} from 'antd';
import {
  CalendarOutlined,
  TagOutlined,
  ArrowLeftOutlined,
  FolderOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface PostWithRelations extends Omit<Post, 'category' | 'tags'> {
  category: { name: string; slug: string } | null;
  tags: TagType[];
}

// ─── Reading utils ────────────────────────────────────────────────────────────
interface Heading { id: string; text: string; level: number; }

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
}

function getReadingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function parseHeadings(html: string): Heading[] {
  const regex = /<h([234])[^>]*>(.*?)<\/h[234]>/gi;
  const headings: Heading[] = [];
  const used = new Map<string, number>();
  let m;
  while ((m = regex.exec(html)) !== null) {
    const level = parseInt(m[1], 10);
    const rawText = m[2].replace(/<[^>]+>/g, '').trim();
    let id = slugify(rawText);
    if (used.has(id)) { const c = (used.get(id) ?? 0) + 1; used.set(id, c); id = `${id}-${c}`; }
    else used.set(id, 0);
    headings.push({ id, text: rawText, level });
  }
  return headings;
}

function addIdsToHeadings(html: string): string {
  const used = new Map<string, number>();
  return html.replace(/<h([234])([^>]*)>(.*?)<\/h[234]>/gi, (_, level, attrs, inner) => {
    const rawText = inner.replace(/<[^>]+>/g, '').trim();
    let id = slugify(rawText);
    if (used.has(id)) { const c = (used.get(id) ?? 0) + 1; used.set(id, c); id = `${id}-${c}`; }
    else used.set(id, 0);
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
}

// ─── TOC ─────────────────────────────────────────────────────────────────────
function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? '');

  useEffect(() => {
    if (!headings.length) return;
    const onScroll = () => {
      const offset = 100;
      let current = headings[0].id;
      for (const { id } of headings) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset) current = id;
      }
      setActiveId(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [headings]);

  if (!headings.length) return null;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  };

  return (
    // position:sticky cần parent có height thực (không phải chỉ min-height)
    // và overflow không phải hidden
    <div style={{
      position: 'sticky',
      top: 80,
      alignSelf: 'flex-start', // ← quan trọng: không stretch theo chiều cao article
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
      paddingBottom: 16,
      width: 220,
      flexShrink: 0,
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: '#9ca3af',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
      }}>
        Mục lục
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {headings.map(({ id, text, level }) => {
          const isActive = activeId === id;
          return (
            <li key={id}>
              <button
                onClick={() => scrollTo(id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: isActive ? '#e6f4ff' : 'none',
                  border: 'none', borderLeft: `2px solid ${isActive ? '#1677ff' : 'transparent'}`,
                  borderRadius: '0 6px 6px 0',
                  cursor: 'pointer',
                  padding: `5px 8px 5px ${level === 2 ? 8 : level === 3 ? 20 : 32}px`,
                  fontSize: level === 2 ? 13 : 12,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#1677ff' : '#6b7280',
                  transition: 'all 0.15s', lineHeight: 1.5,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  marginBottom: 2,
                }}
              >
                {text}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PostDetailClient() {
  const { token } = theme.useToken();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [post, setPost] = useState<PostWithRelations | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<(Post & { category: { name: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      const { data: postData, error } = await supabase
        .from('posts').select('*, category:categories(name, slug)')
        .eq('slug', slug).eq('status', 'published').single();

      if (error || !postData) { setNotFound(true); setLoading(false); return; }

      const { data: postTags } = await supabase
        .from('post_tags').select('tag:tags(*)').eq('post_id', postData.id);

      const tags = postTags?.map((pt: any) => pt.tag).filter(Boolean) ?? [];
      setPost({ ...postData, tags });

      if (postData.category_id) {
        const { data: related } = await supabase
          .from('posts').select('*, category:categories(name)')
          .eq('status', 'published').eq('category_id', postData.category_id)
          .neq('id', postData.id).order('published_at', { ascending: false }).limit(3);
        if (related) setRelatedPosts(related);
      }
      setLoading(false);
    }
    if (slug) fetchPost();
  }, [slug]);

  if (loading) return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Skeleton active paragraph={{ rows: 1 }} title={{ width: 200 }} />
      <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: 24 }} />
    </div>
  );

  if (notFound || !post) return (
    <div style={{ textAlign: 'center', padding: '64px 0' }}>
      <Title level={3}>Không tìm thấy bài viết</Title>
      <Paragraph type="secondary">Bài viết này không tồn tại hoặc chưa được xuất bản.</Paragraph>
      <Button type="primary" onClick={() => router.push('/posts')}>Quay lại danh sách</Button>
    </div>
  );

  const content = post.content ?? '';
  const contentWithIds = addIdsToHeadings(content);
  const headings = parseHeadings(content);
  const minutes = getReadingTime(content);

  return (
    // Wrapper mở rộng ra ngoài Content của ClientLayout (max 1200px)
    // Dùng negative margin để TOC có thể nằm ngoài vùng bài viết
    <div style={{ margin: '0 -16px' }}>
      <div style={{ padding: '0 16px', marginBottom: 16 }}>
        <Link href="/posts">
          <Button type="text" icon={<ArrowLeftOutlined />} style={{ paddingLeft: 0 }}>
            Quay lại danh sách
          </Button>
        </Link>
      </div>

      {/* Layout: TOC trái + Article phải */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

        {/* TOC sidebar - chỉ hiện trên desktop */}
        <div className="post-toc">
          <TableOfContents headings={headings} />
        </div>

        {/* Article */}
        <article style={{ flex: 1, minWidth: 0, maxWidth: 780, paddingBottom: 80 }}>
          <Title level={1} style={{ marginBottom: 12 }}>{post.title}</Title>

          <Space wrap size="middle" style={{ marginBottom: 24 }}>
            {post.category && (
              <Tag color="blue" icon={<FolderOutlined />}>{post.category.name}</Tag>
            )}
            {post.author_name && (
              <Text type="secondary"><UserOutlined /> {post.author_name}</Text>
            )}
            {post.published_at && (
              <Text type="secondary">
                <CalendarOutlined />{' '}
                {new Date(post.published_at).toLocaleDateString('vi-VN', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </Text>
            )}
            <Text type="secondary">
              <ClockCircleOutlined /> {minutes} phút đọc
            </Text>
          </Space>

          {post.excerpt && (
            <Paragraph style={{
              fontSize: 16, color: token.colorTextSecondary, fontStyle: 'italic',
              borderLeft: `3px solid ${token.colorPrimary}`,
              paddingLeft: 16, marginBottom: 24,
            }}>
              {post.excerpt}
            </Paragraph>
          )}

          <Divider />

          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: contentWithIds }}
            style={{ fontSize: 16, lineHeight: 1.8, color: token.colorText }}
          />

          <Divider />

          {post.tags && post.tags.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Space wrap>
                <TagOutlined style={{ color: token.colorTextSecondary }} />
                {post.tags.map((tag) => <Tag key={tag.id}>{tag.name}</Tag>)}
              </Space>
            </div>
          )}

          {relatedPosts.length > 0 && (
            <div style={{ marginTop: 48 }}>
              <Title level={4}>Bài viết liên quan</Title>
              <Row gutter={[16, 16]}>
                {relatedPosts.map((rp) => (
                  <Col xs={24} sm={8} key={rp.id}>
                    <Link href={`/posts/${rp.slug}`} style={{ display: 'block' }}>
                      <Card hoverable size="small">
                        <Title level={5} style={{ margin: 0 }} ellipsis={{ rows: 2 }}>
                          {rp.title}
                        </Title>
                        {rp.published_at && (
                          <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                            <CalendarOutlined />{' '}
                            {new Date(rp.published_at).toLocaleDateString('vi-VN')}
                          </Text>
                        )}
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </article>
      </div>

      <style>{`
        .post-toc { display: none; }
        @media (min-width: 1024px) { .post-toc { display: block; } }
      `}</style>
    </div>
  );
}