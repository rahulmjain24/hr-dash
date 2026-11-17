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

export type DocumentType = 'RESUME' | 'OTHER';

export interface UploadedDocument {
  uploadId: string;
  originalFilename: string;
  sizeBytes: number;
}

export type UploadResult =
  | { ok: true; document: UploadedDocument }
  | { ok: false; message: string };

const UPLOAD_ERROR = "We couldn't upload that file. Please try again.";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function errorMessage(res: Response, fallback: string): Promise<string> {
  // Validation messages are written for applicants, so they can be shown as they are.
  const body = await res.json().catch(() => null);
  const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
  return typeof message === 'string' && message ? message : fallback;
}

/** Stages one file with the backend. The returned uploadId is sent along with the application. */
export async function uploadDocument(
  documentType: DocumentType,
  formData: FormData,
): Promise<UploadResult> {
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'Please choose a file to upload.' };
  }
  if (documentType !== 'RESUME' && documentType !== 'OTHER') {
    return { ok: false, message: UPLOAD_ERROR };
  }

  const body = new FormData();
  body.append('documentType', documentType);
  body.append('file', file, file.name);

  let res: Response;
  try {
    res = await fetch(`${API_URL}/public/documents`, { method: 'POST', body, cache: 'no-store' });
  } catch {
    return { ok: false, message: UPLOAD_ERROR };
  }

  if (res.status === 413) return { ok: false, message: 'File must be at most 5 MB.' };
  if (res.status === 400) return { ok: false, message: await errorMessage(res, UPLOAD_ERROR) };
  if (!res.ok) return { ok: false, message: UPLOAD_ERROR };

  const staged = await res.json().catch(() => null);
  if (typeof staged?.uploadId !== 'string') return { ok: false, message: UPLOAD_ERROR };
  return {
    ok: true,
    document: {
      uploadId: staged.uploadId,
      originalFilename: staged.originalFilename ?? file.name,
      sizeBytes: staged.sizeBytes ?? file.size,
    },
  };
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

  const resumeId = formData.get('resumeId');
  if (typeof resumeId !== 'string' || !UUID_PATTERN.test(resumeId)) {
    return { status: 'error', message: 'Please upload your resume.', values };
  }
  const otherIds = formData
    .getAll('otherDocumentIds')
    .filter((id): id is string => typeof id === 'string' && UUID_PATTERN.test(id));
  const documentIds = [resumeId, ...otherIds];

  let res: Response;
  try {
    res = await fetch(`${API_URL}/public/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, ...values, documentIds }),
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
    return { status: 'error', message: await errorMessage(res, GENERIC_ERROR), values };
  }
  return { status: 'error', message: GENERIC_ERROR, values };
}
