# NAS MinIO 설정 가이드

## DS920plus에 MinIO 설치 및 설정

### 완료 상태: ✅ 설정 완료 (2025-12-07)

---

## 현재 설정 정보

| 항목 | 값 |
|------|-----|
| 컨테이너 이름 | onul-minio |
| MinIO API | http://192.168.219.105:9000 |
| MinIO Console | http://192.168.219.105:9001 |
| 사용자 이름 | onuladmin |
| 비밀번호 | Honor_2024! |
| 버킷 이름 | onul-photos |
| 데이터 경로 (호스트) | /docker/minio/data |
| 데이터 경로 (컨테이너) | /data |

---

## 설치 과정 (완료됨)

### 1. DSM Container Manager 접속
1. 브라우저에서 https://192.168.219.105:5001 접속 (HTTPS)
2. DSM에 로그인
3. **Container Manager** 앱 실행

### 2. MinIO 이미지 다운로드
1. **레지스트리** 탭 클릭
2. 검색창에 `minio/minio` 입력
3. 공식 이미지 선택 후 **다운로드** 클릭
4. 태그는 `latest` 선택

### 3. MinIO 컨테이너 생성
1. **이미지** 탭에서 minio/minio 선택
2. **실행** 클릭
3. 컨테이너 이름: `onul-minio`

### 4. 고급 설정

#### 포트 설정
| 로컬 포트 | 컨테이너 포트 | 프로토콜 | 설명 |
|----------|-------------|----------|------|
| 9000 | 9000 | TCP | API 포트 |
| 9001 | 9001 | TCP | 콘솔 포트 |

#### 볼륨 설정
| 파일/폴더 | 마운트 경로 | 설명 |
|-----------|------------|------|
| /docker/minio/data | /data | 데이터 저장 경로 |

#### 환경 변수
| 변수 | 값 |
|------|-----|
| MINIO_ROOT_USER | onuladmin |
| MINIO_ROOT_PASSWORD | Honor_2024! |

#### 실행 명령어
```
server /data --console-address ":9001"
```

### 5. MinIO 콘솔 접속
- URL: http://192.168.219.105:9001
- ID: onuladmin
- PW: Honor_2024!

### 6. 버킷 생성
1. MinIO 콘솔 로그인
2. **Buckets** 메뉴 클릭
3. **Create Bucket** 클릭
4. 버킷 이름: `onul-photos`
5. 생성 완료 ✅

---

## 앱에서 사용할 설정 값

```typescript
// src/lib/minio.ts
export const MINIO_CONFIG = {
  endpoint: 'http://192.168.219.105:9000',
  consoleEndpoint: 'http://192.168.219.105:9001',
  accessKeyId: 'onuladmin',
  secretAccessKey: 'Honor_2024!',
  bucket: 'onul-photos',
  region: 'ap-northeast-2',
};
```

---

## 이미지 URL 구조

```
http://192.168.219.105:9000/onul-photos/{project_id}/{photo_type}/{filename}
```

예시:
- 비포 사진: `http://192.168.219.105:9000/onul-photos/proj_001/before/img_001.jpg`
- 애프터 사진: `http://192.168.219.105:9000/onul-photos/proj_001/after/img_002.jpg`

---

## 완료 체크리스트

- [x] Container Manager에서 MinIO 이미지 다운로드
- [x] /docker/minio/data 폴더 생성
- [x] MinIO 컨테이너 생성 및 실행
- [x] MinIO 콘솔 접속 확인 (http://192.168.219.105:9001)
- [x] `onul-photos` 버킷 생성
- [x] src/lib/minio.ts 설정 업데이트

---

## 외부 접근 설정 (필요시)

외부에서 NAS MinIO에 접근하려면:

1. **DSM 제어판** → **외부 액세스** → **라우터 구성**
2. 포트 포워딩: 외부 9000 → 내부 9000

또는 Synology QuickConnect/DDNS 활용

---

## 주의사항

1. **내부 네트워크 전용**: 현재 설정은 192.168.219.x 대역에서만 접근 가능
2. **비밀번호 관리**: Honor_2024!는 NAS 공통 비밀번호와 동일
3. **백업**: /docker/minio/data 폴더는 정기 백업 권장
