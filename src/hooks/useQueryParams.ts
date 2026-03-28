import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * A custom hook to manage query parameters in the URL with type safety.
 * This ensures that filters, search, and pagination are always synced with the URL.
 */
export function useQueryParams<T extends Record<string, string | number | null | undefined>>() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getQueryParam = useCallback(
    (key: keyof T, defaultValue?: string): string | undefined => {
      return searchParams.get(key as string) || defaultValue;
    },
    [searchParams]
  );

  const setQueryParams = useCallback(
    (params: Partial<T>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          current.delete(key);
        } else {
          current.set(key, String(value));
        }
      });

      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.push(`${pathname}${query}`);
    },
    [router, pathname, searchParams]
  );

  return { getQueryParam, setQueryParams, searchParams };
}
