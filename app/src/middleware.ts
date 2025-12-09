import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// 특별 도메인 매핑 (DB 조회 없이 직접 매핑)
// app.onul.day 라우팅:
//   - /index → 랜딩 페이지 (마케팅/홍보)
//   - / 및 나머지 → Expo 앱 (static HTML)
const SPECIAL_DOMAINS: Record<string, { slug: string; isExpoApp?: boolean }> = {
  'app.onul.day': { slug: 'onul', isExpoApp: true },
  // 추가 특별 도메인이 필요하면 여기에 추가
}

// 커스텀 도메인 라우팅 처리
async function handleCustomDomain(request: NextRequest): Promise<NextResponse | null> {
  const hostname = request.headers.get('host') || ''

  // localhost, vercel 기본 도메인은 커스텀 도메인 처리 제외
  if (
    hostname.includes('localhost') ||
    hostname.includes('vercel.app') ||
    hostname.includes('127.0.0.1')
  ) {
    return null
  }

  // www 제거
  const domain = hostname.replace(/^www\./, '')

  // 특별 도메인 처리 (DB 조회 없이 직접 처리)
  const specialDomain = SPECIAL_DOMAINS[domain]
  if (specialDomain) {
    const url = request.nextUrl.clone()
    const pathname = url.pathname

    // 이미 /sites/[slug] 경로면 그대로 진행
    if (pathname.startsWith(`/sites/${specialDomain.slug}`)) {
      return null
    }

    // /index 경로는 랜딩 페이지로
    if (pathname === '/index') {
      url.pathname = `/sites/${specialDomain.slug}/index`
      return NextResponse.rewrite(url)
    }

    // Expo 앱 도메인인 경우: 루트 및 기타 경로는 static HTML로
    if (specialDomain.isExpoApp) {
      // 루트 경로는 Expo 앱 HTML로
      if (pathname === '/') {
        url.pathname = '/onul-app.html'
        return NextResponse.rewrite(url)
      }
      // Expo 앱 내부 라우팅도 같은 HTML로 (SPA)
      // 단, 정적 파일 경로는 제외
      if (!pathname.startsWith('/_expo') && !pathname.startsWith('/onul-')) {
        url.pathname = '/onul-app.html'
        return NextResponse.rewrite(url)
      }
      return null
    }

    // 다른 경로는 사이트 하위로 리라이트
    url.pathname = `/sites/${specialDomain.slug}${pathname}`
    return NextResponse.rewrite(url)
  }

  // Supabase에서 해당 도메인의 사이트 조회
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {},
      },
    }
  )

  const { data: site } = await supabase
    .from('sites')
    .select('slug')
    .eq('domain', domain)
    .single()

  if (site) {
    // 커스텀 도메인으로 접속 시 해당 사이트 페이지로 리라이트
    const url = request.nextUrl.clone()
    const pathname = url.pathname

    // 이미 /sites/[slug] 경로면 그대로 진행
    if (pathname.startsWith(`/sites/${site.slug}`)) {
      return null
    }

    // 인증 관련 경로는 리라이트하지 않음 (원래 페이지 사용)
    // /login, /auth/*, /api/auth/* 등은 제외
    const authPaths = ['/login', '/auth', '/signup', '/register']
    if (authPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
      return null
    }

    // 루트 경로는 사이트 메인으로
    if (pathname === '/') {
      url.pathname = `/sites/${site.slug}`
      return NextResponse.rewrite(url)
    }

    // 다른 경로는 사이트 하위로 리라이트
    // 예: /news -> /sites/onul/news
    url.pathname = `/sites/${site.slug}${pathname}`
    return NextResponse.rewrite(url)
  }

  return null
}

export async function middleware(request: NextRequest) {
  // 1. 커스텀 도메인 처리
  const customDomainResponse = await handleCustomDomain(request)
  if (customDomainResponse) {
    return customDomainResponse
  }

  // 2. 기존 세션 처리
  return await updateSession(request)
}

export const config = {
  matcher: [
    // 정적 파일과 API 라우트를 제외한 모든 경로
    // _expo 경로도 제외 (Expo 앱 정적 파일)
    '/((?!_next/static|_next/image|_expo/|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html|ico|css|js)$).*)',
  ],
}
