'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { api, getErrorMessage } from '@/lib/api';
import { formatDate, formatDateTime, formatFileSize } from '@/lib/format';
import { useFetch } from '@/lib/useFetch';
import {
  DOCUMENT_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_TRANSITIONS,
  departmentLabel,
  isListingActive,
  type Application,
  type ApplicationDocument,
  type ApplicationStatus,
  type StatusHistoryEntry,
} from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import { DownloadIcon, FileTextIcon } from '@/components/icons';
import {
  Avatar,
  Breadcrumb,
  ErrorAlert,
  SuccessAlert,
  btnPrimary,
  btnSmall,
  cardClass,
  fieldClass,
  labelClass,
  linkClass,
  selectClass,
  textareaClass,
} from '@/components/ui';

/** Turns a key like "linkedinUrl" or "years_experience" into "Linkedin url" / "Years experience". */
function humanizeKey(key: string): string {
  const words = key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function renderValue(value: unknown): ReactNode {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string') {
    if (/^https?:\/\//i.test(value)) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className={`${linkClass} break-all`}>
          {value}
        </a>
      );
    }
    return <span className="whitespace-pre-wrap">{value}</span>;
  }
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value) && value.every((v) => typeof v !== 'object' || v === null)) {
    return value.join(', ');
  }
  return (
    <pre className="overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-[200px_1fr] sm:gap-4">
      <dt className="text-sm font-medium text-gray-600">{label}</dt>
      <dd className="min-w-0 text-sm text-gray-900">{children}</dd>
    </div>
  );
}

