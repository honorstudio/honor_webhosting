'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Save, Eye, Upload, X, Info, Edit3, Clock, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';

// Tiptap 에디터를 클라이언트에서만 로드
const TiptapEditor = dynamic(() => import('../../components/TiptapEditor'), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-200 rounded-xl p-8 text-center text-gray-500">
      에디터 로딩 중...
    </div>
  ),
});

// 썸네일 이미지 권장 사양
const THUMBNAIL_SPECS = {
  ratio: '16:9',
  width: 1200,
  height: 675,
  maxSize: 5, // MB
  formats: ['JPG', 'PNG', 'WebP'],
};

// 자동 저장 간격 (밀리초)
const AUTO_SAVE_INTERVAL = 30000; // 30초

export default function OnulNewsWriteV2() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 권한 확인 및 사이트 ID 가져오기
  useEffect(() => {
    const checkAuthAndFetchSite = async () => {
      const supabase = createClient();

      // 현재 로그인한 사용자 확인
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setAuthStatus('unauthorized');
        return;
      }

      // onul 사이트 정보 가져오기
      const { data: site } = await supabase
        .from('sites')
        .select('id, owner_id')
        .eq('slug', 'onul')
        .single();

      if (!site) {
        setAuthStatus('unauthorized');
        return;
      }

      // 소유자인지 확인
      if (site.owner_id === user.id) {
        setSiteId(site.id);
        setAuthStatus('authorized');
        return;
      }

      // 멤버인지 확인 (editor 이상 권한)
      const { data: member } = await supabase
        .from('site_members')
        .select('role')
        .eq('site_id', site.id)
        .eq('user_id', user.id)
        .single();

      if (member && ['owner', 'admin', 'editor'].includes(member.role)) {
        setSiteId(site.id);
        setAuthStatus('authorized');
      } else {
        setAuthStatus('unauthorized');
      }
    };

    checkAuthAndFetchSite();
  }, []);

  // 로컬 스토리지에서 임시저장 데이터 복원
  useEffect(() => {
    const savedDraft = localStorage.getItem('news_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.title || draft.content || draft.excerpt) {
          const restore = window.confirm('이전에 작성 중이던 글이 있습니다. 복원하시겠습니까?');
          if (restore) {
            setTitle(draft.title || '');
            setContent(draft.content || '');
            setExcerpt(draft.excerpt || '');
            setThumbnailUrl(draft.thumbnailUrl || '');
            if (draft.draftId) setDraftId(draft.draftId);
            setLastSaved(draft.savedAt ? new Date(draft.savedAt) : null);
          } else {
            localStorage.removeItem('news_draft');
          }
        }
      } catch (e) {
        console.error('임시저장 복원 실패:', e);
      }
    }
  }, []);

  // 자동 임시저장 (로컬 스토리지)
  useEffect(() => {
    const autoSave = setInterval(() => {
      if (title || content || excerpt) {
        const draft = {
          title,
          content,
          excerpt,
          thumbnailUrl,
          draftId,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem('news_draft', JSON.stringify(draft));
        setLastSaved(new Date());
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(autoSave);
  }, [title, content, excerpt, thumbnailUrl, draftId]);

  // 파일 처리 공통 함수
  const processFile = (file: File) => {
    setUploadError('');

    // 파일 형식 검증
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('JPG, PNG, WebP 형식만 지원합니다.');
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > THUMBNAIL_SPECS.maxSize * 1024 * 1024) {
      setUploadError(`파일 크기는 ${THUMBNAIL_SPECS.maxSize}MB 이하여야 합니다.`);
      return;
    }

    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setThumbnailPreview(result);
      setThumbnailFile(file);
      setThumbnailUrl(''); // URL 입력 초기화
    };
    reader.readAsDataURL(file);
  };

  // 이미지 파일 선택 처리
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

  // 이미지 제거
  const handleRemoveImage = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
    setThumbnailUrl('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 썸네일 업로드 (Supabase Storage)
  const uploadThumbnail = async (): Promise<string | null> => {
    if (!thumbnailFile) return thumbnailUrl || null;

    const supabase = createClient();
    const fileExt = thumbnailFile.name.split('.').pop();
    const fileName = `news/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, thumbnailFile);

    if (error) {
      console.error('썸네일 업로드 실패:', error);
      return thumbnailUrl || null;
    }

    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  // 임시저장 (Supabase에 draft 상태로 저장)
  const handleSaveDraft = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!siteId) {
      alert('사이트 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsSavingDraft(true);

    try {
      const supabase = createClient();
      const finalThumbnail = await uploadThumbnail();

      const postData = {
        site_id: siteId,
        title: title.trim(),
        content: content || '',
        excerpt: excerpt || title.substring(0, 100),
        thumbnail: finalThumbnail,
        status: 'draft' as const,
        post_type: 'news',
        updated_at: new Date().toISOString(),
      };

      if (draftId) {
        // 기존 임시저장 업데이트
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', draftId);

        if (error) throw error;
      } else {
        // 새 임시저장 생성
        const { data, error } = await supabase
          .from('posts')
          .insert(postData)
          .select('id')
          .single();

        if (error) throw error;
        if (data) setDraftId(data.id);
      }

      setLastSaved(new Date());
      localStorage.setItem('news_draft', JSON.stringify({
        title, content, excerpt, thumbnailUrl: finalThumbnail, draftId,
        savedAt: new Date().toISOString(),
      }));

      alert('임시저장되었습니다.');
    } catch (error) {
      console.error('임시저장 실패:', error);
      alert('임시저장에 실패했습니다.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // 발행 (published 상태로 저장)
  const handlePublish = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!content.trim() || content === '<p></p>') {
      alert('내용을 입력해주세요.');
      return;
    }

    if (!siteId) {
      alert('사이트 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const finalThumbnail = await uploadThumbnail();

      const postData = {
        site_id: siteId,
        title: title.trim(),
        content,
        excerpt: excerpt || title.substring(0, 100),
        thumbnail: finalThumbnail,
        status: 'published' as const,
        post_type: 'news',
        updated_at: new Date().toISOString(),
      };

      if (draftId) {
        // 임시저장 글을 발행으로 변경
        const { error } = await supabase
          .from('posts')
          .update(postData)
          .eq('id', draftId);

        if (error) throw error;
      } else {
        // 새 글 발행
        const { error } = await supabase
          .from('posts')
          .insert(postData);

        if (error) throw error;
      }

      // 로컬 임시저장 삭제
      localStorage.removeItem('news_draft');

      alert('소식이 발행되었습니다.');
      window.location.href = '/sites/onul/news';
    } catch (error) {
      console.error('발행 실패:', error);
      alert('발행에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 마지막 저장 시간 포맷
  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

    if (diff < 60) return '방금 전 저장됨';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전 저장됨`;
    return lastSaved.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) + ' 저장됨';
  };

  // 로딩 중
  if (authStatus === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // 권한 없음
  if (authStatus === 'unauthorized') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-6">
            소식을 작성하려면 관리자 권한이 필요합니다.<br />
            로그인 후 다시 시도해주세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/login"
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              로그인
            </a>
            <a
              href="/sites/onul/news"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              소식 목록으로
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* 글쓰기 전용 헤더 - 네비게이션에 버튼 통합 */}
      <nav className="flex-shrink-0 bg-white/95 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-16">
            {/* 좌측: 로고 + 제목 */}
            <div className="flex items-center gap-4">
              <a href="/sites/onul" className="flex items-center">
                <span className="text-xl font-bold text-gray-900">오늘청소</span>
              </a>
              <span className="text-gray-300">|</span>
              <h1 className="text-sm md:text-base font-semibold text-gray-900">
                새 소식 작성
              </h1>
              {/* 마지막 저장 시간 표시 */}
              {lastSaved && (
                <span className="hidden md:flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {formatLastSaved()}
                </span>
              )}
            </div>

            {/* 우측: 미리보기, 취소, 임시저장, 발행 버튼 */}
            <div className="flex items-center gap-2">
              {/* 미리보기/편집 토글 */}
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {showPreview ? (
                  <>
                    <Edit3 className="w-4 h-4" />
                    <span className="hidden sm:inline">편집</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">미리보기</span>
                  </>
                )}
              </button>
              {/* 취소 */}
              <a
                href="/sites/onul/news"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                취소
              </a>
              {/* 임시저장 */}
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">{isSavingDraft ? '저장 중...' : '임시저장'}</span>
              </button>
              {/* 발행 */}
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? '발행 중...' : '발행'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 - 화면 전체 채움, 모바일에서는 스크롤 가능 */}
      <main className="flex-1 overflow-auto md:overflow-hidden">
        <div className="min-h-full md:h-full max-w-7xl mx-auto px-6 md:px-12 py-6">

          {showPreview ? (
            /* 미리보기 모드 */
            <div className="h-full overflow-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {title || '제목 없음'}
              </h2>
              {(thumbnailPreview || thumbnailUrl) && (
                <img
                  src={thumbnailPreview || thumbnailUrl}
                  alt="썸네일"
                  className="w-full h-64 object-cover rounded-xl mb-6"
                />
              )}
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: content || '<p>내용 없음</p>' }}
              />
            </div>
          ) : (
            /* 편집 모드 - PC에서 좌우 2컬럼 레이아웃 */
            <div className="min-h-full md:h-full flex flex-col md:flex-row gap-6">
              {/* 좌측 패널 - 메타 정보 */}
              <div className="w-full md:w-80 flex-shrink-0 md:h-full md:overflow-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  {/* 목록으로 버튼 */}
                  <a
                    href="/sites/onul/news"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 text-sm font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    목록으로 돌아가기
                  </a>

                  <div className="space-y-5">
                    {/* 제목 입력 */}
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        제목 <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="소식 제목을 입력하세요"
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>

                    {/* 썸네일 이미지 업로드 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        썸네일 이미지
                      </label>

                      {/* 숨겨진 파일 입력 */}
                      <input
                        id="thumbnail-upload"
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        aria-label="썸네일 이미지 선택"
                      />

                      {thumbnailPreview || thumbnailUrl ? (
                        <div className="relative">
                          <img
                            src={thumbnailPreview || thumbnailUrl}
                            alt="썸네일 미리보기"
                            className="w-full h-36 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                            title="이미지 제거"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          {thumbnailFile && (
                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                              {(thumbnailFile.size / 1024 / 1024).toFixed(2)}MB
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                          className={`flex flex-col items-center justify-center gap-2 p-4 h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            isDragOver
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`p-2 rounded-full ${isDragOver ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            <Upload className={`w-4 h-4 ${isDragOver ? 'text-blue-600' : 'text-gray-500'}`} />
                          </div>
                          <div className="text-center">
                            <p className={`font-medium text-xs ${isDragOver ? 'text-blue-600' : 'text-gray-600'}`}>
                              {isDragOver ? '여기에 놓으세요' : '클릭 또는 드래그하여 업로드'}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              JPG, PNG, WebP (최대 5MB)
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 에러 메시지 */}
                      {uploadError && (
                        <p className="mt-2 text-xs text-red-500">{uploadError}</p>
                      )}

                      {/* 권장 사양 안내 */}
                      <div className="flex items-start gap-1.5 mt-2 text-xs text-gray-500">
                        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <div>
                          <span>{THUMBNAIL_SPECS.ratio} · {THUMBNAIL_SPECS.width}x{THUMBNAIL_SPECS.height}px · 최대 {THUMBNAIL_SPECS.maxSize}MB</span>
                          <button
                            type="button"
                            onClick={() => {
                              const url = window.prompt('이미지 URL을 입력하세요:');
                              if (url) {
                                setThumbnailUrl(url);
                                setThumbnailPreview('');
                                setThumbnailFile(null);
                              }
                            }}
                            className="ml-2 text-gray-500 hover:text-gray-700 transition-colors underline"
                          >
                            URL 입력
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 요약 */}
                    <div>
                      <label
                        htmlFor="excerpt"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        요약 <span className="text-xs text-gray-400 font-normal">(목록에 표시)</span>
                      </label>
                      <textarea
                        id="excerpt"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="소식의 간단한 요약을 입력하세요 (선택사항)"
                        rows={3}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 우측 - 본문 에디터 */}
              <div className="flex-1 min-w-0 flex flex-col min-h-[400px] md:min-h-0">
                <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:overflow-hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex-shrink-0">
                    내용 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex-1 min-h-[300px] md:min-h-0 flex flex-col overflow-hidden">
                    <TiptapEditor
                      content={content}
                      onChange={setContent}
                      placeholder="소식 내용을 작성하세요..."
                      className="h-full flex flex-col"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
