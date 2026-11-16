"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFetch } from "@/lib/useFetch";
import { endOfLocalDay, formatDate, startOfLocalDay } from "@/lib/format";
import {
  DEPARTMENT_LABELS,
  STATUS_LABELS,
  departmentLabel,
  isListingActive,
  type Application,
  type ApplicationStatus,
  type JobListing,
  type Paginated,
} from "@/lib/types";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  XIcon,
} from "@/components/icons";
import {
  Avatar,
  PageHeader,
  ShowingCount,
  TableMessage,
  btnSecondary,
  cardClass,
  filterControlClass,
  inputClass,
  tdClass,
  thClass,
} from "@/components/ui";
import StatusBadge from "@/components/StatusBadge";

const PAGE_SIZES = [10, 25, 50, 100];

const EMPTY_FILTERS = {
  search: "",
  status: "",
  jobId: "",
  department: "",
  jobState: "",
  from: "",
  to: "",
};

type Filters = typeof EMPTY_FILTERS;

const SEARCH_DEBOUNCE_MS = 300;

/** Query string for GET /application-forms; empty filters are left out. */
function buildQuery(
  filters: Filters,
  search: string,
  page: number,
  limit: number,
): string {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search.trim()) params.set("search", search.trim());
  for (const key of ["status", "jobId", "department", "jobState"] as const) {
    if (filters[key]) params.set(key, filters[key]);
  }
  // Send exact local-day bounds so the backend filters by the user's time zone.
  if (filters.from) params.set("from", startOfLocalDay(filters.from));
  if (filters.to) params.set("to", endOfLocalDay(filters.to));
  return params.toString();
}

const JOB_STATE_LABELS: Record<string, string> = {
  active: "Active only",
  closed: "Closed only",
};

/** Page numbers to show, with `null` standing for an ellipsis. */
function pageItems(page: number, pageCount: number): (number | null)[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  if (page <= 3) [2, 3].forEach((p) => pages.add(p));
  if (page >= pageCount - 2)
    [pageCount - 1, pageCount - 2].forEach((p) => pages.add(p));

  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);
  const items: (number | null)[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push(null);
    items.push(p);
  });
  return items;
}

const filterLabelClass = "text-[13px] font-medium text-gray-700";
const pageButtonBase =
  "flex h-9 min-w-9 items-center justify-center rounded-lg border text-[13px]";
const pageButtonIdle = `${pageButtonBase} cursor-pointer border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white`;
const pageButtonCurrent = `${pageButtonBase} border-blue-600 bg-blue-600 font-semibold text-white`;

function ApplicationsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobs = useFetch<JobListing[]>("/job-listings");

  // "View applications" on the job listings page links here with ?jobId=...
  const [filters, setFilters] = useState<Filters>({
    ...EMPTY_FILTERS,
    jobId: searchParams.get("jobId") ?? "",
  });
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);

  // Wait for typing to pause before searching, rather than one request per key.
  const [search, setSearch] = useState(filters.search);
  useEffect(() => {
    const timer = setTimeout(() => setSearch(filters.search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const applications = useFetch<Paginated<Application>>(
    `/application-forms?${buildQuery(filters, search, page, pageSize)}`,
  );

  const setFilter = (key: keyof Filters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const jobTitles = useMemo(
    () => new Map((jobs.data ?? []).map((job) => [job.id, job.title])),
    [jobs.data],
  );

  const chips = [
    filters.status && {
      key: "status" as const,
      label: `Status: ${STATUS_LABELS[filters.status as ApplicationStatus]}`,
    },
    filters.jobId && {
      key: "jobId" as const,
      label: `Job listing: ${jobTitles.get(filters.jobId) ?? "Selected listing"}`,
    },
    filters.department && {
      key: "department" as const,
      label: `Department: ${departmentLabel(filters.department)}`,
    },
    filters.jobState && {
      key: "jobState" as const,
      label: `Job listing state: ${JOB_STATE_LABELS[filters.jobState]}`,
    },
    filters.from && {
      key: "from" as const,
      label: `Submitted from: ${formatDate(filters.from, true)}`,
    },
    filters.to && {
      key: "to" as const,
      label: `Submitted to: ${formatDate(filters.to, true)}`,
    },
  ].filter((chip) => !!chip);

  const pageRows = applications.data?.data ?? [];
  const total = applications.data?.meta.total ?? 0;
  const pageCount = Math.max(1, applications.data?.meta.totalPages ?? 1);
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
      <PageHeader
        title="Job applications"
        description="Review and track every application across job listings."
      />

      <section
        aria-label="Filters"
        className={`${cardClass} flex flex-col gap-4 p-5`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex flex-[1_1_320px] items-center">
            <SearchIcon className="absolute left-3 text-gray-500" />
            <label htmlFor="search" className="sr-only">
              Search applications
            </label>
            <input
              id="search"
              type="search"
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              placeholder="Search by name or email"
              className={`${inputClass} pl-10`}
            />
          </div>
          <button type="button" onClick={clearFilters} className={btnSecondary}>
            Clear filters
          </button>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-status" className={filterLabelClass}>
              Status
            </label>
            <select
              id="f-status"
              value={filters.status}
              onChange={(e) => setFilter("status", e.target.value)}
              className={filterControlClass}
            >
              <option value="">All statuses</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-job" className={filterLabelClass}>
              Job listing
            </label>
            <select
              id="f-job"
              value={filters.jobId}
              onChange={(e) => setFilter("jobId", e.target.value)}
              className={filterControlClass}
            >
              <option value="">All jobs</option>
              {(jobs.data ?? []).map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-dept" className={filterLabelClass}>
              Department
            </label>
            <select
              id="f-dept"
              value={filters.department}
              onChange={(e) => setFilter("department", e.target.value)}
              className={filterControlClass}
            >
              <option value="">All departments</option>
              {Object.entries(DEPARTMENT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-active" className={filterLabelClass}>
              Job listing state
            </label>
            <select
              id="f-active"
              value={filters.jobState}
              onChange={(e) => setFilter("jobState", e.target.value)}
              className={filterControlClass}
            >
              <option value="">Active &amp; closed</option>
              <option value="active">Active only</option>
              <option value="closed">Closed only</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-from" className={filterLabelClass}>
              Submitted from
            </label>
            <input
              id="f-from"
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(e) => setFilter("from", e.target.value)}
              className={filterControlClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-to" className={filterLabelClass}>
              Submitted to
            </label>
            <input
              id="f-to"
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(e) => setFilter("to", e.target.value)}
              className={filterControlClass}
            />
          </div>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] text-gray-600">Active filters:</span>
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => setFilter(chip.key, "")}
                aria-label={`Remove filter ${chip.label}`}
                className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 text-[13px] text-blue-700 hover:bg-blue-100"
              >
                {chip.label}
                <XIcon size={14} />
              </button>
            ))}
          </div>
        )}
      </section>

      <section
        aria-label="Applications"
        className={`${cardClass} overflow-hidden`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th scope="col" className={thClass}>
                  Applicant
                </th>
                <th scope="col" className={thClass}>
                  Job listing
                </th>
                <th scope="col" className={thClass}>
                  Department
                </th>
                <th scope="col" className={thClass}>
                  Status
                </th>
                <th scope="col" className={thClass}>
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.loading && (
                <TableMessage colSpan={5}>Loading applications...</TableMessage>
              )}
              {applications.error && (
                <TableMessage colSpan={5}>{applications.error}</TableMessage>
              )}
              {applications.data && total === 0 && (
                <TableMessage colSpan={5}>
                  {hasFilters
                    ? "No applications match these filters."
                    : "No applications yet."}
                </TableMessage>
              )}
              {pageRows.map((app) => {
                const name = `${app.firstName} ${app.lastName}`;
                return (
                  <tr
                    key={app.id}
                    onClick={(e) => {
                      // The name link handles its own clicks (incl. Cmd/Ctrl-click).
                      if ((e.target as HTMLElement).closest("a")) return;
                      const href = `/applications/${app.id}`;
                      if (e.metaKey || e.ctrlKey) window.open(href, "_blank");
                      else router.push(href);
                    }}
                    className="cursor-pointer border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className={tdClass}>
                      <div className="flex items-center gap-3">
                        <Avatar name={name} />
                        <div className="flex flex-col">
                          <Link
                            href={`/applications/${app.id}`}
                            className="font-medium text-gray-900 hover:text-blue-700 hover:underline"
                          >
                            {name}
                          </Link>
                          <span className="text-[13px] text-gray-600">
                            {app.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <div className="flex flex-col items-start gap-1">
                        <span>{app.job?.title ?? "—"}</span>
                        {app.job &&
                          (isListingActive(app.job) ? (
                            <span className="text-xs text-emerald-700">
                              ● Active
                            </span>
                          ) : (
                            <span className="text-xs text-gray-600">
                              ○ Closed
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className={`${tdClass} text-gray-700`}>
                      {departmentLabel(app.job?.department)}
                    </td>
                    <td className={tdClass}>
                      <StatusBadge status={app.status} />
                    </td>
                    <td
                      className={`${tdClass} whitespace-nowrap text-gray-700`}
                    >
                      {formatDate(app.submissonDate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <ShowingCount
              from={(page - 1) * pageSize + 1}
              to={Math.min(page * pageSize, total)}
              total={total}
            />
            <div className="flex items-center gap-2">
              <label htmlFor="per-page" className="text-[13px] text-gray-600">
                Rows per page
              </label>
              <select
                id="per-page"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-9 rounded-lg border border-gray-300 bg-white px-2 text-[13px] focus:border-blue-600 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-600"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <nav aria-label="Pagination" className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className={pageButtonIdle}
            >
              <ChevronLeftIcon size={16} />
            </button>
            {pageItems(page, pageCount).map((item, index) =>
              item === null ? (
                <span key={`gap-${index}`} className="px-1.5 text-gray-600">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  aria-current={item === page ? "page" : undefined}
                  onClick={() => setPage(item)}
                  className={item === page ? pageButtonCurrent : pageButtonIdle}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              aria-label="Next page"
              disabled={page >= pageCount}
              onClick={() => setPage(page + 1)}
              className={pageButtonIdle}
            >
              <ChevronRightIcon size={16} />
            </button>
          </nav>
        </div>
      </section>
    </div>
  );
}

export default function ApplicationsPage() {
  // useSearchParams needs a Suspense boundary so the rest of the shell can prerender.
  return (
    <Suspense fallback={null}>
      <ApplicationsView />
    </Suspense>
  );
}
