'use client';

import { useState, type FormEvent } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import { formatDateTime, toDateTimeLocalInput } from '@/lib/format';
import { useFetch } from '@/lib/useFetch';
import type { Interview, User } from '@/lib/types';
import { useCurrentUser } from '@/components/CurrentUser';
import { PlusIcon } from '@/components/icons';
import {
  Badge,
  ErrorAlert,
  Required,
  btnPrimary,
  btnSecondary,
  btnSmall,
  cardClass,
  fieldClass,
  fieldGridClass,
  inputClass,
  labelClass,
  linkClass,
  selectClass,
} from '@/components/ui';

const DEFAULT_DURATION_MINUTES = 60;
const MAX_DURATION_MINUTES = 480;
const FUTURE_ERROR = 'The meeting must be scheduled in the future.';

function MeetingList({ applicationId }: { applicationId: string }) {
  const meetings = useFetch<Interview[]>(`/interviews/application/${applicationId}`);
  // Captured once per mount; the list remounts whenever a meeting is added.
  const [now] = useState(() => Date.now());

  return (
    <>
      {meetings.loading && <p className="py-3 text-sm text-gray-600">Loading meetings...</p>}
      {meetings.error && (
        <div className="py-3">
          <ErrorAlert>{meetings.error}</ErrorAlert>
        </div>
      )}
      {meetings.data?.length === 0 && (
        <p className="py-3 text-sm text-gray-600">
          No meetings have been scheduled for this application.
        </p>
      )}
      {meetings.data && meetings.data.length > 0 && (
        <ul className="divide-y divide-gray-200">
          {meetings.data.map((meeting) => {
            const isPast = new Date(meeting.scheduledAt).getTime() < now;
            return (
              <li key={meeting.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {formatDateTime(meeting.scheduledAt)}
                    </span>
                    <Badge tone={isPast ? 'gray' : 'blue'}>{isPast ? 'Past' : 'Upcoming'}</Badge>
                  </div>
                  <span className="text-xs text-gray-600">
                    {meeting.durationMinutes} min · with{' '}
                    {meeting.interviewer?.name ?? 'Unknown interviewer'}
                  </span>
                </div>
                {meeting.meetingLink && (
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${linkClass} flex-none text-sm`}
                  >
                    Open link
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function MeetingForm({
  applicationId,
  onCreated,
  onCancel,
}: {
  applicationId: string;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const { user } = useCurrentUser();
  const members = useFetch<User[]>('/user');
  const [interviewerId, setInterviewerId] = useState(user?.id ?? '');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(String(DEFAULT_DURATION_MINUTES));
  const [meetingLink, setMeetingLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // Earliest selectable time in the picker; the real check happens on submit.
  const [minDateTime] = useState(() => toDateTimeLocalInput(new Date()));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const when = new Date(scheduledAt);
    if (Number.isNaN(when.getTime())) {
      setError('Please choose a date and time.');
      return;
    }
    if (when.getTime() <= Date.now()) {
      setError(FUTURE_ERROR);
      return;
    }

    setSaving(true);
    try {
      await api.post('/interviews', {
        applicationId,
        interviewerUserId: interviewerId,
        scheduledAt: when.toISOString(),
        durationMinutes: Number(duration),
        meetingLink: meetingLink.trim() || undefined,
      });
      onCreated();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to schedule the meeting'));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 border-t border-gray-200 py-4">
      {error && <ErrorAlert>{error}</ErrorAlert>}
      {members.error && <ErrorAlert>{members.error}</ErrorAlert>}

      <div className={fieldGridClass}>
        <div className={fieldClass}>
          <label htmlFor="m-interviewer" className={labelClass}>
            Interviewer <Required />
          </label>
          <select
            id="m-interviewer"
            value={members.data ? interviewerId : ''}
            onChange={(e) => setInterviewerId(e.target.value)}
            className={`${selectClass} w-full`}
            disabled={saving || !members.data}
            required
          >
            <option value="" disabled>
              {members.loading ? 'Loading members...' : 'Select an interviewer'}
            </option>
            {members.data?.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div className={fieldClass}>
          <label htmlFor="m-when" className={labelClass}>
            Date and time <Required />
          </label>
          <input
            id="m-when"
            type="datetime-local"
            value={scheduledAt}
            min={minDateTime}
            onChange={(e) => setScheduledAt(e.target.value)}
            className={inputClass}
            disabled={saving}
            required
          />
        </div>

        <div className={fieldClass}>
          <label htmlFor="m-duration" className={labelClass}>
            Duration (minutes) <Required />
          </label>
          <input
            id="m-duration"
            type="number"
            value={duration}
            min={1}
            max={MAX_DURATION_MINUTES}
            step={1}
            onChange={(e) => setDuration(e.target.value)}
            className={inputClass}
            disabled={saving}
            required
          />
        </div>

        <div className={fieldClass}>
          <label htmlFor="m-link" className={labelClass}>
            Meeting link <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <input
            id="m-link"
            type="url"
            value={meetingLink}
            maxLength={2048}
            placeholder="https://"
            onChange={(e) => setMeetingLink(e.target.value)}
            className={inputClass}
            disabled={saving}
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={saving} className={btnSecondary}>
          Cancel
        </button>
        <button type="submit" disabled={saving || !members.data} className={btnPrimary}>
          {saving ? 'Scheduling...' : 'Schedule meeting'}
        </button>
      </div>
    </form>
  );
}

/** Meetings for one application, with a scheduling form for admins. */
export default function Meetings({ applicationId }: { applicationId: string }) {
  const { isAdmin } = useCurrentUser();
  const [showForm, setShowForm] = useState(false);
  // Bumped after each new meeting so the list remounts and refetches.
  const [listVersion, setListVersion] = useState(0);

  return (
    <section className={`${cardClass} px-5 py-2`}>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
        <h2 className="text-base font-semibold">Meetings</h2>
        {isAdmin && !showForm && (
          <button type="button" onClick={() => setShowForm(true)} className={btnSmall}>
            <PlusIcon size={14} />
            Schedule meeting
          </button>
        )}
      </div>

      <MeetingList key={listVersion} applicationId={applicationId} />

      {isAdmin && showForm && (
        <MeetingForm
          applicationId={applicationId}
          onCancel={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            setListVersion((v) => v + 1);
          }}
        />
      )}
    </section>
  );
}
