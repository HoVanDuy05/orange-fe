export interface Order {
  id: number;
  order_type: 'dine_in' | 'take_away' | 'delivery';
  customer_name: string | null;
  customer_phone: string | null;
  table_name: string | null;
  total_amount: number;
  payment_method: 'cash' | 'transfer';
  order_status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'served' | 'completed' | 'cancelled';
  created_at: string;
}

export interface UpdateOrderStatusParams {
  id: number;
  status: Order['order_status'];
  payment_method?: string;
  cancel_reason?: string;
}
