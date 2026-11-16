'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { api, getErrorMessage } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { useFetch } from '@/lib/useFetch';
import {
  STATUS_LABELS,
  departmentLabel,
  isListingActive,
  type Application,
  type ApplicationStatus,
} from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import {
  Avatar,
  Breadcrumb,
  ErrorAlert,
  SuccessAlert,
  btnPrimary,
  cardClass,
  labelClass,
  linkClass,
  selectClass,
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

function StatusForm({ application }: { application: Application }) {
  const [saved, setSaved] = useState(application.status ?? null);
  const [selected, setSelected] = useState<ApplicationStatus | ''>(application.status ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const dirty = selected !== '' && selected !== saved;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!dirty) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.patch(`/application-forms/${application.id}/status`, { status: selected });
      setSaved(selected);
      setSuccess(`Status updated to ${STATUS_LABELS[selected]}.`);
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

      <div className="flex flex-col gap-1.5">
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
          {selected === '' && (
            <option value="" disabled>
              Select a status
            </option>
          )}
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={!dirty || saving} className={btnPrimary}>
        {saving ? 'Saving...' : 'Save status'}
      </button>
    </form>
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

            <StatusForm key={app.id} application={app} />
          </div>
        </>
      )}
    </div>
  );
}
