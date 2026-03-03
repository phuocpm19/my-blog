'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Button, Space, Tooltip, Divider, Modal, Input } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  StrikethroughOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  CodeOutlined,
  UndoOutlined,
  RedoOutlined,
  LinkOutlined,
  LineOutlined,
  CodeSandboxOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;

interface RichEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

export default function RichEditor({
  value = '',
  onChange,
  placeholder = 'Viết nội dung bài viết...',
}: RichEditorProps) {
  const [htmlModalOpen, setHtmlModalOpen] = useState(false);
  const [htmlInput, setHtmlInput] = useState('');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: '_blank' },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style:
          'min-height: 300px; padding: 16px; outline: none; font-size: 15px; line-height: 1.8;',
      },
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('Nhập URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  // Mở modal với nội dung HTML hiện tại
  const openHtmlModal = () => {
    setHtmlInput(editor.getHTML());
    setHtmlModalOpen(true);
  };

  // Apply HTML vào editor
  const applyHtml = () => {
    if (htmlInput.trim()) {
      editor.commands.setContent(htmlInput);
      onChange?.(editor.getHTML());
    }
    setHtmlModalOpen(false);
  };

  const ToolBtn = ({
    icon,
    action,
    active,
    tip,
  }: {
    icon: React.ReactNode;
    action: () => void;
    active?: boolean;
    tip: string;
  }) => (
    <Tooltip title={tip}>
      <Button
        type={active ? 'primary' : 'text'}
        size="small"
        icon={icon}
        onClick={action}
        style={{ minWidth: 32 }}
      />
    </Tooltip>
  );

  return (
    <>
      <div
        style={{
          border: '1px solid #d9d9d9',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            padding: '8px 12px',
            borderBottom: '1px solid #d9d9d9',
            background: '#fafafa',
          }}
        >
          <Space size={2} wrap>
            <ToolBtn
              icon={<BoldOutlined />}
              action={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              tip="Bold"
            />
            <ToolBtn
              icon={<ItalicOutlined />}
              action={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              tip="Italic"
            />
            <ToolBtn
              icon={<StrikethroughOutlined />}
              action={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')}
              tip="Strikethrough"
            />
            <ToolBtn
              icon={<CodeOutlined />}
              action={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive('code')}
              tip="Inline code"
            />

            <Divider orientation="vertical" />

            <ToolBtn
              icon={<span style={{ fontSize: 12, fontWeight: 700 }}>H2</span>}
              action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              tip="Heading 2"
            />
            <ToolBtn
              icon={<span style={{ fontSize: 12, fontWeight: 700 }}>H3</span>}
              action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })}
              tip="Heading 3"
            />

            <Divider orientation="vertical" />

            <ToolBtn
              icon={<UnorderedListOutlined />}
              action={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              tip="Bullet list"
            />
            <ToolBtn
              icon={<OrderedListOutlined />}
              action={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              tip="Numbered list"
            />

            <Divider orientation="vertical" />

            <ToolBtn
              icon={<span style={{ fontSize: 11 }}>{'{}'}</span>}
              action={() => editor.chain().focus().toggleCodeBlock().run()}
              active={editor.isActive('codeBlock')}
              tip="Code block"
            />
            <ToolBtn
              icon={<span style={{ fontSize: 12 }}>&ldquo;</span>}
              action={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              tip="Blockquote"
            />
            <ToolBtn
              icon={<LinkOutlined />}
              action={addLink}
              active={editor.isActive('link')}
              tip="Link"
            />
            <ToolBtn
              icon={<LineOutlined />}
              action={() => editor.chain().focus().setHorizontalRule().run()}
              tip="Horizontal rule"
            />

            <Divider orientation="vertical" />

            <ToolBtn
              icon={<UndoOutlined />}
              action={() => editor.chain().focus().undo().run()}
              tip="Undo"
            />
            <ToolBtn
              icon={<RedoOutlined />}
              action={() => editor.chain().focus().redo().run()}
              tip="Redo"
            />

            <Divider orientation="vertical" />

            {/* HTML import/export button */}
            <Tooltip title="Xem / Import HTML">
              <Button
                type="text"
                size="small"
                icon={<CodeSandboxOutlined />}
                onClick={openHtmlModal}
                style={{ minWidth: 32, color: '#1677ff' }}
              >
                HTML
              </Button>
            </Tooltip>
          </Space>
        </div>

        {/* Editor content */}
        <EditorContent editor={editor} />

        {/* Basic styles for editor content */}
        <style jsx global>{`
          .tiptap h2 {
            font-size: 1.5em;
            font-weight: 600;
            margin: 1em 0 0.5em;
          }
          .tiptap h3 {
            font-size: 1.25em;
            font-weight: 600;
            margin: 1em 0 0.5em;
          }
          .tiptap p {
            margin: 0.5em 0;
          }
          .tiptap ul,
          .tiptap ol {
            padding-left: 1.5em;
            margin: 0.5em 0;
          }
          .tiptap blockquote {
            border-left: 3px solid #d9d9d9;
            padding-left: 1em;
            color: #666;
            margin: 0.5em 0;
          }
          .tiptap pre {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 12px 16px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 0.5em 0;
          }
          .tiptap code {
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.9em;
          }
          .tiptap pre code {
            background: none;
            padding: 0;
          }
          .tiptap a {
            color: #1677ff;
            text-decoration: underline;
          }
          .tiptap hr {
            border: none;
            border-top: 1px solid #d9d9d9;
            margin: 1em 0;
          }
          .tiptap p.is-editor-empty:first-child::before {
            color: #adb5bd;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }
        `}</style>
      </div>

      {/* HTML Modal */}
      <Modal
        title="HTML Editor"
        open={htmlModalOpen}
        onCancel={() => setHtmlModalOpen(false)}
        width={760}
        footer={[
          <Button key="cancel" onClick={() => setHtmlModalOpen(false)}>
            Huỷ
          </Button>,
          <Button key="apply" type="primary" onClick={applyHtml}>
            Áp dụng
          </Button>,
        ]}
      >
        <p style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>
          Paste HTML vào đây để import nội dung, hoặc copy HTML hiện tại để export.
        </p>
        <TextArea
          value={htmlInput}
          onChange={(e) => setHtmlInput(e.target.value)}
          rows={18}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
          placeholder="Paste HTML content vào đây..."
        />
      </Modal>
    </>
  );
}