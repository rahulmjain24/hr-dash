'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

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
      setError('Logout failed. Try again.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <p role="alert" className="mb-2 text-sm text-red-400">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
        className="w-full p-2 text-left rounded hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}
