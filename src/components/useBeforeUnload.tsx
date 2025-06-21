'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { deleteAllStages } from '@/lib/stageStore';

export default function useBeforeUnload(shouldWarn: boolean) {
  const router = useRouter();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!shouldWarn) return;
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldWarn]);

  useEffect(() => {
    if (!shouldWarn) return;

    const originalPush = router.push;
    const originalBack = router.back;

    router.push = (url: string) => {
      const confirmLeave = window.confirm('You have unsaved changes. Leave this page?');
      if (confirmLeave) {
        originalPush(url);
        deleteAllStages();
      }

    };

    router.back = () => {
      const confirmLeave = window.confirm('You have unsaved changes. Go back?');
      if (confirmLeave) {
        originalBack();
        deleteAllStages();
      }
    };

    return () => {
      router.push = originalPush;
      router.back = originalBack;
    };
  }, [shouldWarn, router]);
}
