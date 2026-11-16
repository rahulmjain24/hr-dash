import JobListingForm from '@/components/JobListingForm';
import { Breadcrumb } from '@/components/ui';

export default function NewJobListingPage() {
  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Breadcrumb parentHref="/job-listings" parentLabel="Job listings" current="New job listing" />
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">New job listing</h1>
        <p className="text-sm text-gray-600">Publish a role candidates can apply to.</p>
      </div>

      <JobListingForm />
    </div>
  );
}
