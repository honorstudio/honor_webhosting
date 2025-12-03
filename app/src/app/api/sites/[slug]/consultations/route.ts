import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import nodemailer from 'nodemailer';

/**
 * 상담 신청 API
 * POST /api/sites/[slug]/consultations
 *
 * - Supabase에 상담 내역 저장
 * - 사이트 설정의 알림 이메일로 알림 발송
 */

// 이메일 발송 함수
async function sendNotificationEmail(
  to: string,
  siteName: string,
  consultation: {
    name: string;
    phone: string;
    email?: string;
    message?: string;
  }
) {
  // SMTP 설정 (환경 변수에서 가져옴)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // 이메일 내용
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `[${siteName}] 새로운 상담 문의가 접수되었습니다`,
    html: `
      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">
          새로운 상담 문의
        </h2>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 15px 0;">
            <strong style="color: #666;">접수 시간:</strong><br>
            <span style="color: #333;">${dateStr}</span>
          </p>

          <p style="margin: 0 0 15px 0;">
            <strong style="color: #666;">고객명:</strong><br>
            <span style="color: #333; font-size: 18px;">${consultation.name}</span>
          </p>

          <p style="margin: 0 0 15px 0;">
            <strong style="color: #666;">연락처:</strong><br>
            <a href="tel:${consultation.phone}" style="color: #0066cc; font-size: 18px; text-decoration: none;">
              ${consultation.phone}
            </a>
          </p>

          ${consultation.email ? `
          <p style="margin: 0 0 15px 0;">
            <strong style="color: #666;">이메일:</strong><br>
            <a href="mailto:${consultation.email}" style="color: #0066cc; font-size: 18px; text-decoration: none;">
              ${consultation.email}
            </a>
          </p>
          ` : ''}

          ${consultation.message ? `
          <p style="margin: 0;">
            <strong style="color: #666;">문의 내용:</strong><br>
            <span style="color: #333; white-space: pre-wrap;">${consultation.message}</span>
          </p>
          ` : ''}
        </div>

        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          이 이메일은 ${siteName} 웹사이트에서 자동으로 발송되었습니다.
        </p>
      </div>
    `,
    text: `
[${siteName}] 새로운 상담 문의

접수 시간: ${dateStr}
고객명: ${consultation.name}
연락처: ${consultation.phone}
${consultation.email ? `이메일: ${consultation.email}` : ''}
${consultation.message ? `문의 내용: ${consultation.message}` : ''}

이 이메일은 ${siteName} 웹사이트에서 자동으로 발송되었습니다.
    `.trim(),
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const { name, phone, email, message } = body;

    // 필수 필드 검증
    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json(
        { error: '이름과 연락처는 필수입니다.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 사이트 정보 조회 (알림 이메일 포함)
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id, name, notification_email, contact_email')
      .eq('slug', slug)
      .single();

    if (siteError || !site) {
      return NextResponse.json(
        { error: '사이트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 상담 내역 저장
    const { data: consultation, error: insertError } = await supabase
      .from('consultations')
      .insert({
        site_id: site.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        message: message?.trim() || null,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) {
      console.error('상담 저장 실패:', insertError);
      return NextResponse.json(
        { error: '상담 신청 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 알림 이메일 발송 (notification_email이 있는 경우)
    const notificationEmail = site.notification_email || site.contact_email;

    if (notificationEmail && process.env.SMTP_USER) {
      try {
        await sendNotificationEmail(
          notificationEmail,
          site.name,
          { name: name.trim(), phone: phone.trim(), email: email?.trim(), message: message?.trim() }
        );
        console.log(`알림 이메일 발송 완료: ${notificationEmail}`);
      } catch (emailError) {
        // 이메일 발송 실패해도 상담 저장은 성공으로 처리
        console.error('이메일 발송 실패:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      data: consultation,
    });
  } catch (error) {
    console.error('상담 신청 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
