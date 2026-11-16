'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import { useCurrentUser } from '@/components/CurrentUser';
import { Avatar } from '@/components/ui';
import { BriefcaseIcon, FileTextIcon, UserPlusIcon, UsersIcon } from '@/components/icons';
import { ROLE_LABELS } from '@/lib/types';

const NAV_ITEMS = [
  { href: '/applications', label: 'Applications', icon: FileTextIcon },
  { href: '/job-listings', label: 'Job listings', icon: BriefcaseIcon },
  { href: '/members', label: 'Members', icon: UserPlusIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();

  return (
    <aside className="box-border flex max-w-full flex-[1_1_240px] flex-col gap-6 border-r border-gray-200 bg-white px-4 py-5">
      <div className="flex items-center gap-2.5 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
          <UsersIcon />
        </div>
        <span className="text-base font-semibold">HR Portal</span>
      </div>

      <nav aria-label="Main" className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: NavIcon }) => {
          const isCurrent = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isCurrent ? 'page' : undefined}
              className={`flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm ${
                isCurrent
                  ? 'bg-blue-50 font-semibold text-blue-700'
                  : 'font-medium text-gray-700 hover:bg-gray-50'
              }`}
            >
              <NavIcon />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 border-t border-gray-200 px-2 pt-4">
        <Avatar name={user?.name || user?.email || ''} tone="gray" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[13px] font-medium">
            {user?.name || user?.email || 'Signed in'}
          </span>
          {user && <span className="text-xs text-gray-600">{ROLE_LABELS[user.role]}</span>}
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
