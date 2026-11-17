import type { JobListing } from './types';

// Every request here is made from the server. INTERNAL_API_URL lets it reach the backend on a
// different address than the browser would, e.g. http://backend:3000 inside Docker.
export const API_URL =
  process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function get<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store' });
  // 400 is a malformed id in the URL, which is as good as "no such listing".
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error(`GET ${path} failed with status ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getOpenJobs(): Promise<JobListing[]> {
  return (await get<JobListing[]>('/public/job-listings')) ?? [];
}

/** Resolves to null when the listing doesn't exist or is no longer open. */
export function getOpenJob(id: string): Promise<JobListing | null> {
  return get<JobListing>(`/public/job-listings/${encodeURIComponent(id)}`);
}
