'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api, getErrorMessage } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { formatDate } from '@/lib/format';
import { ROLE_LABELS, type User, type UserRole } from '@/lib/types';
import { useCurrentUser } from '@/components/CurrentUser';
import {
  Avatar,
  Breadcrumb,
  ErrorAlert,
  SuccessAlert,
  btnPrimary,
  btnSecondary,
  cardClass,
  cardFooterClass,
  fieldClass,
  fieldGridClass,
  inputClass,
  labelClass,
} from '@/components/ui';

const ROLES: UserRole[] = ['MEMBER', 'ADMIN'];

function ProfileForm({ member, onSaved }: { member: User; onSaved: (member: User) => void }) {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [role, setRole] = useState<UserRole>(member.role);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await api.patch<User>(`/user/${member.id}`, {
        name: name.trim(),
        email: email.trim(),
        role,
      });
      onSaved(response.data);
      setSuccess('Changes saved.');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save changes'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} flex flex-col`}>
      <div className="flex flex-col gap-5 p-6">
        <h2 className="text-base font-semibold">Profile</h2>
        <div className={fieldGridClass}>
          <div className={fieldClass}>
            <label htmlFor="e-name" className={labelClass}>
              Full name
            </label>
            <input
              id="e-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              autoComplete="off"
              required
            />
          </div>
          <div className={fieldClass}>
            <label htmlFor="e-email" className={labelClass}>
              Email
            </label>
            <input
              id="e-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              autoComplete="off"
              required
            />
          </div>
        </div>

        <fieldset className="m-0 flex flex-col border-0 p-0">
          <legend className={`mb-2.5 p-0 ${labelClass}`}>Role</legend>
          <div className="flex flex-wrap gap-6">
            {ROLES.map((value) => (
              <label
                key={value}
                htmlFor={`e-role-${value}`}
                className="flex min-h-11 cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  id={`e-role-${value}`}
                  type="radio"
                  name="e-role"
                  value={value}
                  checked={role === value}
                  onChange={() => setRole(value)}
                  className="h-[18px] w-[18px] accent-blue-600"
                />
                {ROLE_LABELS[value]}
              </label>
            ))}
          </div>
        </fieldset>

        {error && <ErrorAlert>{error}</ErrorAlert>}
        {success && <SuccessAlert>{success}</SuccessAlert>}
      </div>

      <div className={cardFooterClass}>
        <Link href="/members" className={btnSecondary}>
          Cancel
        </Link>
        <button type="submit" disabled={isLoading} className={btnPrimary}>
          {isLoading ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}

function PasswordForm({ member }: { member: User }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      return setError('Password must be at least 8 characters long');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsLoading(true);

    try {
      await api.patch(`/user/${member.id}`, { password });
      setPassword('');
      setConfirmPassword('');
      setSuccess('Password updated.');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update the password'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} flex flex-col`}>
      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">Set a new password</h2>
          <p className="text-[13px] text-gray-600">
            Leave empty to keep the current password. The member signs in with the new password
            next time.
          </p>
        </div>
        <div className={fieldGridClass}>
          <div className={fieldClass}>
            <label htmlFor="e-pass" className={labelClass}>
              New password
            </label>
            <input
              id="e-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <div className={fieldClass}>
            <label htmlFor="e-pass2" className={labelClass}>
              Confirm new password
            </label>
            <input
              id="e-pass2"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="Repeat password"
              autoComplete="new-password"
              required
            />
          </div>
        </div>

        {error && <ErrorAlert>{error}</ErrorAlert>}
        {success && <SuccessAlert>{success}</SuccessAlert>}
      </div>

      <div className={cardFooterClass}>
        <button type="submit" disabled={isLoading} className={`${btnSecondary} px-5`}>
          {isLoading ? 'Updating...' : 'Update password'}
        </button>
      </div>
    </form>
  );
}

function DeleteMember({ member }: { member: User }) {
  const router = useRouter();
  const { user } = useCurrentUser();
  const isSelf = user?.id === member.id;

  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setError('');
    setIsLoading(true);

    try {
      await api.delete(`/user/${member.id}`);
      router.push('/members');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete the member'));
      setIsLoading(false);
    }
  };

  return (
    <section
      aria-label="Delete member"
      className="flex flex-col gap-4 rounded-xl border border-red-200 bg-white p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-[1_1_320px] flex-col gap-1">
          <h2 className="text-base font-semibold text-red-700">Delete member</h2>
          <p className="text-[13px] text-gray-600">
            {isSelf
              ? "You can't delete your own account."
              : "Removes this person's access to the HR Portal. This can't be undone."}
          </p>
        </div>
        {!confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={isSelf}
            className="h-11 cursor-pointer rounded-lg border border-red-300 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
          >
            Delete member
          </button>
        )}
      </div>

      {confirming && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-900">
            Delete <strong>{member.name}</strong> ({member.email})?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={isLoading}
              className={`${btnSecondary} h-10 px-3.5`}
            >
              Keep member
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="h-10 cursor-pointer rounded-lg bg-red-700 px-3.5 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'Deleting...' : 'Yes, delete'}
            </button>
          </div>
        </div>
      )}

      {error && <ErrorAlert>{error}</ErrorAlert>}
    </section>
  );
}

export default function EditMemberPage() {
  const { id } = useParams<{ id: string }>();
  const fetched = useFetch<User>(`/user/${id}`);
  // Holds the member as last saved, so the header reflects profile edits.
  const [saved, setSaved] = useState<User | null>(null);
  const member = saved ?? fetched.data;

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Breadcrumb parentHref="/members" parentLabel="Members" current="Edit member" />
        {member && (
          <div className="flex items-center gap-4">
            <Avatar name={member.name} size="lg" />
            <div className="flex flex-col gap-0.5">
              <h1 className="text-2xl font-semibold tracking-[-0.01em]">{member.name}</h1>
              <p className="text-[13px] text-gray-600">
                Created {formatDate(member.createdAt)} · Last updated {formatDate(member.updatedAt)}
              </p>
            </div>
          </div>
        )}
      </div>

      {fetched.loading && <p className="text-sm text-gray-600">Loading member...</p>}
      {fetched.error && <ErrorAlert>{fetched.error}</ErrorAlert>}

      {member && (
        <>
          <ProfileForm key={member.id} member={member} onSaved={setSaved} />
          <PasswordForm member={member} />
          <DeleteMember member={member} />
        </>
      )}
    </div>
  );
}