function Documents({ applicationId }: { applicationId: string }) {
  const documents = useFetch<ApplicationDocument[]>(`/documents/application/${applicationId}`);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const download = async (doc: ApplicationDocument) => {
    setDownloadingId(doc.id);
    setError('');
    try {
      // Fetched through the API client so the session cookie is sent and failures show inline.
      const res = await api.get<Blob>(`/documents/${doc.id}/download`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.originalFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError(`Failed to download ${doc.originalFilename}. Please try again.`);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section className={`${cardClass} px-5 py-2`}>
      <h2 className="pt-3 text-base font-semibold">Documents</h2>
      {documents.loading && <p className="py-3 text-sm text-gray-600">Loading documents...</p>}
      {documents.error && (
        <div className="py-3">
          <ErrorAlert>{documents.error}</ErrorAlert>
        </div>
      )}
      {error && (
        <div className="pt-3">
          <ErrorAlert>{error}</ErrorAlert>
        </div>
      )}
      {documents.data?.length === 0 && (
        <p className="py-3 text-sm text-gray-600">No documents are attached to this application.</p>
      )}
      {documents.data && documents.data.length > 0 && (
        <ul className="divide-y divide-gray-200">
          {documents.data.map((doc) => (
            <li key={doc.id} className="flex items-center gap-3 py-3">
              <FileTextIcon size={18} className="flex-none text-gray-500" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm text-gray-900" title={doc.originalFilename}>
                  {doc.originalFilename}
                </span>
                <span className="text-xs text-gray-600">
                  {DOCUMENT_TYPE_LABELS[doc.documentType] ?? doc.documentType} ·{' '}
                  {formatFileSize(doc.sizeBytes)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => download(doc)}
                disabled={downloadingId !== null}
                aria-label={`Download ${doc.originalFilename}`}
                className={`${btnSmall} flex-none`}
              >
                <DownloadIcon size={14} />
                {downloadingId === doc.id ? 'Downloading...' : 'Download'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function StatusForm({
  application,
  onSaved,
}: {
  application: Application;
  onSaved: () => void;
}) {
  const [saved, setSaved] = useState<ApplicationStatus>(application.status ?? 'APPLIED');
  const [selected, setSelected] = useState<ApplicationStatus | ''>('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const nextStatuses = STATUS_TRANSITIONS[saved];

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selected === '') return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.patch(`/application-forms/${application.id}/status`, {
        status: selected,
        remarks: remarks.trim() || undefined,
      });
      setSaved(selected);
      setSelected('');
      setRemarks('');
      setSuccess(`Status updated to ${STATUS_LABELS[selected]}.`);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update the status'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className={`${cardClass} flex flex-col gap-4 p-5`}>
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">Status</h2>
        <p className="text-[13px] text-gray-600">
          Current: <StatusBadge status={saved} />
        </p>
      </div>

      {error && <ErrorAlert>{error}</ErrorAlert>}
      {success && <SuccessAlert>{success}</SuccessAlert>}

      {nextStatuses.length === 0 ? (
        <p className="text-[13px] text-gray-600">
          This application is {STATUS_LABELS[saved].toLowerCase()}. Its status can no longer be
          changed.
        </p>
      ) : (
        <>
          <div className={fieldClass}>
            <label htmlFor="status" className={labelClass}>
              Update status
            </label>
            <select
              id="status"
              value={selected}
              disabled={saving}
              onChange={(e) => {
                setSelected(e.target.value as ApplicationStatus);
                setSuccess('');
              }}
              className={`${selectClass} w-full`}
            >
              <option value="" disabled>
                Select a status
              </option>
              {nextStatuses.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div className={fieldClass}>
            <label htmlFor="remarks" className={labelClass}>
              Remarks <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <textarea
              id="remarks"
              rows={3}
              maxLength={2000}
              value={remarks}
              disabled={saving}
              onChange={(e) => setRemarks(e.target.value)}
              className={textareaClass}
            />
          </div>

          <button type="submit" disabled={selected === '' || saving} className={btnPrimary}>
            {saving ? 'Saving...' : 'Save status'}
          </button>
        </>
      )}
    </form>
  );
}

function StatusHistory({ applicationId }: { applicationId: string }) {
  const history = useFetch<StatusHistoryEntry[]>(
    `/application-status-history/application/${applicationId}`,
  );

  return (
    <section className={`${cardClass} flex flex-col gap-3 p-5`}>
      <h2 className="text-base font-semibold">Status history</h2>
      {history.loading && <p className="text-sm text-gray-600">Loading history...</p>}
      {history.error && <ErrorAlert>{history.error}</ErrorAlert>}
      {history.data?.length === 0 && (
        <p className="text-sm text-gray-600">No status changes have been recorded yet.</p>
      )}
      {history.data && history.data.length > 0 && (
        <ol className="flex flex-col divide-y divide-gray-200">
          {history.data.map((entry) => (
            <li key={entry.id} className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge status={entry.oldStatus} />
                <span aria-label="changed to" className="text-gray-500">
                  →
                </span>
                <StatusBadge status={entry.newStatus} />
              </div>
              <p className="text-xs text-gray-600">
                {entry.user?.name ?? 'Unknown user'} · {formatDateTime(entry.changedAt)}
              </p>
              {entry.remarks && (
                <p className="whitespace-pre-wrap break-words text-[13px] text-gray-900">
                  {entry.remarks}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function StatusPanel({ application }: { application: Application }) {
  // Bumped after each save so the history remounts and refetches.
  const [historyVersion, setHistoryVersion] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      <StatusForm application={application} onSaved={() => setHistoryVersion((v) => v + 1)} />
      <StatusHistory key={historyVersion} applicationId={application.id} />
    </div>
  );
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const application = useFetch<Application>(`/application-forms/${id}`);
  const app = application.data;
  const name = app ? `${app.firstName} ${app.lastName}` : '';
  const extra = Object.entries(app?.additionalProperties ?? {});

  return (
    <div className="mx-auto flex max-w-250 flex-col gap-6">
      <Breadcrumb
        parentHref="/applications"
        parentLabel="Job applications"
        current={name || 'Application'}
      />

      {application.loading && <p className="text-sm text-gray-600">Loading application...</p>}
      {application.error && <ErrorAlert>{application.error}</ErrorAlert>}

      {app && (
        <>
          <div className="flex items-center gap-4">
            <Avatar name={name} size="lg" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <h1 className="text-2xl font-semibold tracking-[-0.01em]">{name}</h1>
              <a href={`mailto:${app.email}`} className={`${linkClass} text-sm`}>
                {app.email}
              </a>
            </div>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
            <div className="flex flex-col gap-6">
              <section className={`${cardClass} px-5 py-2`}>
                <h2 className="pt-3 text-base font-semibold">Application</h2>
                <dl className="divide-y divide-gray-200">
                  <DetailRow label="First name">{app.firstName}</DetailRow>
                  <DetailRow label="Last name">{app.lastName}</DetailRow>
                  <DetailRow label="Email">{app.email}</DetailRow>
                  <DetailRow label="Job listing">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{app.job?.title ?? '—'}</span>
                      {app.job &&
                        (isListingActive(app.job) ? (
                          <span className="text-xs text-emerald-700">● Active</span>
                        ) : (
                          <span className="text-xs text-gray-600">○ Closed</span>
                        ))}
                    </div>
                  </DetailRow>
                  <DetailRow label="Department">{departmentLabel(app.job?.department)}</DetailRow>
                  <DetailRow label="Submitted">{formatDate(app.submissonDate)}</DetailRow>
                </dl>
              </section>

              <Documents applicationId={app.id} />

              <section className={`${cardClass} px-5 py-2`}>
                <h2 className="pt-3 text-base font-semibold">Additional details</h2>
                {extra.length === 0 ? (
                  <p className="py-3 text-sm text-gray-600">
                    The applicant didn&apos;t provide any additional details.
                  </p>
                ) : (
                  <dl className="divide-y divide-gray-200">
                    {extra.map(([key, value]) => (
                      <DetailRow key={key} label={humanizeKey(key)}>
                        {renderValue(value)}
                      </DetailRow>
                    ))}
                  </dl>
                )}
              </section>
            </div>

            <StatusPanel key={app.id} application={app} />
          </div>
        </>
      )}
    </div>
  );
}
