import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeftIcon } from '@/components/icons';

/** Centered column used by the sign-in and password-reset screens. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="box-border flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12 text-gray-900">
      <div className="flex w-full max-w-[420px] flex-col gap-6">{children}</div>
    </div>
  );
}

export function AuthHeader({
  icon,
  iconTone = 'soft',
  title,
  description,
}: {
  icon: ReactNode;
  iconTone?: 'solid' | 'soft';
  title: string;
  description: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-[10px] ${
          iconTone === 'solid' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
        }`}
      >
        {icon}
      </div>
      <h1 className="text-2xl font-semibold tracking-[-0.01em]">{title}</h1>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

export const authCardClass =
  'flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-8 shadow-[0_1px_2px_rgba(16,24,40,0.05)]';

export function BackToSignIn() {
  return (
    <Link
      href="/login"
      className="flex min-h-11 items-center justify-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800"
    >
      <ArrowLeftIcon size={16} />
      Back to sign in
    </Link>
  );
}
