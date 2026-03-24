import { useMutation, useQueryClient } from '@tanstack/react-query';
import https from './https';

export const useAppMutation = (url: string, method: 'post' | 'put' | 'patch' | 'delete' = 'post', invalidateKey?: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await https[method](url, data);
      return response.data;
    },
    onSuccess: () => {
      if (invalidateKey) {
        queryClient.invalidateQueries({ queryKey: [invalidateKey] });
      }
    },
  });
};
