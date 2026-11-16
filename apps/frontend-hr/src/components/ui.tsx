import Link from 'next/link';
import type { ReactNode } from 'react';
import { AlertCircleIcon, CheckCircleIcon } from './icons';
import { initials } from '@/lib/format';

/* Shared class strings, so every screen uses the same controls. */

const focusRing =
  'focus:border-blue-600 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-600';

const controlBase = `box-border rounded-lg border border-gray-300 bg-white text-sm text-gray-900 placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500 ${focusRing}`;

export const inputClass = `${controlBase} h-11 w-full px-3`;
export const selectClass = `${controlBase} h-11 px-2.5`;
export const filterControlClass = `${controlBase} h-10 w-full px-2.5`;
export const textareaClass = `${controlBase} w-full resize-y px-3 py-2.5 leading-normal`;

export const labelClass = 'text-sm font-medium text-gray-700';
export const fieldClass = 'flex flex-col gap-1.5';
export const fieldGridClass = 'grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4';
export const hintClass = '-mt-2 text-xs text-gray-600';

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-70';

export const btnPrimary = `${buttonBase} h-11 bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 hover:text-white`;
export const btnSecondary = `${buttonBase} h-11 border border-gray-300 bg-white px-4 font-medium text-gray-700 hover:bg-gray-50`;
export const btnSmall = `${buttonBase} h-9 border border-gray-300 bg-white px-3 text-[13px] font-medium text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:opacity-100`;

export const cardClass = 'rounded-xl border border-gray-200 bg-white';
export const cardFooterClass =
  'flex flex-wrap justify-end gap-3 rounded-b-xl border-t border-gray-200 bg-gray-50 px-6 py-4';

export const linkClass = 'font-medium text-blue-700 hover:text-blue-800';

export const thClass =
  'px-4 py-3 text-xs font-semibold uppercase tracking-[0.04em] text-gray-600';
export const tdClass = 'px-4 py-3';

/* Small presentational pieces. */

export function Required() {
  return <span className="text-red-700">*</span>;
}

export function Avatar({
  name,
  size = 'md',
  tone = 'indigo',
}: {
  name: string;
  size?: 'md' | 'lg';
  tone?: 'indigo' | 'gray';
}) {
  const sizeClass = size === 'lg' ? 'h-14 w-14 text-lg' : 'h-9 w-9 text-[13px]';
  const toneClass = tone === 'gray' ? 'bg-gray-200 text-gray-700' : 'bg-indigo-100 text-indigo-800';
  return (
    <div
      aria-hidden="true"
      className={`flex flex-none items-center justify-center rounded-full font-semibold ${sizeClass} ${toneClass}`}
    >
      {initials(name)}
    </div>
  );
}

const BADGE_TONES = {
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-700',
  violet: 'bg-violet-50 text-violet-700',
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-[3px] text-xs font-semibold ${BADGE_TONES[tone]}`}
    >
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

export function SuccessAlert({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5"
    >
      <CheckCircleIcon size={16} className="mt-0.5 flex-none text-emerald-700" />
      <p className="text-[13px] text-emerald-700">{children}</p>
    </div>
  );
}

export function Breadcrumb({
  parentHref,
  parentLabel,
  current,
}: {
  parentHref: string;
  parentLabel: string;
  current: string;
}) {
  return (
    <p className="text-[13px] text-gray-600">
      <Link href={parentHref} className="text-blue-700 hover:text-blue-800">
        {parentLabel}
      </Link>{' '}
      / {current}
    </p>
  );
}

/** Title + description, with an optional action on the right. */
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">{title}</h1>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      {action}
    </div>
  );
}

/** Full-width table row for loading / error / empty states. */
export function TableMessage({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr className="border-t border-gray-200">
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-gray-600">
        {children}
      </td>
    </tr>
  );
}

export function ShowingCount({ from, to, total }: { from: number; to: number; total: number }) {
  return (
    <span className="text-sm text-gray-700">
      Showing{' '}
      <strong>
        {total === 0 ? 0 : from}–{to}
      </strong>{' '}
      of <strong>{total}</strong>
    </span>
  );
}

/** Table footer with a "Showing x–y of z" count and Previous / Next buttons. */
export function PrevNextFooter({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3">
      <ShowingCount
        from={(page - 1) * pageSize + 1}
        to={Math.min(page * pageSize, total)}
        total={total}
      />
      <nav aria-label="Pagination" className="flex gap-2">
        <button
          type="button"
          className={btnSmall}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className={btnSmall}
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </nav>
    </div>
  );
}
