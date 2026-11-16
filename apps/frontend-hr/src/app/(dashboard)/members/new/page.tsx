'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, getErrorMessage } from '@/lib/api';
import type { UserRole } from '@/lib/types';
import {
  Breadcrumb,
  ErrorAlert,
  Required,
  btnPrimary,
  btnSecondary,
  cardClass,
  cardFooterClass,
  fieldClass,
  fieldGridClass,
  hintClass,
  inputClass,
  labelClass,
} from '@/components/ui';

const ROLES: { value: UserRole; label: string; description: string }[] = [
  {
    value: 'MEMBER',
    label: 'Member',
    description: 'Can view applications and job listings and update application statuses.',
  },
  {
    value: 'ADMIN',
    label: 'Admin',
    description: 'Full access, including managing job listings and members.',
  },
];

export default function CreateMemberPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('MEMBER');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      await api.post('/user/create', {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      router.push('/members');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create member'));
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Breadcrumb parentHref="/members" parentLabel="Members" current="Create member" />
        <h1 className="text-2xl font-semibold tracking-[-0.01em]">Create member</h1>
        <p className="text-sm text-gray-600">Give a colleague access to the HR Portal.</p>
      </div>

      <form onSubmit={handleSubmit} className={`${cardClass} flex flex-col`}>
        <div className="flex flex-col gap-5 p-6">
          <div className={fieldGridClass}>
            <div className={fieldClass}>
              <label htmlFor="m-name" className={labelClass}>
                Full name <Required />
              </label>
              <input
                id="m-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="e.g. Karan Mehta"
                autoComplete="off"
                required
              />
            </div>
            <div className={fieldClass}>
              <label htmlFor="m-email" className={labelClass}>
                Email <Required />
              </label>
              <input
                id="m-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="name@company.com"
                autoComplete="off"
                required
              />
            </div>
          </div>
          <p className={hintClass}>The email must be unique. The member signs in with it.</p>

          <div className={fieldGridClass}>
            <div className={fieldClass}>
              <label htmlFor="m-pass" className={labelClass}>
                Password <Required />
              </label>
              <input
                id="m-pass"
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
              <label htmlFor="m-pass2" className={labelClass}>
                Confirm password <Required />
              </label>
              <input
                id="m-pass2"
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

          <fieldset className="m-0 flex flex-col border-0 p-0">
            <legend className={`mb-2.5 p-0 ${labelClass}`}>
              Role <Required />
            </legend>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3">
              {ROLES.map((option) => {
                const selected = role === option.value;
                return (
                  <label
                    key={option.value}
                    htmlFor={`role-${option.value}`}
                    className={`flex cursor-pointer items-start gap-3 rounded-[10px] ${
                      selected
                        ? 'border-2 border-blue-600 bg-blue-50 p-4'
                        : 'border border-gray-300 bg-white p-[17px]'
                    }`}
                  >
                    <input
                      id={`role-${option.value}`}
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={selected}
                      onChange={() => setRole(option.value)}
                      className="mt-0.5 h-[18px] w-[18px] flex-none accent-blue-600"
                    />
                    <span className="flex flex-col gap-1">
                      <span className="text-sm font-semibold">{option.label}</span>
                      <span className="text-[13px] text-gray-600">{option.description}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {error && <ErrorAlert>{error}</ErrorAlert>}
        </div>

        <div className={cardFooterClass}>
          <Link href="/members" className={btnSecondary}>
            Cancel
          </Link>
          <button type="submit" disabled={isLoading} className={btnPrimary}>
            {isLoading ? 'Creating member...' : 'Create member'}
          </button>
        </div>
      </form>
    </div>
  );
}
