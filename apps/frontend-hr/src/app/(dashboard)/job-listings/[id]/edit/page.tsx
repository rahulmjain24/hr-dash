'use client';

import { useParams } from 'next/navigation';
import JobListingForm from '@/components/JobListingForm';
import { Breadcrumb, ErrorAlert } from '@/components/ui';
import { useFetch } from '@/lib/useFetch';
import type { JobListing } from '@/lib/types';

export default function EditJobListingPage() {
  const { id } = useParams<{ id: string }>();
  const listing = useFetch<JobListing>(`/job-listings/${id}`);

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Breadcrumb parentHref="/job-listings" parentLabel="Job listings" current="Edit job listing" />
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">
          {listing.data?.title ?? 'Edit job listing'}
        </h1>
        <p className="text-sm text-gray-600">Update the details of this listing.</p>
      </div>

      {listing.loading && <p className="text-sm text-gray-600">Loading job listing...</p>}
      {listing.error && <ErrorAlert>{listing.error}</ErrorAlert>}
      {listing.data && <JobListingForm key={listing.data.id} listing={listing.data} />}
    </div>
  );
}
