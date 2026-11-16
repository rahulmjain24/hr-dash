'use client';

import { useState } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import { AuthHeader, AuthShell, BackToSignIn, authCardClass } from '@/components/AuthShell';
import { LockIcon, MailIcon } from '@/components/icons';
import {
  ErrorAlert,
  btnPrimary,
  btnSecondary,
  fieldClass,
  inputClass,
  labelClass,
} from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not send the reset link. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      {sent ? (
        <div
          className={`${authCardClass} items-center gap-4 text-center`}
          role="status"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <MailIcon size={24} />
          </div>
          <h1 className="text-[22px] font-semibold">Check your email</h1>
          <p className="text-sm leading-normal text-gray-600">
            If an account exists for that email, we&apos;ve sent a link to reset your password.
            The link expires in 30 minutes.
          </p>
          <button type="button" onClick={() => setSent(false)} className={btnSecondary}>
            Didn&apos;t get it? Send again
          </button>
        </div>
      ) : (
        <>
          <AuthHeader
            icon={<LockIcon size={22} />}
            title="Forgot your password?"
            description="Enter your work email and we'll send you a link to reset it."
          />
          <form onSubmit={handleSubmit} className={authCardClass}>
            <div className={fieldClass}>
              <label htmlFor="fp-email" className={labelClass}>
                Email
              </label>
              <input
                id="fp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="name@company.com"
                autoComplete="email"
                required
              />
            </div>

            {error && <ErrorAlert>{error}</ErrorAlert>}

            <button type="submit" disabled={isLoading} className={`${btnPrimary} w-full`}>
              {isLoading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        </>
      )}

      <BackToSignIn />
    </AuthShell>
  );
}
