'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * 회원 타입 정의
 */
interface Member {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  joinedAt: string;
  lastLogin: string;
}

/**
 * 회원 관리 페이지
 * 회원 목록 조회, 검색, 상태 관리
 * 동적 slug를 사용하여 사이트별 회원 관리
 */
export default function MembersPage() {
  const params = useParams();
  const slug = params.slug as string;

  // 더미 데이터 (나중에 Supabase에서 가져올 예정)
  const [members] = useState<Member[]>([
    {
      id: '1',
      name: '김철수',
      email: 'kim@example.com',
      status: 'active',
      joinedAt: '2025-01-15',
      lastLogin: '2025-11-25',
    },
    {
      id: '2',
      name: '이영희',
      email: 'lee@example.com',
      status: 'active',
      joinedAt: '2025-02-20',
      lastLogin: '2025-11-24',
    },
    {
      id: '3',
      name: '박민수',
      email: 'park@example.com',
      status: 'inactive',
      joinedAt: '2025-03-10',
      lastLogin: '2025-10-15',
    },
    {
      id: '4',
      name: '정수현',
      email: 'jung@example.com',
      status: 'suspended',
      joinedAt: '2025-04-05',
      lastLogin: '2025-09-20',
    },
    {
      id: '5',
      name: '최지원',
      email: 'choi@example.com',
      status: 'active',
      joinedAt: '2025-05-12',
      lastLogin: '2025-11-23',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [siteId, setSiteId] = useState<string | null>(null);

  // 사이트 ID 로드
  useEffect(() => {
    const loadSiteId = async () => {
      const supabase = createClient();
      const { data: site } = await supabase
        .from('sites')
        .select('id')
        .eq('slug', slug)
        .single();

      if (site) {
        setSiteId(site.id);
        // TODO: 사이트별 회원 목록 로드
      }
    };

    loadSiteId();
  }, [slug]);

  // 검색 필터링
  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 상태별 스타일
  const getStatusStyle = (status: Member['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/30';
      case 'inactive':
        return 'bg-foreground-muted/10 text-foreground-muted border-foreground-muted/30';
      case 'suspended':
        return 'bg-warning/10 text-warning border-warning/30';
    }
  };

  const getStatusText = (status: Member['status']) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'inactive':
        return '비활성';
      case 'suspended':
        return '정지';
    }
  };

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          회원 관리
        </h1>
        <p className="text-foreground-muted">
          전체 {members.length}명의 회원이 등록되어 있습니다
        </p>
      </div>

      {/* 검색 영역 */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="이름 또는 이메일로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-border rounded-lg bg-surface text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-foreground"
        />
      </div>

      {/* 회원 목록 테이블 */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-foreground-muted uppercase">
                  이름
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-foreground-muted uppercase">
                  이메일
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-foreground-muted uppercase">
                  상태
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-foreground-muted uppercase">
                  가입일
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-foreground-muted uppercase">
                  최근 로그인
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-foreground-muted uppercase">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-background transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">
                      {member.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
                          member.status
                        )}`}
                      >
                        {getStatusText(member.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">
                      {member.joinedAt}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">
                      {member.lastLogin}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-sm text-foreground hover:text-foreground-muted transition-colors">
                        관리
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-foreground-muted"
                  >
                    검색 결과가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 통계 정보 */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-sm text-foreground-muted mb-1">활성 회원</div>
          <div className="text-2xl font-semibold text-foreground">
            {members.filter((m) => m.status === 'active').length}명
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-sm text-foreground-muted mb-1">비활성 회원</div>
          <div className="text-2xl font-semibold text-foreground">
            {members.filter((m) => m.status === 'inactive').length}명
          </div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4">
          <div className="text-sm text-foreground-muted mb-1">정지 회원</div>
          <div className="text-2xl font-semibold text-foreground">
            {members.filter((m) => m.status === 'suspended').length}명
          </div>
        </div>
      </div>
    </div>
  );
}
