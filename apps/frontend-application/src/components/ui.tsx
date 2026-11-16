import Link from 'next/link';
import type { ReactNode } from 'react';
import { AlertCircleIcon } from './icons';

/* Shared class strings, kept in step with the HR dashboard so both apps look alike. */

const focusRing =
  'focus:border-blue-600 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-600';

const controlBase = `box-border rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500 ${focusRing}`;

export const inputClass = `${controlBase} h-11 w-full px-3`;
export const textareaClass = `${controlBase} w-full resize-y px-3 py-2.5 leading-normal`;

export const labelClass = 'text-sm font-medium text-gray-700';
export const fieldClass = 'flex flex-col gap-1.5';
export const fieldGridClass = 'grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4';

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-70';

export const btnPrimary = `${buttonBase} h-11 bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 hover:text-white`;
export const btnSecondary = `${buttonBase} h-11 border border-gray-300 bg-white px-4 font-medium text-gray-700 hover:bg-gray-50`;

export const cardClass = 'rounded-xl border border-gray-200 bg-white';
export const cardFooterClass =
  'flex flex-wrap justify-end gap-3 rounded-b-xl border-t border-gray-200 bg-gray-50 px-6 py-4';

export const linkClass = 'font-medium text-blue-700 hover:text-blue-800';

export function Required() {
  return <span className="text-red-700">*</span>;
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block whitespace-nowrap rounded-full bg-blue-50 px-2.5 py-[3px] text-xs font-semibold text-blue-700">
      {children}
    </span>
  );
}

export function ErrorAlert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5"
    >
      <AlertCircleIcon size={16} className="mt-0.5 flex-none text-red-700" />
      <p className="text-[13px] text-red-700">{children}</p>
    </div>
  );
}

/** Trail of links ending in the current page, e.g. Open positions / Backend Engineer / Apply. */
export function Breadcrumb({
  trail,
  current,
}: {
  trail: { href: string; label: string }[];
  current: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] text-gray-600">
      {trail.map(({ href, label }) => (
        <span key={href}>
          <Link href={href} className="text-blue-700 hover:text-blue-800">
            {label}
          </Link>{' '}
          /{' '}
        </span>
      ))}
      <span aria-current="page">{current}</span>
    </nav>
  );
}
