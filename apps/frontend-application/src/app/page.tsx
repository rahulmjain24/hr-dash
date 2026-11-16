import Link from 'next/link';
import { getOpenJobs } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { DEPARTMENT_LABELS, departmentLabel, type JobListing } from '@/lib/types';
import { ChevronRightIcon } from '@/components/icons';
import { cardClass } from '@/components/ui';

const OTHER = 'OTHER';

function groupByDepartment(jobs: JobListing[]) {
  const groups = new Map<string, JobListing[]>();
  for (const job of jobs) {
    const key = job.department ?? OTHER;
    groups.set(key, [...(groups.get(key) ?? []), job]);
  }

  const order = [...Object.keys(DEPARTMENT_LABELS), OTHER];
  const rank = (key: string) => (order.includes(key) ? order.indexOf(key) : order.length - 0.5);

  return [...groups.entries()]
    .sort(([a], [b]) => rank(a) - rank(b))
    .map(([key, items]) => ({
      key,
      label: key === OTHER ? 'Other' : departmentLabel(key),
      jobs: items,
    }));
}

function JobRow({ job }: { job: JobListing }) {
  const closes = formatDate(job.endDate);
  return (
    <li className="border-t border-gray-200 first:border-t-0">
      <Link
        href={`/jobs/${job.id}`}
        className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="font-medium text-gray-900">{job.title}</span>
          {job.description && (
            <span className="line-clamp-2 text-sm text-gray-600">{job.description}</span>
          )}
          {closes && <span className="text-[13px] text-gray-500">Apply by {closes}</span>}
        </div>
        <ChevronRightIcon className="flex-none text-gray-400" />
      </Link>
    </li>
  );
}

export default async function JobPostingsPage() {
  const jobs = await getOpenJobs();
  const departments = groupByDepartment(jobs);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-[-0.02em]">Open positions</h1>
        <p className="text-sm text-gray-600">
          {jobs.length === 0
            ? 'Find a role that fits and apply in a few minutes.'
            : `${jobs.length} open ${jobs.length === 1 ? 'role' : 'roles'} across ${departments.length} ${
                departments.length === 1 ? 'department' : 'departments'
              }. Pick one to read more and apply.`}
        </p>
      </div>

      {departments.length > 1 && (
        <nav aria-label="Departments" className="flex flex-wrap gap-2">
          {departments.map(({ key, label, jobs: items }) => (
            <a
              key={key}
              href={`#dept-${key}`}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-gray-300 bg-white px-3.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
            >
              {label}
              <span className="text-gray-500">{items.length}</span>
            </a>
          ))}
        </nav>
      )}

      {jobs.length === 0 && (
        <div className={`${cardClass} px-6 py-14 text-center`}>
          <p className="font-medium">There are no open positions right now.</p>
          <p className="mt-1 text-sm text-gray-600">Please check back soon.</p>
        </div>
      )}

      {departments.map(({ key, label, jobs: items }) => (
        <section
          key={key}
          id={`dept-${key}`}
          aria-labelledby={`dept-${key}-title`}
          className="flex scroll-mt-6 flex-col gap-3"
        >
          <div className="flex items-baseline gap-2">
            <h2 id={`dept-${key}-title`} className="text-lg font-semibold">
              {label}
            </h2>
            <span className="text-sm text-gray-500">
              {items.length} {items.length === 1 ? 'role' : 'roles'}
            </span>
          </div>
          <ul className={`${cardClass} overflow-hidden`}>
            {items.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
