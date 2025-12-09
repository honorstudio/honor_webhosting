# 프로젝트 페이지 이슈 및 해결 방안

## 해결된 문제점

### 1. 프로젝트 수정 후 데이터 새로고침 안 됨 ✅ 해결

**증상**: 프로젝트 수정 후 저장하면 상세 페이지로 돌아가지만, 수정 전 데이터가 표시됨

**원인**:
- `router.back()` 사용 시 Expo Router가 이전 페이지 상태를 캐시함
- 상세 페이지의 `useEffect`가 `[id]` 의존성만 가지고 있어 re-fetch 안 됨

**해결**:
- `useFocusEffect` 훅을 사용하여 화면 포커스 시 데이터 새로고침
- 적용 파일: `app/project/[id].tsx`, `app/(tabs)/projects.tsx`

### 2. 웹에서 Alert.alert 작동 안 함 ✅ 해결

**증상**: 에러/성공 메시지가 웹에서 표시되지 않음

**원인**: React Native의 `Alert.alert`는 모바일 전용

**해결**:
- Toast 컴포넌트 생성: `src/components/Toast.tsx`
- ToastProvider 추가: `app/_layout.tsx`
- 삭제 확인 Modal 구현: `app/project/[id].tsx`

## 남은 문제점

### 3. 프로젝트 삭제 RLS 정책 없음 ⚠️ 수동 설정 필요

**증상**: 프로젝트 삭제 시 "삭제 권한이 없거나 프로젝트를 찾을 수 없습니다." 에러

**원인**: Supabase `onul_major_projects` 테이블에 DELETE RLS 정책 없음

**해결 (Supabase 대시보드에서 수동 실행)**:
```sql
-- 관리자(super_admin, project_manager)가 프로젝트를 삭제할 수 있는 정책 추가
CREATE POLICY "Admins can delete major projects" ON onul_major_projects
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM onul_profiles
    WHERE onul_profiles.id = auth.uid()
    AND onul_profiles.role IN ('super_admin', 'project_manager')
  )
);
```

## 최종 테스트 결과

| 기능 | 데이터 저장 | 사용자 피드백 | 상태 |
|------|-------------|---------------|------|
| 프로젝트 생성 | ✅ 정상 | ✅ 페이지 이동 | 정상 |
| 프로젝트 수정 | ✅ 정상 | ✅ Toast + 새로고침 | 정상 |
| 프로젝트 삭제 | ❌ RLS 없음 | ✅ 에러 Toast | RLS 정책 추가 필요 |

## 관련 파일

- `app/project/[id].tsx` - 프로젝트 상세 페이지 (useFocusEffect, 삭제 Modal)
- `app/project/edit/[id].tsx` - 프로젝트 수정 페이지 (Toast 적용)
- `app/project/create.tsx` - 프로젝트 생성 페이지
- `app/(tabs)/projects.tsx` - 프로젝트 목록 페이지 (useFocusEffect)
- `src/components/Toast.tsx` - Toast 컴포넌트 및 Provider
