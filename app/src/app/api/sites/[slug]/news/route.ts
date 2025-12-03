import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/sites/[slug]/news - 소식 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 사이트 조회
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id')
      .eq('slug', slug)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: '사이트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 소식 목록 조회 (공개된 것만)
    const { data: news, error: newsError, count } = await supabase
      .from('posts')
      .select('id, title, excerpt, thumbnail, view_count, created_at', { count: 'exact' })
      .eq('site_id', site.id)
      .eq('post_type', 'news')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (newsError) {
      console.error('소식 조회 오류:', newsError);
      return NextResponse.json(
        { error: '소식을 불러오는데 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: news || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/sites/[slug]/news - 소식 작성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { title, content, excerpt, thumbnail, status = 'published' } = body;

    // 필수 필드 검증
    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수입니다.' },
        { status: 400 }
      );
    }

    // 사이트 조회
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id')
      .eq('slug', slug)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: '사이트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 소식 생성
    const { data: news, error: insertError } = await supabase
      .from('posts')
      .insert({
        site_id: site.id,
        title,
        content,
        excerpt: excerpt || title.substring(0, 100),
        thumbnail,
        post_type: 'news',
        status,
        view_count: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('소식 생성 오류:', insertError);
      return NextResponse.json(
        { error: '소식 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: news }, { status: 201 });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
