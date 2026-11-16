import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOpenJob } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { departmentLabel } from '@/lib/types';
import { Badge, Breadcrumb, btnPrimary, cardClass } from '@/components/ui';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await getOpenJob(id).catch(() => null);
  return job ? { title: job.title, description: job.description ?? undefined } : {};
}

export default async function JobPostPage({ params }: Props) {
  const { id } = await params;
  const job = await getOpenJob(id);
  if (!job) notFound();

  const closes = formatDate(job.endDate);
  const facts = [
    { label: 'Department', value: departmentLabel(job.department) },
    { label: 'Posted', value: formatDate(job.startDate ?? job.createdAt) },
    { label: 'Apply by', value: closes || 'Open until filled' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb trail={[{ href: '/', label: 'Open positions' }]} current={job.title} />

      <div className="flex flex-col items-start gap-3">
        {job.department && <Badge>{departmentLabel(job.department)}</Badge>}
        <h1 className="text-3xl font-semibold tracking-[-0.02em]">{job.title}</h1>
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[1fr_280px]">
        <section className={`${cardClass} flex flex-col gap-3 p-6`}>
          <h2 className="text-base font-semibold">About the role</h2>
          {job.description ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {job.description}
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              No description has been added for this role yet.
            </p>
          )}
        </section>

        <aside className={`${cardClass} flex flex-col gap-5 p-6`}>
          <dl className="flex flex-col gap-3">
            {facts.map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <dt className="text-xs font-semibold uppercase tracking-[0.04em] text-gray-600">
                  {label}
                </dt>
                <dd className="text-sm text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
          <Link href={`/jobs/${job.id}/apply`} className={`${btnPrimary} w-full`}>
            Apply for this job
          </Link>
        </aside>
      </div>
    </div>
  );
}
