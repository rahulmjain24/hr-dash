'use client';

import { useState } from 'react';
import { isAxiosError } from 'axios';
import { api } from '@/lib/api';

const ROLES = [
  { value: 'MEMBER', label: 'Member' },
  { value: 'ADMIN', label: 'Admin' },
] as const;

type UserRole = (typeof ROLES)[number]['value'];

const inputClass =
  'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-900 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all';

export default function CreateUserPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('MEMBER');
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
      const response = await api.post('/user/create', {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      setSuccess(`User ${response.data.user.email} created as ${response.data.user.role}.`);
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('MEMBER');
    } catch (err) {
      const apiError = isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(
        (Array.isArray(apiError) ? apiError[0] : apiError) || 'Failed to create user',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-1">Create User</h1>
      <p className="text-sm text-gray-600 mb-6">
        Add a new user to the HR portal. Only admins can create users.
      </p>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {error && (
          <div
            role="alert"
            className="mb-6 p-4 bg-red-50/50 border-l-4 border-red-500 text-red-700 rounded-r-md text-sm font-medium"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 p-4 bg-green-50/50 border-l-4 border-green-500 text-green-700 rounded-r-md text-sm font-medium"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="name@company.com"
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="role" className="block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className={inputClass}
              required
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-slate-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
              placeholder="Repeat password"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 mt-2 bg-blue-600 text-white rounded-lg font-medium shadow-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-600/20 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating user...' : 'Create user'}
          </button>
        </form>
      </div>
    </div>
  );
}
