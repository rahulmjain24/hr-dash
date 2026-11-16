import Link from 'next/link';
import { btnPrimary, cardClass } from '@/components/ui';

export default function NotFound() {
  return (
    <div className={`${cardClass} flex flex-col items-center gap-4 px-6 py-14 text-center`}>
      <h1 className="text-2xl font-semibold tracking-[-0.01em]">This position isn&apos;t available</h1>
      <p className="max-w-[420px] text-sm text-gray-600">
        It may have been filled or closed, or the link might be wrong. Have a look at the roles
        we&apos;re hiring for right now.
      </p>
      <Link href="/" className={btnPrimary}>
        View open positions
      </Link>
    </div>
  );
}
