import https from '@/api/https';
import { Branch, Employee, BrandTheme } from '@/types/system';

export const systemApi = {
  // Branches
  getBranches: async (): Promise<Branch[]> => {
    const { data } = await https.get<Branch[]>('/branches');
    return data;
  },
  createBranch: async (branch: Partial<Branch>) => await https.post('/branches', branch),
  updateBranch: async (id: number, branch: Partial<Branch>) => await https.put(`/branches/${id}`, branch),
  deleteBranch: async (id: number) => await https.delete(`/branches/${id}`),

  // Employees
  getEmployees: async (): Promise<Employee[]> => {
    const { data } = await https.get<Employee[]>('/employees');
    return data;
  },
  createEmployee: async (employee: Partial<Employee & { password?: string }>) => await https.post('/employees', employee),
  updateEmployee: async (id: number, employee: Partial<Employee & { password?: string }>) => await https.put(`/employees/${id}`, employee),
  deleteEmployee: async (id: number) => await https.delete(`/employees/${id}`),

  // Brands / Themes
  getBrandThemes: async (): Promise<BrandTheme[]> => {
    const { data } = await https.get<{ success: boolean; data: BrandTheme[] }>('/system/brands');
    return data.data || [];
  },
  updateBrandTheme: async (id: number, theme: Partial<BrandTheme>) => {
    await https.put(`/system/brands/${id}`, theme);
  }
};
