'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, getErrorMessage } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { toDateInput } from '@/lib/format';
import {
  departmentLabel,
  isListingActive,
  type Department,
  type JobListing,
} from '@/lib/types';
import {
  ErrorAlert,
  Required,
  btnPrimary,
  btnSecondary,
  cardClass,
  cardFooterClass,
  fieldClass,
  fieldGridClass,
  hintClass,
  inputClass,
  labelClass,
  selectClass,
  textareaClass,
} from '@/components/ui';

const DESCRIPTION_MAX_LENGTH = 10_000;

/** Create form when `listing` is omitted, edit form otherwise. */
export default function JobListingForm({ listing }: { listing?: JobListing }) {
  const router = useRouter();
  const departments = useFetch<Department[]>('/departments');

  // The backend rejects any change to a listing once it is inactive.
  const isLocked = !!listing && !isListingActive(listing);

  const [title, setTitle] = useState(listing?.title ?? '');
  const [department, setDepartment] = useState(listing?.department ?? '');
  const [description, setDescription] = useState(listing?.description ?? '');
  const [startDate, setStartDate] = useState(toDateInput(listing?.startDate));
  const [endDate, setEndDate] = useState(toDateInput(listing?.endDate));
  const [active, setActive] = useState(!isLocked);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (startDate && endDate && endDate < startDate) {
      return setError("The end date can't be before the start date.");
    }

    setIsLoading(true);

    try {
      let id = listing?.id;

      if (listing) {
        // null clears a value that was set before.
        await api.patch(`/job-listings/${listing.id}`, {
          title: title.trim(),
          description: description.trim() || null,
          department: department || null,
          startDate: startDate || null,
          endDate: endDate || null,
        });
      } else {
        const response = await api.post<JobListing>('/job-listings', {
          title: title.trim(),
          description: description.trim() || undefined,
          department: department || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        id = response.data.id;
      }

      // Listings are always created active; switching one off is a separate call.
      if (!active) {
        await api.patch(`/job-listings/${id}/set-inactive`);
      }

      router.push('/job-listings');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save the job listing'));
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} flex flex-col`}>
      <div className="flex flex-col gap-5 p-6">
        {isLocked && (
          <ErrorAlert>
            This listing is inactive. Inactive listings can no longer be edited or reactivated.
          </ErrorAlert>
        )}

        <div className={fieldClass}>
          <label htmlFor="j-title" className={labelClass}>
            Title <Required />
          </label>
          <input
            id="j-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="e.g. Senior Backend Engineer"
            minLength={3}
            maxLength={10_000}
            required
            disabled={isLocked}
          />
        </div>

        <div className={fieldClass}>
          <label htmlFor="j-dept" className={labelClass}>
            Department
          </label>
          <select
            id="j-dept"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className={selectClass}
            disabled={isLocked}
          >
            <option value="">Select a department</option>
            {(departments.data ?? []).map((dept) => (
              <option key={dept.id} value={dept.name}>
                {departmentLabel(dept.name)}
              </option>
            ))}
          </select>
        </div>

        <div className={fieldClass}>
          <label htmlFor="j-desc" className={labelClass}>
            Description
          </label>
          <textarea
            id="j-desc"
            rows={7}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={textareaClass}
            placeholder="Responsibilities, requirements and anything candidates should know"
            maxLength={DESCRIPTION_MAX_LENGTH}
            disabled={isLocked}
          />
          <p className="text-xs text-gray-600">
            {description.length}/{DESCRIPTION_MAX_LENGTH} characters
          </p>
        </div>

        <div className={fieldGridClass}>
          <div className={fieldClass}>
            <label htmlFor="j-start" className={labelClass}>
              Start date
            </label>
            <input
              id="j-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
              disabled={isLocked}
            />
          </div>
          <div className={fieldClass}>
            <label htmlFor="j-end" className={labelClass}>
              End date
            </label>
            <input
              id="j-end"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
              disabled={isLocked}
            />
          </div>
        </div>
        <p className={hintClass}>The end date can&apos;t be before the start date.</p>

        <div className="flex items-center justify-between gap-4 rounded-[10px] border border-gray-200 p-4">
          <div className="flex flex-col gap-0.5">
            <span id="j-active-label" className="text-sm font-medium">
              Active
            </span>
            <span className="text-[13px] text-gray-600">
              Active listings accept new applications. Switching a listing off can&apos;t be undone.
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={active}
            aria-labelledby="j-active-label"
            onClick={() => setActive(!active)}
            disabled={isLocked}
            className={`box-border flex h-7 w-12 flex-none cursor-pointer items-center rounded-full p-[3px] disabled:cursor-not-allowed ${
              active ? 'justify-end bg-blue-600' : 'justify-start bg-gray-400'
            }`}
          >
            <span className="h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
          </button>
        </div>

        {error && <ErrorAlert>{error}</ErrorAlert>}
      </div>

      <div className={cardFooterClass}>
        <Link href="/job-listings" className={btnSecondary}>
          {isLocked ? 'Back' : 'Cancel'}
        </Link>
        {!isLocked && (
          <button type="submit" disabled={isLoading} className={btnPrimary}>
            {isLoading ? 'Saving...' : 'Save listing'}
          </button>
        )}
      </div>
    </form>
  );
}
