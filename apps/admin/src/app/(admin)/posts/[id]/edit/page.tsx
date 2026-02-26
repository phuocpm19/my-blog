'use client';

import { useParams } from 'next/navigation';
import PostForm from '../../_components/PostForm';

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  return <PostForm postId={id} />;
}
