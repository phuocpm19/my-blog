// apps/admin/src/app/(admin)/posts/_components/RichEditor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Button, Tooltip, Divider, Modal, Input, Upload, message, Tabs } from 'antd';
import {
  BoldOutlined, ItalicOutlined, UnderlineOutlined, StrikethroughOutlined,
  OrderedListOutlined, UnorderedListOutlined, CodeOutlined, LinkOutlined,
  AlignLeftOutlined, AlignCenterOutlined, AlignRightOutlined,
  PictureOutlined, UploadOutlined, CodeSandboxOutlined,
} from '@ant-design/icons';
import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { RcFile } from 'antd/es/upload';

interface RichEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const BUCKET = 'post-images'; // Tên bucket trong Supabase Storage

export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [htmlModalOpen, setHtmlModalOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

  const editor = useEditor({
    immediatelyRender: false,  
    extensions: [
      StarterKit,
      Image.configure({ HTMLAttributes: { style: 'max-width:100%;border-radius:8px;' } }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? 'Bắt đầu viết bài...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
    ],
    content: value ?? '',
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });

  useEffect(() => {
  if (!editor) return;
  const current = editor.getHTML();
  if (value && value !== current) {
    editor.commands.setContent(value, { emitUpdate: false });
  }
}, [value, editor]);

  if (!editor) return null;

  // ─── Upload ảnh lên Supabase Storage ───
  const handleUpload = async (file: RcFile) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      message.error('Chỉ hỗ trợ JPG, PNG, WebP, GIF');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error('Ảnh tối đa 5MB');
      return false;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file, { contentType: file.type, upsert: false });

    if (error) {
      message.error('Upload thất bại: ' + error.message);
      setUploading(false);
      return false;
    }

    // Lấy public URL
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
    editor.chain().focus().setImage({ src: publicUrl, alt: file.name }).run();
    message.success('Upload thành công');
    setUploading(false);
    setImageModalOpen(false);
    return false; // ngăn antd tự upload
  };

  // ─── Insert ảnh từ URL ───
  const handleInsertImageUrl = () => {
    if (!imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
    setImageUrl('');
    setImageModalOpen(false);
  };

  // ─── Link ───
  const handleInsertLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
    }
    setLinkUrl('');
    setLinkModalOpen(false);
  };

  // ─── Import HTML ───
  const handleImportHtml = () => {
    if (!htmlContent.trim()) return;
    editor.commands.setContent(htmlContent.trim());
    onChange?.(editor.getHTML());
    setHtmlContent('');
    setHtmlModalOpen(false);
  };

  const ToolbarBtn = ({ icon, title, active, onClick, disabled }: any) => (
    <Tooltip title={title}>
      <Button
        type={active ? 'primary' : 'text'}
        size="small"
        icon={icon}
        onClick={onClick}
        disabled={disabled}
      />
    </Tooltip>
  );

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, overflow: 'hidden' }}>
      {/* Toolbar */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #f0f0f0',
        background: '#fafafa',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
      }}>
        <ToolbarBtn icon={<BoldOutlined />} title="Bold (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolbarBtn icon={<ItalicOutlined />} title="Italic (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolbarBtn icon={<UnderlineOutlined />} title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <ToolbarBtn icon={<StrikethroughOutlined />} title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />

        <Divider orientation="vertical" />

        {[1, 2, 3].map(level => (
          <Tooltip key={level} title={`Heading ${level}`}>
            <Button
              type={editor.isActive('heading', { level }) ? 'primary' : 'text'}
              size="small"
              onClick={() => editor.chain().focus().toggleHeading({ level: level as any }).run()}
              style={{ fontWeight: 700, fontSize: 12, minWidth: 28 }}
            >
              H{level}
            </Button>
          </Tooltip>
        ))}

        <Divider orientation="vertical" />

        <ToolbarBtn icon={<UnorderedListOutlined />} title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolbarBtn icon={<OrderedListOutlined />} title="Ordered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />

        <Divider orientation="vertical" />

        <ToolbarBtn icon={<AlignLeftOutlined />} title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} />
        <ToolbarBtn icon={<AlignCenterOutlined />} title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} />
        <ToolbarBtn icon={<AlignRightOutlined />} title="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} />

        <Divider orientation="vertical" />

        <ToolbarBtn icon={<CodeOutlined />} title="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} />
        <ToolbarBtn icon={<CodeSandboxOutlined />} title="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />

        <Divider orientation="vertical" />

        <ToolbarBtn icon={<LinkOutlined />} title="Insert link" active={editor.isActive('link')} onClick={() => { setLinkUrl(editor.getAttributes('link').href ?? ''); setLinkModalOpen(true); }} />

        {/* Nút ảnh — mở modal chọn upload hoặc URL */}
        <Tooltip title="Insert image">
          <Button
            type="text"
            size="small"
            icon={<PictureOutlined />}
            onClick={() => setImageModalOpen(true)}
          />
        </Tooltip>

        <Divider orientation="vertical" />

        <Tooltip title="Import HTML">
          <Button
            type="text"
            size="small"
            onClick={() => { setHtmlContent(editor.getHTML()); setHtmlModalOpen(true); }}
            style={{ fontSize: 11, fontWeight: 600 }}
          >
            HTML
          </Button>
        </Tooltip>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        style={{ minHeight: 400, padding: '16px', fontSize: 15, lineHeight: 1.8 }}
      />

      {/* Modal: Insert Image */}
      <Modal
        title="Chèn ảnh"
        open={imageModalOpen}
        onCancel={() => { setImageModalOpen(false); setImageUrl(''); }}
        footer={null}
        destroyOnHidden
      >
        <Tabs
          items={[
            {
              key: 'upload',
              label: 'Upload ảnh',
              children: (
                <div style={{ padding: '16px 0' }}>
                  <Upload.Dragger
                    accept="image/*"
                    beforeUpload={handleUpload}
                    showUploadList={false}
                    disabled={uploading}
                  >
                    <p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: 32 }} /></p>
                    <p>Kéo thả hoặc click để upload</p>
                    <p style={{ color: '#8c8c8c', fontSize: 12 }}>JPG, PNG, WebP, GIF — tối đa 5MB</p>
                  </Upload.Dragger>
                </div>
              ),
            },
            {
              key: 'url',
              label: 'Từ URL',
              children: (
                <div style={{ padding: '16px 0' }}>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    onPressEnter={handleInsertImageUrl}
                    style={{ marginBottom: 12 }}
                  />
                  <Button type="primary" onClick={handleInsertImageUrl} block>
                    Chèn ảnh
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Modal>

      {/* Modal: Link */}
      <Modal
        title="Insert Link"
        open={linkModalOpen}
        onOk={handleInsertLink}
        onCancel={() => setLinkModalOpen(false)}
        okText="Áp dụng"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Input
          placeholder="https://..."
          value={linkUrl}
          onChange={e => setLinkUrl(e.target.value)}
          onPressEnter={handleInsertLink}
          style={{ marginTop: 16 }}
        />
      </Modal>

      {/* Modal: HTML */}
      <Modal
        title="Import / Export HTML"
        open={htmlModalOpen}
        onOk={handleImportHtml}
        onCancel={() => setHtmlModalOpen(false)}
        okText="Import vào editor"
        cancelText="Đóng"
        width={720}
        destroyOnHidden
      >
        <Input.TextArea
          value={htmlContent}
          onChange={e => setHtmlContent(e.target.value)}
          rows={16}
          style={{ fontFamily: 'monospace', fontSize: 13, marginTop: 12 }}
          placeholder="Paste HTML vào đây..."
        />
      </Modal>
    </div>
  );
}