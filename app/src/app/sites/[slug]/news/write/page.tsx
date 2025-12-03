import { Metadata } from 'next';
import OnulNewsWriteV2 from '../../../_templates/onul/versions/v2/news-write';

export const metadata: Metadata = {
  title: '새 소식 작성 | 오늘청소',
  description: '오늘청소의 새로운 소식을 작성합니다.',
};

export default function NewsWritePage() {
  return <OnulNewsWriteV2 />;
}
