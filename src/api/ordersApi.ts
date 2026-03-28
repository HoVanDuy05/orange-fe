import https from '@/api/https';
import { Order, UpdateOrderStatusParams } from '@/types/orders';

export const ordersApi = {
  getOrders: async (filterStatus: string | null, filterType: string | null): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filterStatus) params.append('status', filterStatus);
    if (filterType) params.append('type', filterType);
    const res = await https.get(`/orders?${params.toString()}`);
    return res.data?.data || [];
  },

  updateOrderStatus: async ({ id, status, payment_method, cancel_reason }: UpdateOrderStatusParams): Promise<void> => {
    await https.patch(`/orders/${id}/status`, { status, payment_method, cancel_reason });
  }
};
