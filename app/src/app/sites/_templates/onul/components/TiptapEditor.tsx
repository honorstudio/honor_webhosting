'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Code,
  Palette,
  Link2Off,
  X,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface TiptapEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

// 모달 타입
type ModalType = 'link' | 'image' | null;

// 링크 입력 모달 컴포넌트
function LinkModal({
  isOpen,
  onClose,
  onConfirm,
  initialValue = '',
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(value);
    setValue('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">링크 추가</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <input
            ref={inputRef}
            type="url"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
            >
              {initialValue ? '수정' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 이미지 추가 모달 컴포넌트 (URL + 파일 업로드)
function ImageModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'url' | 'file'>('file');
  const [urlValue, setUrlValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'url' && urlInputRef.current) {
      urlInputRef.current.focus();
    }
  }, [isOpen, activeTab]);

  // 모달 닫을 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setUrlValue('');
      setSelectedFile(null);
      setPreviewUrl('');
      setActiveTab('file');
      setIsDragOver(false);
      setError('');
    }
  }, [isOpen]);

  // 파일 처리 공통 함수
  const processFile = (file: File) => {
    setError('');

    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하여야 합니다.');
      return;
    }

    setSelectedFile(file);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // 클릭하여 파일 선택
  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'url') {
      if (urlValue) {
        onConfirm(urlValue);
        onClose();
      }
    } else if (activeTab === 'file' && selectedFile) {
      // 파일 업로드의 경우 Data URL로 직접 삽입 (추후 Supabase Storage로 변경 가능)
      setIsUploading(true);
      try {
        // TODO: 실제 파일 업로드 구현 시 Supabase Storage 사용
        // 현재는 Base64 Data URL로 직접 삽입
        onConfirm(previewUrl);
        onClose();
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">이미지 추가</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 - 파일 업로드가 먼저 */}
        <div className="flex border-b border-gray-100">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'file'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            파일 업로드
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'url'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            URL 입력
          </button>
        </div>

        {/* 본문 */}
        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === 'file' ? (
            <div>
              {/* 숨겨진 파일 입력 - label의 htmlFor로 연결 */}
              <input
                id="tiptap-image-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                aria-label="이미지 파일 선택"
              />

              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="미리보기"
                    className="w-full h-48 object-contain rounded-xl border border-gray-200 bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    {selectedFile?.name} ({((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)}MB)
                  </p>
                </div>
              ) : (
                <div
                  onClick={handleClickUpload}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleClickUpload()}
                  className={`flex flex-col items-center justify-center gap-3 p-8 h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                >
                  <div className={`p-3 rounded-full ${isDragOver ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <ImageIcon className={`w-6 h-6 ${isDragOver ? 'text-blue-600' : 'text-gray-500'}`} />
                  </div>
                  <div className="text-center">
                    <p className={`font-medium ${isDragOver ? 'text-blue-600' : 'text-gray-700'}`}>
                      {isDragOver ? '여기에 놓으세요' : '클릭 또는 드래그하여 업로드'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, GIF, WebP (최대 10MB)
                    </p>
                  </div>
                </div>
              )}

              {/* 에러 메시지 */}
              {error && (
                <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
              )}
            </div>
          ) : (
            <input
              ref={urlInputRef}
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          )}

          {/* 버튼 */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={
                isUploading ||
                (activeTab === 'url' && !urlValue) ||
                (activeTab === 'file' && !selectedFile)
              }
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? '업로드 중...' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 색상 팔레트
const TEXT_COLORS = [
  { name: '기본', color: '#000000' },
  { name: '빨강', color: '#ef4444' },
  { name: '주황', color: '#f97316' },
  { name: '노랑', color: '#eab308' },
  { name: '초록', color: '#22c55e' },
  { name: '파랑', color: '#3b82f6' },
  { name: '보라', color: '#a855f7' },
  { name: '회색', color: '#6b7280' },
];

const HIGHLIGHT_COLORS = [
  { name: '노랑', color: '#fef08a' },
  { name: '초록', color: '#bbf7d0' },
  { name: '파랑', color: '#bfdbfe' },
  { name: '분홍', color: '#fbcfe8' },
  { name: '주황', color: '#fed7aa' },
];

export default function TiptapEditor({
  content = '',
  onChange,
  placeholder = '내용을 입력하세요...',
  editable = true,
  className = '',
}: TiptapEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const highlightPickerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭시 팝업 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
      if (highlightPickerRef.current && !highlightPickerRef.current.contains(event.target as Node)) {
        setShowHighlightPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[200px] h-full px-4 py-3',
      },
    },
  });

  if (!editor) {
    return null;
  }

  // 링크 모달 열기
  const openLinkModal = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setModalType('link');
  };

  // 링크 추가/수정 처리
  const handleLinkConfirm = (url: string) => {
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setModalType(null);
  };

  // 링크 제거
  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  // 이미지 모달 열기
  const openImageModal = () => {
    setModalType('image');
  };

  // 이미지 추가 처리
  const handleImageConfirm = (url: string) => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    setModalType(null);
  };

  // 모달 닫기
  const closeModal = () => {
    setModalType(null);
    setLinkUrl('');
  };

  // 툴바 버튼 스타일
  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : disabled
          ? 'text-gray-300 cursor-not-allowed'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );

  // 구분선
  const Divider = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col ${className}`}>
      {/* 툴바 */}
      {editable && (
        <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          {/* 텍스트 스타일 */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="굵게 (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="기울임 (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="밑줄 (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="취소선"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="인라인 코드"
          >
            <Code className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          {/* 글자 색상 */}
          <div className="relative" ref={colorPickerRef}>
            <ToolbarButton
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowHighlightPicker(false);
              }}
              title="글자 색상"
            >
              <Palette className="w-4 h-4" />
            </ToolbarButton>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="flex gap-1">
                  {TEXT_COLORS.map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().setColor(item.color).run();
                        setShowColorPicker(false);
                      }}
                      title={item.name}
                      className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                      style={{ backgroundColor: item.color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 형광펜 */}
          <div className="relative" ref={highlightPickerRef}>
            <ToolbarButton
              onClick={() => {
                setShowHighlightPicker(!showHighlightPicker);
                setShowColorPicker(false);
              }}
              isActive={editor.isActive('highlight')}
              title="형광펜"
            >
              <Highlighter className="w-4 h-4" />
            </ToolbarButton>
            {showHighlightPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="flex gap-1">
                  {HIGHLIGHT_COLORS.map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().toggleHighlight({ color: item.color }).run();
                        setShowHighlightPicker(false);
                      }}
                      title={item.name}
                      className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                      style={{ backgroundColor: item.color }}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().unsetHighlight().run();
                      setShowHighlightPicker(false);
                    }}
                    title="형광펜 제거"
                    className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform bg-white text-xs text-gray-400"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          <Divider />

          {/* 헤딩 */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="제목 1"
          >
            <Heading1 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="제목 2"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="제목 3"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          {/* 정렬 */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="왼쪽 정렬"
          >
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="가운데 정렬"
          >
            <AlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="오른쪽 정렬"
          >
            <AlignRight className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="양쪽 정렬"
          >
            <AlignJustify className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          {/* 리스트 */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="글머리 기호"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="번호 매기기"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="인용"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          {/* 구분선 */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="구분선"
          >
            <Minus className="w-4 h-4" />
          </ToolbarButton>

          {/* 링크 */}
          <ToolbarButton
            onClick={openLinkModal}
            isActive={editor.isActive('link')}
            title="링크 추가/수정"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          {editor.isActive('link') && (
            <ToolbarButton
              onClick={removeLink}
              title="링크 제거"
            >
              <Link2Off className="w-4 h-4" />
            </ToolbarButton>
          )}

          {/* 이미지 */}
          <ToolbarButton onClick={openImageModal} title="이미지 추가">
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>

          <Divider />

          {/* 실행 취소/다시 실행 */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="실행 취소 (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="다시 실행 (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </ToolbarButton>
        </div>
      )}

      {/* 에디터 콘텐츠 */}
      <div className="flex-1 overflow-auto min-h-0">
        <EditorContent editor={editor} className="h-full [&_.ProseMirror]:min-h-full" />
      </div>

      {/* 에디터 스타일 */}
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .ProseMirror p {
          margin-bottom: 0.75rem;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .ProseMirror ul {
          list-style-type: disc;
        }
        .ProseMirror ol {
          list-style-type: decimal;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #2563eb;
          padding-left: 1rem;
          margin-left: 0;
          margin-bottom: 0.75rem;
          color: #6b7280;
          font-style: italic;
        }
        .ProseMirror hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 1.5rem 0;
        }
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .ProseMirror code {
          background-color: #f3f4f6;
          border-radius: 0.25rem;
          padding: 0.125rem 0.375rem;
          font-family: ui-monospace, monospace;
          font-size: 0.875em;
          color: #ef4444;
        }
        .ProseMirror mark {
          border-radius: 0.125rem;
          padding: 0.125rem 0;
        }
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }
        .ProseMirror a:hover {
          color: #1d4ed8;
        }
      `}</style>

      {/* 링크 모달 */}
      <LinkModal
        isOpen={modalType === 'link'}
        onClose={closeModal}
        onConfirm={handleLinkConfirm}
        initialValue={linkUrl}
      />

      {/* 이미지 모달 */}
      <ImageModal
        isOpen={modalType === 'image'}
        onClose={closeModal}
        onConfirm={handleImageConfirm}
      />
    </div>
  );
}
