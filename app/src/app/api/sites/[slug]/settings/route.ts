import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// PATCH /api/sites/[slug]/settings - 사이트 설정 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const { logo_horizontal, logo_vertical, brand_color } = body;

    // 관리자 클라이언트 사용 (RLS 우회)
    const supabase = createAdminClient();

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

    // 업데이트할 필드 구성
    const updateData: Record<string, unknown> = {};
    if (logo_horizontal !== undefined) updateData.logo_horizontal = logo_horizontal;
    if (logo_vertical !== undefined) updateData.logo_vertical = logo_vertical;
    if (brand_color !== undefined) updateData.brand_color = brand_color;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: '업데이트할 데이터가 없습니다.' },
        { status: 400 }
      );
    }

    // 설정 업데이트
    const { data: updatedSite, error: updateError } = await supabase
      .from('sites')
      .update(updateData)
      .eq('id', site.id)
      .select('id, name, slug, domain, logo_horizontal, logo_vertical, brand_color')
      .single();

    if (updateError) {
      console.error('설정 업데이트 오류:', updateError);
      return NextResponse.json(
        { error: '설정 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedSite });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// GET /api/sites/[slug]/settings - 사이트 설정 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createAdminClient();

    const { data: site, error } = await supabase
      .from('sites')
      .select('id, name, slug, domain, logo_horizontal, logo_vertical, brand_color')
      .eq('slug', slug)
      .single();

    if (error || !site) {
      return NextResponse.json(
        { error: '사이트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: site });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
