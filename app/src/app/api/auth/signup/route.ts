import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: '환경변수 누락' }, { status: 500 });
    }

    const body = await request.json();
    const { email, password, role = 'user', name } = body;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 회원가입
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          name: name || email.split('@')[0],
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: '회원가입 완료'
    });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
