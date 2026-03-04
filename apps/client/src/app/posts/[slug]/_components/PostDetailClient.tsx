'use client';

import { useEffect, useRef, useState } from 'react';
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
  FileTextOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface PostWithRelations extends Omit<Post, 'category' | 'tags'> {
  category: { name: string; slug: string } | null;
  tags: TagType[];
}

const STICKY_TOP = 150;

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

// ─── Shared: tính position fixed từ ref + side ────────────────────────────────
function useFixedPosition(
  articleRef: React.RefObject<HTMLElement | null>,
  side: 'left' | 'right',
  width: number,
  gap: number,
) {
  const [pos, setPos] = useState<{ x: number; top: number } | null>(null);

  useEffect(() => {
    function calc() {
      if (!articleRef.current) return;
      const rect = articleRef.current.getBoundingClientRect();
      if (side === 'left') {
        const x = rect.left - width - gap;
        if (x < 8) { setPos(null); return; }
        setPos({ x, top: STICKY_TOP });
      } else {
        const x = rect.right + gap;
        if (x + width > window.innerWidth - 8) { setPos(null); return; }
        setPos({ x, top: STICKY_TOP });
      }
    }
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [articleRef, side, width, gap]);

  return pos;
}

// ─── TOC ─────────────────────────────────────────────────────────────────────
function TableOfContents({ headings, articleRef }: {
  headings: Heading[];
  articleRef: React.RefObject<HTMLElement | null>;
}) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? '');
  const pos = useFixedPosition(articleRef, 'left', 220, 24);

  useEffect(() => {
    if (!headings.length) return;
    const onScroll = () => {
      const offset = 80;
      let current = headings[0].id;
      for (const { id } of headings) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset) current = id;
      }
      setActiveId(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll);
    };
  }, [headings]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  };

  if (!headings.length || !pos) return null;

  return (
    <div style={{
      position: 'fixed',
      top: pos.top,
      left: pos.x,
      width: 220,
      maxHeight: `calc(100vh - ${pos.top + 32}px)`,
      overflowY: 'auto',
      overflowX: 'hidden',
      zIndex: 200,
      scrollbarWidth: 'thin',
      scrollbarColor: '#e5e7eb transparent',
      background: 'var(--ant-color-bg-container, #ffffff)',
      border: '1px solid var(--ant-color-border-secondary, #f0f0f0)',
      borderRadius: 8,
      padding: '16px 8px 16px 0',
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: '#9ca3af',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 10, paddingLeft: 18,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>Mục lục</div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {headings.map(({ id, text, level }) => {
          const isActive = activeId === id;
          return (
            <li key={id}>
              <button onClick={() => scrollTo(id)} title={text} style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: isActive ? '#e6f4ff' : 'transparent',
                border: 'none',
                borderLeft: `2px solid ${isActive ? '#1677ff' : 'transparent'}`,
                borderRadius: '0 6px 6px 0', cursor: 'pointer',
                padding: `5px 8px 5px ${level === 2 ? 10 : level === 3 ? 22 : 34}px`,
                fontSize: level === 2 ? 13 : 12,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#1677ff' : '#6b7280',
                transition: 'all 0.15s', lineHeight: 1.5,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                marginBottom: 2,
              }}>
                {text}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Right Sidebar (fixed) ────────────────────────────────────────────────────
function RightSidebar({ tags, currentPostId, articleRef }: {
  tags: TagType[];
  currentPostId: string;
  articleRef: React.RefObject<HTMLElement | null>;
}) {
  const { token } = theme.useToken();
  const pos = useFixedPosition(articleRef, 'right', 220, 24);
  const [recentPosts, setRecentPosts] = useState<(Post & { category: { name: string } | null })[]>([]);

  useEffect(() => {
    supabase
      .from('posts')
      .select('id, title, slug, updated_at, category:categories(name)')
      .eq('status', 'published')
      .neq('id', currentPostId)
      .order('updated_at', { ascending: false })
      .limit(5)
      .then(({ data }) => { if (data) setRecentPosts(data as any); });
  }, [currentPostId]);

  if (!pos) return null;

  const cardStyle = {
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: 8,
    padding: '16px',
    marginBottom: 16,
  };

  const labelStyle = {
    fontSize: 11, fontWeight: 700 as const, color: '#9ca3af',
    textTransform: 'uppercase' as const, letterSpacing: '0.08em',
    marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6,
  };

  return (
    <div style={{
      position: 'fixed',
      top: pos.top,
      left: pos.x,
      width: 220,
      maxHeight: `calc(100vh - ${pos.top + 32}px)`,
      overflowY: 'auto',
      overflowX: 'hidden',
      zIndex: 200,
      scrollbarWidth: 'thin',
      scrollbarColor: '#e5e7eb transparent',
    }}>
      {/* Tags */}
      {tags.length > 0 && (
        <div style={cardStyle}>
          <div style={labelStyle}><TagOutlined /> Tags</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {tags.map((tag) => (
              <Link key={tag.id} href={`/posts?tag=${tag.slug}`}>
                <Tag color="blue" style={{ cursor: 'pointer', margin: 0 }}>{tag.name}</Tag>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bài viết mới nhất */}
      <div style={{ ...cardStyle, marginBottom: 0 }}>
        <div style={labelStyle}><FileTextOutlined /> Bài viết mới nhất</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {recentPosts.length === 0
            ? [1, 2, 3].map(i => <Skeleton key={i} active title={{ width: '100%' }} paragraph={false} />)
            : recentPosts.map((rp) => (
              <Link key={rp.id} href={`/posts/${rp.slug}`} style={{ display: 'block' }}>
                <div
                  style={{ padding: '6px 8px', borderRadius: 6, transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = token.colorFillQuaternary)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Text style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, display: 'block', marginBottom: 2 }}>
                    {rp.title}
                  </Text>
                  {rp.updated_at && (
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      <CalendarOutlined />{' '}{new Date(rp.updated_at).toLocaleDateString('vi-VN')}
                    </Text>
                  )}
                </div>
              </Link>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ─── Related Posts ────────────────────────────────────────────────────────────
function RelatedPosts({ post }: { post: PostWithRelations }) {
  const { token } = theme.useToken();
  const [related, setRelated] = useState<(Post & { category: { name: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const tagIds = post.tags.map(t => t.id);

      let posts: any[] = [];

      // Ưu tiên 1: bài viết có chung tag
      if (tagIds.length > 0) {
        const { data: postTagRows } = await supabase
          .from('post_tags')
          .select('post_id')
          .in('tag_id', tagIds)
          .neq('post_id', post.id);

        const postIds = [...new Set(postTagRows?.map((r: any) => r.post_id) ?? [])];

        if (postIds.length > 0) {
          const { data } = await supabase
            .from('posts')
            .select('*, category:categories(name)')
            .eq('status', 'published')
            .in('id', postIds)
            .order('published_at', { ascending: false })
            .limit(4);
          posts = data ?? [];
        }
      }

      // Fallback: bài viết cùng category nếu chưa đủ 4
      if (posts.length < 4 && post.category_id) {
        const existingIds = [post.id, ...posts.map(p => p.id)];
        const { data } = await supabase
          .from('posts')
          .select('*, category:categories(name)')
          .eq('status', 'published')
          .eq('category_id', post.category_id)
          .not('id', 'in', `(${existingIds.join(',')})`)
          .order('published_at', { ascending: false })
          .limit(4 - posts.length);
        posts = [...posts, ...(data ?? [])];
      }

      setRelated(posts.slice(0, 4));
      setLoading(false);
    }
    fetch();
  }, [post.id]);

  if (!loading && related.length === 0) return null;

  return (
    <div style={{ marginTop: 48 }}>
      <Title level={4} style={{ marginBottom: 16 }}>Bài viết liên quan</Title>
      {loading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map(i => (
            <Col xs={24} sm={12} key={i}>
              <Card><Skeleton active paragraph={{ rows: 2 }} /></Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[16, 16]}>
          {related.map((rp) => (
            <Col xs={24} sm={12} key={rp.id}>
              <Link href={`/posts/${rp.slug}`} style={{ display: 'block' }}>
                <Card
                  hoverable
                  size="small"
                  style={{ height: '100%' }}
                >
                  {rp.category && (
                    <Tag color="blue" style={{ marginBottom: 6 }}>{rp.category.name}</Tag>
                  )}
                  <Title level={5} style={{ margin: 0 }} ellipsis={{ rows: 2 }}>
                    {rp.title}
                  </Title>
                  {rp.published_at && (
                    <Text type="secondary" style={{ fontSize: 12, marginTop: 6, display: 'block' }}>
                      <CalendarOutlined />{' '}
                      {new Date(rp.published_at).toLocaleDateString('vi-VN')}
                    </Text>
                  )}
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      )}
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
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const articleRef = useRef<HTMLElement>(null);

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
      setLoading(false);
    }
    if (slug) fetchPost();
  }, [slug]);

  if (loading) return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
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
    <>
      {/* TOC fixed bên trái */}
      <TableOfContents headings={headings} articleRef={articleRef} />

      {/* Right sidebar fixed bên phải */}
      <RightSidebar tags={post.tags} currentPostId={post.id} articleRef={articleRef} />

      <div style={{ maxWidth: 780, margin: '0 auto', paddingBottom: 80 }}>
        <div style={{ marginBottom: 16 }}>
          <Link href="/posts">
            <Button type="text" icon={<ArrowLeftOutlined />} style={{ paddingLeft: 0 }}>
              Quay lại danh sách
            </Button>
          </Link>
        </div>

        <article ref={articleRef}>
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

          {/* Related Posts — cuối bài viết */}
          <RelatedPosts post={post} />
        </article>
      </div>
    </>
  );
}