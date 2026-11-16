import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getOpenJob } from '@/lib/api';
import { departmentLabel } from '@/lib/types';
import { Breadcrumb } from '@/components/ui';
import ApplicationForm from './ApplicationForm';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = await getOpenJob(id).catch(() => null);
  return job ? { title: `Apply: ${job.title}` } : {};
}

export default async function ApplyPage({ params }: Props) {
  const { id } = await params;
  const job = await getOpenJob(id);
  if (!job) notFound();

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-6">
      <Breadcrumb
        trail={[
          { href: '/', label: 'Open positions' },
          { href: `/jobs/${job.id}`, label: job.title },
        ]}
        current="Apply"
      />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">Apply for {job.title}</h1>
        <p className="text-sm text-gray-600">
          {job.department ? `${departmentLabel(job.department)} · ` : ''}Fields marked{' '}
          <span className="text-red-700">*</span> are required.
        </p>
      </div>

      <ApplicationForm jobId={job.id} jobTitle={job.title} />
    </div>
  );
}
