// NAS MinIO 설정
// docs/05_NAS_MINIO_SETUP.md 참조

export const MINIO_CONFIG = {
  // NAS MinIO 엔드포인트 (내부 네트워크)
  endpoint: 'http://192.168.219.105:9000',
  // MinIO 콘솔 (관리용)
  consoleEndpoint: 'http://192.168.219.105:9001',
  // 액세스 키 (MinIO Root User)
  accessKeyId: 'onuladmin',
  secretAccessKey: 'Honor_2024!',
  // 버킷 이름
  bucket: 'onul-photos',
  // 리전 (MinIO에서는 임의 값)
  region: 'ap-northeast-2',
};

/**
 * 이미지 URL 생성
 * @param projectId 프로젝트 ID
 * @param photoType 'before' | 'after'
 * @param filename 파일명
 */
export const getPhotoUrl = (
  projectId: string,
  photoType: 'before' | 'after',
  filename: string
): string => {
  return `${MINIO_CONFIG.endpoint}/${MINIO_CONFIG.bucket}/${projectId}/${photoType}/${filename}`;
};

/**
 * 사진 업로드 경로 생성
 * @param minorProjectId 소형 프로젝트 ID
 * @param photoType 'before' | 'after'
 * @param filename 파일명
 */
export const getUploadPath = (
  minorProjectId: string,
  photoType: 'before' | 'after',
  filename: string
): string => {
  return `${minorProjectId}/${photoType}/${filename}`;
};

/**
 * 파일명 생성 (타임스탬프 + 랜덤)
 * @param originalName 원본 파일명
 */
export const generateFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || 'jpg';
  return `${timestamp}_${random}.${extension}`;
};

/**
 * MinIO에 파일 업로드 (FormData 방식)
 * 주의: 이 방식은 MinIO 버킷이 public write 권한이 필요합니다.
 * 보안을 위해서는 백엔드를 통한 presigned URL 방식을 권장합니다.
 */
export const uploadToMinio = async (
  file: {
    uri: string;
    type: string;
    name: string;
  },
  path: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const url = `${MINIO_CONFIG.endpoint}/${MINIO_CONFIG.bucket}/${path}`;

    // FormData 생성
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);

    // 직접 PUT 요청 (AWS Signature V4 필요)
    // 참고: 실제 구현 시 aws4 라이브러리 또는 서버 사이드 presigned URL 사용 권장
    const response = await fetch(url, {
      method: 'PUT',
      body: formData,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (response.ok) {
      return { success: true, url };
    } else {
      return { success: false, error: `Upload failed: ${response.status}` };
    }
  } catch (error) {
    console.error('MinIO upload error:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * 간단한 Base64 업로드 (테스트용)
 * 실제 서비스에서는 presigned URL 방식 권장
 */
export const uploadBase64ToMinio = async (
  base64Data: string,
  path: string,
  contentType: string = 'image/jpeg'
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const url = `${MINIO_CONFIG.endpoint}/${MINIO_CONFIG.bucket}/${path}`;

    // Base64 디코딩
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: contentType });

    const response = await fetch(url, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': contentType,
      },
    });

    if (response.ok) {
      return { success: true, url };
    } else {
      return { success: false, error: `Upload failed: ${response.status}` };
    }
  } catch (error) {
    console.error('MinIO upload error:', error);
    return { success: false, error: String(error) };
  }
};
