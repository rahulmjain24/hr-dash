'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useFetch } from '@/lib/useFetch';
import { formatDate } from '@/lib/format';
import {
  DEPARTMENT_LABELS,
  departmentLabel,
  isListingActive,
  type JobListing,
} from '@/lib/types';
import { useCurrentUser } from '@/components/CurrentUser';
import { PlusIcon, SearchIcon } from '@/components/icons';
import {
  Badge,
  PageHeader,
  PrevNextFooter,
  TableMessage,
  btnPrimary,
  btnSmall,
  cardClass,
  inputClass,
  linkClass,
  selectClass,
  tdClass,
  thClass,
} from '@/components/ui';

const PAGE_SIZE = 10;

export default function JobListingsPage() {
  const { isAdmin } = useCurrentUser();
  const listings = useFetch<JobListing[]>('/job-listings');

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [state, setState] = useState('');
  const [pageState, setPage] = useState(1);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return (listings.data ?? [])
      .filter((job) => {
        const active = isListingActive(job);
        if (query && !job.title.toLowerCase().includes(query)) return false;
        if (department && job.department !== department) return false;
        if (state === 'active' && !active) return false;
        if (state === 'inactive' && active) return false;
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [listings.data, search, department, state]);

  const total = rows.length;
  const page = Math.min(pageState, Math.max(1, Math.ceil(total / PAGE_SIZE)));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const columnCount = isAdmin ? 7 : 6;

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
      <PageHeader
        title="Job listings"
        description="Create and manage the roles candidates can apply to."
        action={
          isAdmin && (
            <Link href="/job-listings/new" className={`${btnPrimary} px-4`}>
              <PlusIcon size={16} />
              New job listing
            </Link>
          )
        }
      />

      <section aria-label="Job listings" className={`${cardClass} overflow-hidden`}>
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 p-4">
          <div className="relative flex flex-[1_1_280px] items-center">
            <SearchIcon className="absolute left-3 text-gray-500" />
            <label htmlFor="j-search" className="sr-only">
              Search job listings
            </label>
            <input
              id="j-search"
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title"
              className={`${inputClass} pl-10`}
            />
          </div>
          <label htmlFor="j-dept" className="sr-only">
            Department
          </label>
          <select
            id="j-dept"
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">All departments</option>
            {Object.entries(DEPARTMENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <label htmlFor="j-active" className="sr-only">
            Listing state
          </label>
          <select
            id="j-active"
            value={state}
            onChange={(e) => {
              setState(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">Active &amp; inactive</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th scope="col" className={thClass}>
                  Title
                </th>
                <th scope="col" className={thClass}>
                  Department
                </th>
                <th scope="col" className={thClass}>
                  Start date
                </th>
                <th scope="col" className={thClass}>
                  End date
                </th>
                <th scope="col" className={thClass}>
                  Status
                </th>
                <th scope="col" className={thClass}>
                  Applications
                </th>
                {isAdmin && (
                  <th scope="col" className={thClass}>
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {listings.loading && (
                <TableMessage colSpan={columnCount}>Loading job listings...</TableMessage>
              )}
              {listings.error && <TableMessage colSpan={columnCount}>{listings.error}</TableMessage>}
              {listings.data && total === 0 && (
                <TableMessage colSpan={columnCount}>
                  {listings.data.length === 0
                    ? 'No job listings yet.'
                    : 'No job listings match these filters.'}
                </TableMessage>
              )}
              {pageRows.map((job) => (
                <tr key={job.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className={`${tdClass} font-medium`}>{job.title}</td>
                  <td className={`${tdClass} text-gray-700`}>{departmentLabel(job.department)}</td>
                  <td className={`${tdClass} whitespace-nowrap text-gray-700`}>
                    {formatDate(job.startDate, true)}
                  </td>
                  <td className={`${tdClass} whitespace-nowrap text-gray-700`}>
                    {formatDate(job.endDate, true)}
                  </td>
                  <td className={tdClass}>
                    {isListingActive(job) ? (
                      <Badge tone="green">Active</Badge>
                    ) : (
                      <Badge tone="gray">Inactive</Badge>
                    )}
                  </td>
                  <td className={tdClass}>
                    <Link href={`/applications?jobId=${job.id}`} className={linkClass}>
                      View applications
                    </Link>
                  </td>
                  {isAdmin && (
                    <td className={`${tdClass} text-right`}>
                      <Link href={`/job-listings/${job.id}/edit`} className={btnSmall}>
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
