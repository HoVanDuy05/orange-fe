import https from '@/api/https';
import { DashboardStats, TodayOverview } from '@/types/dashboard';

export const dashboardApi = {
  getRevenueStats: async (type: string): Promise<DashboardStats> => {
    const { data } = await https.get<DashboardStats>(`/stats/revenue?type=${type}`);
    return data;
  },
  getTodayStats: async (): Promise<TodayOverview> => {
    const { data } = await https.get<TodayOverview>('/stats/today');
    return data;
  }
};
