import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboardApi';
import { DashboardStats, TodayOverview, FinancialData, CategoryData } from '@/types/dashboard';
import { CATEGORY_COLORS } from '@/constants/dashboard';

export const useDashboard = () => {
  const [reportType, setReportType] = useState<string>('daily');

  const { data: rawStats, isLoading, refetch, isRefetching } = useQuery<DashboardStats>({
    queryKey: ['stats', reportType],
    queryFn: () => dashboardApi.getRevenueStats(reportType),
  });

  const { data: todayRaw, isLoading: isTodayLoading } = useQuery<TodayOverview>({
    queryKey: ['stats-today'],
    queryFn: () => dashboardApi.getTodayStats(),
    refetchInterval: 30000,
  });

  const stats: DashboardStats = rawStats || { financial: [], topProducts: [], byCategory: [] };
  const today: TodayOverview = todayRaw || {
    today_revenue: 0,
    completed_orders: 0,
    cash_revenue: 0,
    transfer_revenue: 0,
    active_orders: 0,
    cancelled_orders: 0
  };

  const financialData: FinancialData[] = stats.financial || [];
  const topProducts = stats.topProducts || [];

  const categoryData = (stats.byCategory || []).map((c: CategoryData, i: number) => ({
    name: c.category_name,
    value: Number(c.revenue),
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  const totalRev = financialData.reduce((a, d) => a + Number(d.revenue || 0), 0);
  const totalOrders = financialData.reduce((a, d) => a + Number(d.order_count || 0), 0);
  const cashRev = financialData.reduce((a, d) => a + Number(d.cash_revenue || 0), 0);
  const transferRev = financialData.reduce((a, d) => a + Number(d.transfer_revenue || 0), 0);
  const dineInRev = financialData.reduce((a, d) => a + Number(d.dine_in_revenue || 0), 0);
  const takeAwayRev = financialData.reduce((a, d) => a + Number(d.take_away_revenue || 0), 0);
  const deliveryRev = financialData.reduce((a, d) => a + Number(d.delivery_revenue || 0), 0);

  return {
    reportType,
    setReportType,
    stats,
    today,
    isLoading: isLoading || isTodayLoading,
    isRefetching,
    refetch,
    financialData,
    topProducts,
    categoryData,
    summary: {
      totalRev,
      totalOrders,
      cashRev,
      transferRev,
      dineInRev,
      takeAwayRev,
      deliveryRev,
    }
  };
};
