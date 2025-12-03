'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * 로그인 폼 컴포넌트
 * useSearchParams를 사용하므로 Suspense로 감싸야 함
 */
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // 로그인 처리
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const supabase = createClient();

    if (mode === 'login') {
      // 로그인
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message === 'Invalid login credentials'
          ? '이메일 또는 비밀번호가 올바르지 않습니다.'
          : error.message);
        setIsLoading(false);
        return;
      }
    } else {
      // 회원가입
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'admin', // 첫 사용자는 admin으로
          },
        },
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      // 회원가입 후 프로필 생성은 트리거로 처리
      setError('');
      alert('회원가입 완료! 로그인해주세요.');
      setMode('login');
      setIsLoading(false);
      return;
    }

    // redirect URL이 있으면 해당 페이지로 이동
    if (redirectUrl) {
      router.push(redirectUrl);
      router.refresh();
      return;
    }

    // 로그인 성공 후 사용자 역할에 따라 리다이렉트
    // 사용자 정보 다시 가져오기
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/');
      router.refresh();
      return;
    }

    // 프로필에서 역할 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin';

    if (isAdmin) {
      // 어드민은 /manage로 (모든 사이트 목록)
      router.push('/manage');
    } else {
      // 일반 사용자는 자신의 사이트 확인
      const { data: sites } = await supabase
        .from('sites')
        .select('slug')
        .eq('owner_id', user.id)
        .limit(2);

      if (sites && sites.length === 1) {
        // 사이트가 1개면 바로 해당 사이트 관리 페이지로
        router.push(`/sites/${sites[0].slug}/manage`);
      } else {
        // 사이트가 없거나 여러 개면 /manage로
        router.push('/manage');
      }
    }

    router.refresh();
  };

  return (
    <div className="w-full max-w-md px-6">
      {/* 로고/제목 영역 */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Honor Webhosting
        </h1>
        <p className="text-sm text-foreground-muted">
          웹 호스팅 관리 시스템
        </p>
      </div>

      {/* 로그인 폼 카드 */}
      <div className="bg-surface border border-border rounded-lg p-8">
        <h2 className="text-lg font-medium text-foreground mb-6">
          {mode === 'login' ? '로그인' : '회원가입'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이메일 입력 */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground mb-2"
            >
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              placeholder="이메일을 입력하세요"
              required
              autoFocus
            />
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground mb-2"
            >
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              placeholder="비밀번호를 입력하세요"
              required
              minLength={6}
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          {/* 로그인/회원가입 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? (mode === 'login' ? '로그인 중...' : '가입 중...')
              : (mode === 'login' ? '로그인' : '회원가입')}
          </button>
        </form>

        {/* 모드 전환 */}
        <div className="mt-6 pt-6 border-t border-border text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
            className="text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            {mode === 'login'
              ? '계정이 없으신가요? 회원가입'
              : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 로그인 페이지
 * Supabase Auth를 사용한 이메일/비밀번호 인증
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Suspense fallback={
        <div className="text-foreground-muted">로딩 중...</div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
