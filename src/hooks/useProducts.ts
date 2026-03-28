import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import https from '@/api/https';
import { notifications } from '@mantine/notifications';
import { Product, Category } from '@/types/pos';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useMemo } from 'react';

export function useProducts() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL State management
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('s') || '';
  const filterCat = searchParams.get('cat') || null;
  const pageSize = 10;

  const setPage = (val: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', val.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const setSearch = (val: string) => {
    const params = new URLSearchParams(searchParams);
    if (!val) params.delete('s'); else params.set('s', val);
    params.set('page', '1'); // Reset pagination on search
    router.push(`${pathname}?${params.toString()}`);
  };

  const setFilterCat = (val: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (!val) params.delete('cat'); else params.set('cat', val);
    params.set('page', '1'); // Reset pagination on filter
    router.push(`${pathname}?${params.toString()}`);
  };

  const { data: categories = [], isLoading: catLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await https.get('/categories');
      return res.data?.data || res.data || [];
    }
  });

  const { data: apiData, isLoading: prodLoading, refetch, isRefetching } = useQuery<{ products: Product[], pagination: any }>({
    queryKey: ['products', page, search, filterCat],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      if (search) params.set('search', search);
      if (filterCat) params.set('categoryId', filterCat);
      
      const res = await https.get(`/products?${params.toString()}`);
      return {
        products: res.data?.products || [],
        pagination: res.data?.pagination || { total: 0, totalPages: 1 }
      };
    }
  });

  const products = apiData?.products || [];
  const total = apiData?.pagination?.total || 0;
  const totalPages = apiData?.pagination?.totalPages || 1;
  const paginatedProducts = products;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => https.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      notifications.show({ title: 'Đã xoá', message: 'Món ăn đã được gỡ khỏi menu', color: 'orange' });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      notifications.show({ title: 'Lỗi', message: error.response?.data?.message || 'Không thể xóa món ăn', color: 'red' });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, payload }: { id?: number, payload: Partial<Product> }) => {
      if (id) return https.put(`/products/${id}`, payload);
      return https.post('/products', payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      notifications.show({ 
        title: 'Thành công', 
        message: variables.id ? 'Đã cập nhật món ăn' : 'Đã thêm món mới', 
        color: 'green' 
      });
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      notifications.show({ 
        title: 'Lỗi', 
        message: error.response?.data?.message || 'Có lỗi xảy ra khi lưu', 
        color: 'red' 
      });
    }
  });

  return {
    state: {
      categories,
      products: paginatedProducts,
      total,
      page,
      totalPages,
      pageSize,
      search,
      filterCat,
      isLoading: catLoading || prodLoading,
      isRefetching,
      isSaving: saveMutation.isPending,
      isDeleting: deleteMutation.isPending
    },
    actions: {
      refetch,
      setPage,
      setSearch,
      setFilterCat,
      deleteProduct: deleteMutation.mutate,
      saveProduct: saveMutation.mutate
    }
  };
}
