'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useFetch } from '@/lib/useFetch';
import { formatDate } from '@/lib/format';
import { ROLE_LABELS, type User } from '@/lib/types';
import { useCurrentUser } from '@/components/CurrentUser';
import { PlusIcon, SearchIcon } from '@/components/icons';
import {
  Avatar,
  Badge,
  PageHeader,
  PrevNextFooter,
  TableMessage,
  btnPrimary,
  btnSmall,
  cardClass,
  inputClass,
  selectClass,
  tdClass,
  thClass,
} from '@/components/ui';

const PAGE_SIZE = 10;

export default function MembersPage() {
  const { isAdmin } = useCurrentUser();
  const members = useFetch<User[]>('/user');

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [pageState, setPage] = useState(1);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (members.data ?? [])
      .filter((member) => {
        if (query && !`${member.name} ${member.email}`.toLowerCase().includes(query)) return false;
        if (role && member.role !== role) return false;
        return true;
      })
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [members.data, search, role]);

  const total = rows.length;
  const page = Math.min(pageState, Math.max(1, Math.ceil(total / PAGE_SIZE)));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const columnCount = isAdmin ? 5 : 4;

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
      <PageHeader
        title="Members"
        description="People who can sign in to the HR Portal."
        action={
          isAdmin && (
            <Link href="/members/new" className={`${btnPrimary} px-4`}>
              <PlusIcon size={16} />
              Add member
            </Link>
          )
        }
      />

      <section aria-label="Members list" className={`${cardClass} overflow-hidden`}>
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 p-4">
          <div className="relative flex flex-[1_1_280px] items-center">
            <SearchIcon className="absolute left-3 text-gray-500" />
            <label htmlFor="m-search" className="sr-only">
              Search members
            </label>
            <input
              id="m-search"
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email"
              className={`${inputClass} pl-10`}
            />
          </div>
          <label htmlFor="m-role" className="sr-only">
            Role
          </label>
          <select
            id="m-role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="MEMBER">Member</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th scope="col" className={thClass}>
                  Name
                </th>
                <th scope="col" className={thClass}>
                  Email
                </th>
                <th scope="col" className={thClass}>
                  Role
                </th>
                <th scope="col" className={thClass}>
                  Created
                </th>
                {isAdmin && (
                  <th scope="col" className={thClass}>
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {members.loading && <TableMessage colSpan={columnCount}>Loading members...</TableMessage>}
              {members.error && <TableMessage colSpan={columnCount}>{members.error}</TableMessage>}
              {members.data && total === 0 && (
                <TableMessage colSpan={columnCount}>No members match these filters.</TableMessage>
              )}
              {pageRows.map((member) => (
                <tr key={member.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className={tdClass}>
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} />
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </td>
                  <td className={`${tdClass} text-gray-700`}>{member.email}</td>
                  <td className={tdClass}>
                    <Badge tone={member.role === 'ADMIN' ? 'violet' : 'gray'}>
                      {ROLE_LABELS[member.role]}
                    </Badge>
                  </td>
                  <td className={`${tdClass} whitespace-nowrap text-gray-700`}>
                    {formatDate(member.createdAt)}
                  </td>
                  {isAdmin && (
                    <td className={`${tdClass} text-right`}>
                      <Link href={`/members/${member.id}/edit`} className={btnSmall}>
                        Edit
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PrevNextFooter page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      </section>
    </div>
  );
}
