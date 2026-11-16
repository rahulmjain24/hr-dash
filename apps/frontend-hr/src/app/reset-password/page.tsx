'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, getErrorMessage, getErrorStatus } from '@/lib/api';
import { useFetch } from '@/lib/useFetch';
import { AuthHeader, AuthShell, BackToSignIn, authCardClass } from '@/components/AuthShell';
import { AlertTriangleIcon, KeyIcon } from '@/components/icons';
import {
  ErrorAlert,
  SuccessAlert,
  btnPrimary,
  fieldClass,
  inputClass,
  labelClass,
} from '@/components/ui';

function Header({ email }: { email?: string }) {
  return (
    <AuthHeader
      icon={<KeyIcon size={22} />}
      title="Set a new password"
      description={
        email ? (
          <>
            Resetting the password for <strong className="text-gray-900">{email}</strong>
          </>
        ) : (
          'Choose a new password for your account.'
        )
      }
    />
  );
}

function ExpiredLinkNotice() {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3.5"
    >
      <AlertTriangleIcon className="mt-px flex-none text-amber-700" />
      <p className="text-[13px] leading-normal text-amber-800">
        This reset link has expired or was already used.{' '}
        <Link href="/forgot-password" className="font-semibold text-amber-800 underline">
          Request a new link
        </Link>
      </p>
    </div>
  );
}

function ResetPasswordForm({ token }: { token: string }) {
  // Checks the link up front, so a dead link is reported before any typing.
  const target = useFetch<{ email: string }>(`/auth/reset-password/${encodeURIComponent(token)}`);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [rejected, setRejected] = useState(false);
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const expired = rejected || !!target.error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      return setError('Password must be at least 8 characters long');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsLoading(true);

    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
    } catch (err) {
      // Validation errors are 400 with a message array; a dead link is a 400 with a string.
      const message = getErrorMessage(err, 'Could not reset the password. Please try again.');
      if (getErrorStatus(err) === 400 && /reset link/i.test(message)) {
        setRejected(true);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <>
        <Header email={target.data?.email} />
        <SuccessAlert>
          Your password has been reset.{' '}
          <Link href="/login" className="font-semibold underline">
            Sign in
          </Link>
        </SuccessAlert>
      </>
    );
  }

  return (
    <>
      <Header email={target.data?.email} />

      <form onSubmit={handleSubmit} className={authCardClass}>
        <div className={fieldClass}>
          <label htmlFor="rp-pass" className={labelClass}>
            New password
          </label>
          <input
            id="rp-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            minLength={8}
            required
            disabled={expired}
          />
        </div>
        <div className={fieldClass}>
          <label htmlFor="rp-pass2" className={labelClass}>
            Confirm new password
          </label>
          <input
            id="rp-pass2"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
            placeholder="Repeat password"
            autoComplete="new-password"
            required
            disabled={expired}
          />
        </div>

        {error && <ErrorAlert>{error}</ErrorAlert>}

        <button type="submit" disabled={isLoading || expired} className={`${btnPrimary} w-full`}>
          {isLoading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>

      {expired && <ExpiredLinkNotice />}
    </>
  );
}

function ResetPassword() {
  const token = useSearchParams().get('token');

  // Opened without a token: there is nothing to reset.
  if (!token) {
    return (
      <>
        <Header />
        <ExpiredLinkNotice />
      </>
    );
  }

  return <ResetPasswordForm key={token} token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <ResetPassword />
      </Suspense>
      <BackToSignIn />
    </AuthShell>
  );
}
