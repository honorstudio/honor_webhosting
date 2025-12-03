import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 갱신
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. 공개 페이지들 - 누구나 접근 가능
  // 메인 페이지(/)와 사이트 페이지(/sites/*)는 공개
  if (pathname === '/' || pathname.startsWith('/sites')) {
    return supabaseResponse;
  }

  // 2. 로그인 페이지 - 비로그인만
  if (pathname === '/login') {
    if (user) {
      // 로그인한 사용자는 역할에 따라 리다이렉트
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const url = request.nextUrl.clone();
      url.pathname = profile?.role === 'admin' ? '/admin' : '/manage';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // 3. 로그인 필요한 페이지들
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 4. admin 역할 확인 필요한 페이지
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // admin이 아니면 /manage로 리다이렉트
    if (!profile || profile.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/manage';
      return NextResponse.redirect(url);
    }
  }

  // 5. /manage, /sites/* 는 로그인만 되어 있으면 접근 가능
  return supabaseResponse;
}
