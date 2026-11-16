'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { LogOutIcon } from '@/components/icons';

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    setError('');
    setIsLoading(true);

    try {
      await api.get('/auth/logout');
      // Full reload so the middleware re-evaluates the cleared auth cookie.
      window.location.replace('/login');
    } catch {
      setError('Sign out failed. Try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex-none">
      {error && (
        <p
          role="alert"
          className="absolute bottom-full right-0 mb-1 whitespace-nowrap rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700"
        >
          {error}
        </p>
      )}
      <button
        type="button"
        aria-label="Sign out"
        title="Sign out"
        onClick={handleLogout}
        disabled={isLoading}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <LogOutIcon />
      </button>
    </div>
  );
}
