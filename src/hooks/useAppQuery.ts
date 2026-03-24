import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import https from '../api/https';
import { ApiQueryType } from '../api/api.type';

import { QueryEndpointMap } from '../api/endpoints';

export function useAppQuery<K extends keyof ApiQueryType>(
  key: K,
  queryParams?: 'queryParams' extends keyof ApiQueryType[K]['url'] ? ApiQueryType[K]['url']['queryParams'] : undefined,
  urlParams?: 'urlParams' extends keyof ApiQueryType[K]['url'] ? ApiQueryType[K]['url']['urlParams'] : undefined,
  options?: Omit<UseQueryOptions<ApiQueryType[K]['response'], Error>, 'queryKey' | 'queryFn'>
) {
  const queryKey: QueryKey = [key, queryParams, urlParams];

  return useQuery({
    queryKey,
    queryFn: async () => {
      let finalUrl: string = QueryEndpointMap[key];
      if (urlParams) {
        Object.entries(urlParams).forEach(([pKey, pVal]) => {
          finalUrl = finalUrl.replace(`:${pKey}`, String(pVal));
        });
      }

      const { data } = await https.get(finalUrl, { params: queryParams });
      return data;
    },
    ...options,
  });
}
