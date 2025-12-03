import { Metadata } from 'next';
import OnulNewsDetailV2 from '../../../_templates/onul/versions/v2/news-detail';

export const metadata: Metadata = {
  title: '소식 | 오늘청소',
  description: '오늘청소의 소식 상세 페이지입니다.',
};

export default function NewsDetailPage() {
  return <OnulNewsDetailV2 />;
}
