'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { submitApplication, type ApplyState } from './actions';
import { CheckCircleIcon } from '@/components/icons';
import {
  ErrorAlert,
  Required,
  btnPrimary,
  btnSecondary,
  cardClass,
  cardFooterClass,
  fieldClass,
  fieldGridClass,
  inputClass,
  labelClass,
  textareaClass,
} from '@/components/ui';

const COVER_LETTER_MAX_LENGTH = 5000;
const initialState: ApplyState = { status: 'idle' };

export default function ApplicationForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [state, formAction, isPending] = useActionState(
    submitApplication.bind(null, jobId),
    initialState,
  );
  const values = state.values ?? {};

  if (state.status === 'success') {
    return (
      <div
        role="status"
        className={`${cardClass} flex flex-col items-center gap-4 px-6 py-14 text-center`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
          <CheckCircleIcon size={24} />
        </span>
        <h2 className="text-xl font-semibold">Application submitted</h2>
        <p className="max-w-[440px] text-sm text-gray-600">
          Thanks for applying for <strong className="text-gray-900">{jobTitle}</strong>. Our hiring
          team will review your application and get in touch by email.
        </p>
        <Link href="/" className={btnSecondary}>
          Back to open positions
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className={`${cardClass} flex flex-col`}>
      <div className="flex flex-col gap-5 p-6">
        <div className={fieldGridClass}>
          <div className={fieldClass}>
            <label htmlFor="a-first" className={labelClass}>
              First name <Required />
            </label>
            <input
              id="a-first"
              name="firstName"
              type="text"
              defaultValue={values.firstName}
              className={inputClass}
              autoComplete="given-name"
              maxLength={255}
              required
            />
          </div>
          <div className={fieldClass}>
            <label htmlFor="a-last" className={labelClass}>
              Last name <Required />
            </label>
            <input
              id="a-last"
              name="lastName"
              type="text"
              defaultValue={values.lastName}
              className={inputClass}
              autoComplete="family-name"
              maxLength={255}
              required
            />
          </div>
        </div>

        <div className={fieldGridClass}>
          <div className={fieldClass}>
            <label htmlFor="a-email" className={labelClass}>
              Email <Required />
            </label>
            <input
              id="a-email"
              name="email"
              type="email"
              defaultValue={values.email}
              className={inputClass}
              placeholder="name@example.com"
              autoComplete="email"
              maxLength={255}
              required
            />
          </div>
          <div className={fieldClass}>
            <label htmlFor="a-phone" className={labelClass}>
              Phone
            </label>
            <input
              id="a-phone"
              name="phone"
              type="tel"
              defaultValue={values.phone}
              className={inputClass}
              autoComplete="tel"
              maxLength={30}
            />
          </div>
        </div>

        <div className={fieldGridClass}>
          <div className={fieldClass}>
            <label htmlFor="a-linkedin" className={labelClass}>
              LinkedIn profile
            </label>
            <input
              id="a-linkedin"
              name="linkedinUrl"
              type="url"
              defaultValue={values.linkedinUrl}
              className={inputClass}
              placeholder="https://www.linkedin.com/in/..."
              maxLength={255}
            />
          </div>
          <div className={fieldClass}>
            <label htmlFor="a-portfolio" className={labelClass}>
              Portfolio or website
            </label>
            <input
              id="a-portfolio"
              name="portfolioUrl"
              type="url"
              defaultValue={values.portfolioUrl}
              className={inputClass}
              placeholder="https://"
              maxLength={255}
            />
          </div>
        </div>

        <div className={fieldClass}>
          <label htmlFor="a-cover" className={labelClass}>
            Cover letter
          </label>
          <textarea
            id="a-cover"
            name="coverLetter"
            rows={7}
            defaultValue={values.coverLetter}
            className={textareaClass}
            placeholder="Tell us why you're a good fit for this role"
            maxLength={COVER_LETTER_MAX_LENGTH}
          />
        </div>

        {state.status === 'error' && <ErrorAlert>{state.message}</ErrorAlert>}
      </div>

      <div className={cardFooterClass}>
        <Link href={`/jobs/${jobId}`} className={btnSecondary}>
          Cancel
        </Link>
        <button type="submit" disabled={isPending} className={btnPrimary}>
          {isPending ? 'Submitting...' : 'Submit application'}
        </button>
      </div>
    </form>
  );
}
