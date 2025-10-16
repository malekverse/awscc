'use client';

import { useParams } from 'next/navigation';
import VideoCourseDetail from '@/components/VideoCourseDetail';

export default function VideoCoursePage() {
  const params = useParams();
  const courseId = params.id as string;

  return <VideoCourseDetail courseId={courseId} />;
}