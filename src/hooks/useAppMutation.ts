import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import https from '../api/https';
import { ApiMutationType } from '../api/api.type';

export function useAppMutation<K extends keyof ApiMutationType>(
  key: K,
  options?: Omit<UseMutationOptions<ApiMutationType[K]['response'], Error, ApiMutationType[K]['body']>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: async (body: ApiMutationType[K]['body']) => {
      // In a real scenario, we'd map key to URL and method (POST, PATCH, etc.)
      // For now, assume a mapping exists or use a more comprehensive type
      let url = key as string; // Placeholder for simplified demo
      const { data } = await https.post(`/api/${url}`, body);
      return data;
    },
    ...options,
  });
}
