import { Metadata } from 'next';
import OnulNewsListV2 from '../../_templates/onul/versions/v2/news';

export const metadata: Metadata = {
  title: '소식 | 오늘청소',
  description: '오늘청소의 새로운 소식과 공지사항을 확인하세요.',
};

export default function NewsPage() {
  return <OnulNewsListV2 />;
}
