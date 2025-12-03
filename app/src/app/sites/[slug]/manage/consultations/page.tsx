'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Phone, Mail, Calendar, MessageSquare, Check, X, Clock, Trash2 } from 'lucide-react';

/**
 * 상담 문의 타입
 */
interface Consultation {
  id: string;
  name: string;
  phone: string;
  message: string | null;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
}

/**
 * 상태별 스타일 정의
 */
const STATUS_STYLES = {
  pending: {
    label: '대기중',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-200',
    icon: Clock,
  },
  contacted: {
    label: '연락완료',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    icon: Phone,
  },
  completed: {
    label: '완료',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    icon: Check,
  },
  cancelled: {
    label: '취소',
    bgColor: 'bg-neutral-50',
    textColor: 'text-neutral-500',
    borderColor: 'border-neutral-200',
    icon: X,
  },
};

/**
 * 관리자 상담 관리 페이지
 */
export default function ConsultationsPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 사이트 ID 가져오기 및 상담 목록 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const supabase = createClient();

      // 사이트 ID 가져오기
      const { data: site } = await supabase
        .from('sites')
        .select('id')
        .eq('slug', slug)
        .single();

      if (site) {
        setSiteId(site.id);

        // 상담 목록 로드
        const { data: consultationData, error } = await supabase
          .from('consultations')
          .select('*')
          .eq('site_id', site.id)
          .order('created_at', { ascending: false });

        if (!error && consultationData) {
          setConsultations(consultationData);
        }
      }

      setIsLoading(false);
    };

    loadData();
  }, [slug]);

  // 상태 업데이트
  const updateStatus = async (id: string, newStatus: Consultation['status']) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('consultations')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setConsultations(prev =>
        prev.map(c => (c.id === id ? { ...c, status: newStatus } : c))
      );
      if (selectedConsultation?.id === id) {
        setSelectedConsultation(prev => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  // 메모 저장
  const saveNotes = async () => {
    if (!selectedConsultation) return;

    setIsSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('consultations')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', selectedConsultation.id);

    if (!error) {
      setConsultations(prev =>
        prev.map(c => (c.id === selectedConsultation.id ? { ...c, notes } : c))
      );
      setSelectedConsultation(prev => prev ? { ...prev, notes } : null);
      alert('메모가 저장되었습니다.');
    }

    setIsSaving(false);
  };

  // 상담 삭제
  const deleteConsultation = async (id: string) => {
    if (!confirm('정말로 이 상담을 삭제하시겠습니까?')) return;

    const supabase = createClient();

    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', id);

    if (!error) {
      setConsultations(prev => prev.filter(c => c.id !== id));
      if (selectedConsultation?.id === id) {
        setSelectedConsultation(null);
      }
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 필터링된 상담 목록
  const filteredConsultations = consultations.filter(c =>
    filterStatus === 'all' ? true : c.status === filterStatus
  );

  // 상담 선택
  const handleSelect = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setNotes(consultation.notes || '');
  };

  // 로딩 스켈레톤
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-32 bg-neutral-200 rounded animate-pulse" />
        <div className="h-4 w-48 bg-neutral-100 rounded animate-pulse" />
        <div className="space-y-4 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-neutral-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
          상담 관리
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          상담 문의 내역을 관리합니다
        </p>
      </div>

      {/* 상태 필터 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filterStatus === 'all'
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          전체 ({consultations.length})
        </button>
        {Object.entries(STATUS_STYLES).map(([key, style]) => {
          const count = consultations.filter(c => c.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filterStatus === key
                  ? `${style.bgColor} ${style.textColor} border ${style.borderColor}`
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {style.label} ({count})
            </button>
          );
        })}
      </div>

      {/* 상담 목록 & 상세 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 상담 목록 */}
        <div className="space-y-3">
          {filteredConsultations.length === 0 ? (
            <div className="text-center py-16 bg-neutral-50 rounded-lg border border-neutral-200">
              <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">상담 문의가 없습니다.</p>
            </div>
          ) : (
            filteredConsultations.map((consultation) => {
              const statusStyle = STATUS_STYLES[consultation.status];
              const StatusIcon = statusStyle.icon;

              return (
                <div
                  key={consultation.id}
                  onClick={() => handleSelect(consultation)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedConsultation?.id === consultation.id
                      ? 'border-neutral-900 bg-neutral-50'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="font-medium text-neutral-900">{consultation.name}</span>
                      <span className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${statusStyle.bgColor} ${statusStyle.textColor}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusStyle.label}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConsultation(consultation.id);
                      }}
                      className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-neutral-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {consultation.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(consultation.created_at)}
                    </span>
                  </div>

                  {consultation.message && (
                    <p className="text-sm text-neutral-600 line-clamp-2">
                      {consultation.message}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 상담 상세 */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          {selectedConsultation ? (
            <div className="space-y-6">
              {/* 고객 정보 */}
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-4">
                  고객 정보
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-500 w-16">이름</span>
                    <span className="text-sm text-neutral-900">{selectedConsultation.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-500 w-16">연락처</span>
                    <a
                      href={`tel:${selectedConsultation.phone}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {selectedConsultation.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-500 w-16">접수일</span>
                    <span className="text-sm text-neutral-900">
                      {formatDate(selectedConsultation.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 문의 내용 */}
              {selectedConsultation.message && (
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">
                    문의 내용
                  </h3>
                  <p className="text-sm text-neutral-600 whitespace-pre-wrap p-4 bg-neutral-50 rounded-lg">
                    {selectedConsultation.message}
                  </p>
                </div>
              )}

              {/* 상태 변경 */}
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-3">
                  상태 변경
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_STYLES).map(([key, style]) => {
                    const StatusIcon = style.icon;
                    const isActive = selectedConsultation.status === key;

                    return (
                      <button
                        key={key}
                        onClick={() => updateStatus(selectedConsultation.id, key as Consultation['status'])}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? `${style.bgColor} ${style.textColor} border ${style.borderColor}`
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {style.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 메모 */}
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  관리자 메모
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="상담 관련 메모를 작성하세요..."
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
                />
                <button
                  onClick={saveNotes}
                  disabled={isSaving}
                  className={`mt-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isSaving
                      ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                      : 'bg-neutral-900 text-white hover:bg-neutral-800'
                  }`}
                >
                  {isSaving ? '저장 중...' : '메모 저장'}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center py-16">
              <div>
                <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">상담을 선택해주세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
