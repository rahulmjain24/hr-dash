'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api, getErrorMessage } from '@/lib/api';
import { AuthHeader, AuthShell, authCardClass } from '@/components/AuthShell';
import { UsersIcon } from '@/components/icons';
import { ErrorAlert, btnPrimary, fieldClass, inputClass, labelClass } from '@/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/login', { email, password });
      window.location.replace('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email or password. Please try again.'));
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <AuthHeader
        icon={<UsersIcon size={24} />}
        iconTone="solid"
        title="Sign in to HR Portal"
        description="Use your work email and password"
      />

      <form onSubmit={handleLogin} className={authCardClass}>
        <div className={fieldClass}>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="name@company.com"
            autoComplete="email"
            required
          />
        </div>

        <div className={fieldClass}>
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[13px] font-medium text-blue-700 hover:text-blue-800"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </div>

        {error && <ErrorAlert>{error}</ErrorAlert>}

        <button type="submit" disabled={isLoading} className={`${btnPrimary} w-full`}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-[13px] text-gray-500">
        Access is managed by your HR administrator.
      </p>
    </AuthShell>
  );
}
