'use client';

import { useEffect, useState } from 'react';
import { api, getErrorMessage } from './api';

interface FetchState<T> {
  data: T | null;
  error: string;
  loading: boolean;
}

export function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ data: null, error: '', loading: true });

  useEffect(() => {
    let cancelled = false;

    api
      .get<T>(url)
      .then((res) => {
        if (!cancelled) setState({ data: res.data, error: '', loading: false });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ data: null, error: getErrorMessage(err, 'Failed to load data'), loading: false });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return state;
}
