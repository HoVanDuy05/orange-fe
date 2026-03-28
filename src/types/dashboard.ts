export interface FinancialData {
  time_label: string;
  revenue: number;
  order_count: number;
  cash_revenue: number;
  transfer_revenue: number;
  dine_in_revenue: number;
  take_away_revenue: number;
  delivery_revenue: number;
}

export interface CategoryData {
  category_name: string;
  revenue: number | string;
}

export interface TopProduct {
  product_name: string;
  total_sold: number | string;
}

export interface DashboardStats {
  financial: FinancialData[];
  topProducts: TopProduct[];
  byCategory: CategoryData[];
}

export interface TodayOverview {
  today_revenue: number;
  completed_orders: number;
  cash_revenue: number;
  transfer_revenue: number;
  active_orders: number;
  cancelled_orders: number;
}
