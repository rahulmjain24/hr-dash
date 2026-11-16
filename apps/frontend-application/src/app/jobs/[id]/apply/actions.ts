'use server';

import { API_URL } from '@/lib/api';

const FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'linkedinUrl',
  'portfolioUrl',
  'coverLetter',
] as const;

export type ApplyValues = Partial<Record<(typeof FIELDS)[number], string>>;

export interface ApplyState {
  status: 'idle' | 'error' | 'success';
  message?: string;
  /** What the applicant typed, so a failed submit doesn't clear the form. */
  values?: ApplyValues;
}

const GENERIC_ERROR = "We couldn't submit your application. Please try again in a moment.";

export async function submitApplication(
  jobId: string,
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const values: ApplyValues = {};
  for (const field of FIELDS) {
    const value = formData.get(field);
    if (typeof value === 'string' && value.trim() !== '') values[field] = value.trim();
  }

  // The backend validates every field; this only short-circuits an obviously empty submit.
  if (!values.firstName || !values.lastName || !values.email) {
    return { status: 'error', message: 'First name, last name and email are required.', values };
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/public/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, ...values }),
      cache: 'no-store',
    });
  } catch {
    return { status: 'error', message: GENERIC_ERROR, values };
  }

  if (res.ok) return { status: 'success' };

  if (res.status === 409) {
    return {
      status: 'error',
      message: "You've already applied for this job with this email address.",
      values,
    };
  }
  if (res.status === 404) {
    return {
      status: 'error',
      message: 'This position is no longer accepting applications.',
      values,
    };
  }
  if (res.status === 400) {
    // Validation messages are written for applicants, so they can be shown as they are.
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
    return { status: 'error', message: message || GENERIC_ERROR, values };
  }
  return { status: 'error', message: GENERIC_ERROR, values };
}
