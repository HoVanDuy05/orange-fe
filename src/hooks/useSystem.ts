import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { systemApi } from '@/api/systemApi';
import { Branch, Employee, BrandTheme } from '@/types/system';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export const useSystem = () => {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Tab from URL
  const activeTab = searchParams.get('tab') || 'employees';

  const setActiveTab = (val: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (!val || val === 'employees') params.delete('tab'); else params.set('tab', val);
    router.push(`${pathname}?${params.toString()}`);
  };

  // --- QUERIES ---
  const { data: branches = [], isFetching: isFetchingBranches } = useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: systemApi.getBranches,
  });

  const { data: employees = [], isFetching: isFetchingEmployees } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: systemApi.getEmployees,
  });

  const { data: themes = [], isFetching: isFetchingThemes } = useQuery<BrandTheme[]>({
    queryKey: ['themes'],
    queryFn: systemApi.getBrandThemes,
  });

  const isLoading = isFetchingBranches || isFetchingEmployees || isFetchingThemes;

  // --- MUTATIONS: Branches ---
  const createBranchMut = useMutation({
    mutationFn: systemApi.createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      notifications.show({ title: 'Thành công', message: 'Đã tạo chi nhánh mới', color: 'green' });
    }
  });

  const updateBranchMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Branch> }) => systemApi.updateBranch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      notifications.show({ title: 'Thành công', message: 'Đã cập nhật chi nhánh', color: 'green' });
    }
  });

  const deleteBranchMut = useMutation({
    mutationFn: systemApi.deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      notifications.show({ title: 'Thành công', message: 'Đã xoá chi nhánh', color: 'green' });
    }
  });

  // --- MUTATIONS: Employees ---
  const createEmployeeMut = useMutation({
    mutationFn: systemApi.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      notifications.show({ title: 'Thành công', message: 'Đã tạo nhân viên mới', color: 'green' });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      notifications.show({ title: 'Lỗi', message: err.response?.data?.message || 'Có lỗi xảy ra', color: 'red' });
    }
  });

  const updateEmployeeMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Employee & { password?: string }> }) => systemApi.updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      notifications.show({ title: 'Thành công', message: 'Đã cập nhật nhân viên', color: 'green' });
    }
  });

  const deleteEmployeeMut = useMutation({
    mutationFn: systemApi.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      notifications.show({ title: 'Thành công', message: 'Đã xoá nhân viên', color: 'green' });
    }
  });

  // --- MUTATIONS: Themes ---
  const updateThemeMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BrandTheme> }) => systemApi.updateBrandTheme(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      notifications.show({ title: 'Thành công', message: 'Cập nhật giao diện thành công', color: 'green' });
    }
  });

  return {
    state: {
      activeTab,
      branches,
      employees,
      themes,
      isLoading
    },
    actions: {
      setActiveTab,
      createBranch: createBranchMut.mutate,
      updateBranch: updateBranchMut.mutate,
      deleteBranch: deleteBranchMut.mutate,
      createEmployee: createEmployeeMut.mutate,
      updateEmployee: updateEmployeeMut.mutate,
      deleteEmployee: deleteEmployeeMut.mutate,
      updateTheme: updateThemeMut.mutate,
    }
  };
};
