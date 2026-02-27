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
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface PostWithRelations extends Omit<Post, 'category' | 'tags'> {
  category: { name: string; slug: string } | null;
  tags: TagType[];
}

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

      // Fetch post by slug
      const { data: postData, error } = await supabase
        .from('posts')
        .select('*, category:categories(name, slug)')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error || !postData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Fetch tags for this post
      const { data: postTags } = await supabase
        .from('post_tags')
        .select('tag:tags(*)')
        .eq('post_id', postData.id);

      const tags = postTags?.map((pt: any) => pt.tag).filter(Boolean) ?? [];

      setPost({ ...postData, tags });

      // Fetch related posts (same category, exclude current)
      if (postData.category_id) {
        const { data: related } = await supabase
          .from('posts')
          .select('*, category:categories(name)')
          .eq('status', 'published')
          .eq('category_id', postData.category_id)
          .neq('id', postData.id)
          .order('published_at', { ascending: false })
          .limit(3);

        if (related) setRelatedPosts(related);
      }

      setLoading(false);
    }

    if (slug) fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: 200 }} />
        <Skeleton active paragraph={{ rows: 8 }} style={{ marginTop: 24 }} />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div style={{ textAlign: 'center', padding: '64px 0' }}>
        <Title level={3}>Không tìm thấy bài viết</Title>
        <Paragraph type="secondary">
          Bài viết này không tồn tại hoặc chưa được xuất bản.
        </Paragraph>
        <Button type="primary" onClick={() => router.push('/posts')}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Back button */}
      <Link href="/posts">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          style={{ marginBottom: 16, paddingLeft: 0 }}
        >
          Quay lại danh sách
        </Button>
      </Link>

      {/* Post Header */}
      <article>
        <Title level={1} style={{ marginBottom: 12 }}>
          {post.title}
        </Title>

        {/* Meta info */}
        <Space wrap size="middle" style={{ marginBottom: 24 }}>
          {post.category && (
            <Tag color="blue" icon={<FolderOutlined />}>
              {post.category.name}
            </Tag>
          )}
          {post.author_name && (
            <Text type="secondary">
              <UserOutlined /> {post.author_name}
            </Text>
          )}
          {post.published_at && (
            <Text type="secondary">
              <CalendarOutlined />{' '}
              {new Date(post.published_at).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          )}
        </Space>

        {/* Excerpt */}
        {post.excerpt && (
          <Paragraph
            style={{
              fontSize: 16,
              color: token.colorTextSecondary,
              fontStyle: 'italic',
              borderLeft: `3px solid ${token.colorPrimary}`,
              paddingLeft: 16,
              marginBottom: 24,
            }}
          >
            {post.excerpt}
          </Paragraph>
        )}

        <Divider />

        {/* Content */}
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{
            fontSize: 16,
            lineHeight: 1.8,
            color: token.colorText,
          }}
        />

        <Divider />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <Space wrap>
              <TagOutlined style={{ color: token.colorTextSecondary }} />
              {post.tags.map((tag) => (
                <Tag key={tag.id}>{tag.name}</Tag>
              ))}
            </Space>
          </div>
        )}
      </article>

      {/* Related Posts */}
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
    </div>
  );
}
