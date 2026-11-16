'use client';

import { btnPrimary, cardClass } from '@/components/ui';

export default function Error({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className={`${cardClass} flex flex-col items-center gap-4 px-6 py-14 text-center`}>
      <h1 className="text-2xl font-semibold tracking-[-0.01em]">Something went wrong</h1>
      <p className="max-w-[420px] text-sm text-gray-600">
        We couldn&apos;t load this page. Please try again in a moment.
      </p>
      <button type="button" onClick={() => retry()} className={btnPrimary}>
        Try again
      </button>
    </div>
  );
}
