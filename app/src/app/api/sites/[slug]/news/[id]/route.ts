import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/sites/[slug]/news/[id] - 소식 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params;
    const supabase = await createClient();

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

    // 소식 조회
    const { data: news, error: newsError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .eq('site_id', site.id)
      .eq('post_type', 'news')
      .single();

    if (newsError || !news) {
      return NextResponse.json(
        { error: '소식을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 조회수 증가
    await supabase
      .from('posts')
      .update({ view_count: (news.view_count || 0) + 1 })
      .eq('id', id);

    return NextResponse.json({ data: { ...news, view_count: (news.view_count || 0) + 1 } });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/sites/[slug]/news/[id] - 소식 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { title, content, excerpt, thumbnail, status } = body;

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

    // 소식 수정
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (status !== undefined) updateData.status = status;

    const { data: news, error: updateError } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .eq('site_id', site.id)
      .eq('post_type', 'news')
      .select()
      .single();

    if (updateError || !news) {
      return NextResponse.json(
        { error: '소식 수정에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: news });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/sites/[slug]/news/[id] - 소식 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params;
    const supabase = await createClient();

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

    // 소식 삭제
    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('site_id', site.id)
      .eq('post_type', 'news');

    if (deleteError) {
      return NextResponse.json(
        { error: '소식 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: '소식이 삭제되었습니다.' });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
