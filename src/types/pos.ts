export interface Product {
  id: number;
  product_name: string;
  category_id?: number | string;
  price: number | string;
  discount_price?: number | string;
  image_url?: string;
  description?: string;
  is_available?: boolean;
  category_name?: string;
  sales_count?: number;
}

export interface Category {
  id: number;
  category_name: string;
  description?: string;
}

export interface Table {
  id: number;
  table_name: string;
  table_status: 'available' | 'occupied' | 'reserved';
  capacity?: number;
}

export interface CartItem {
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  image_url?: string;
}

export type OrderType = 'dine-in' | 'take-away';
export type PaymentMethod = 'cash' | 'transfer';

export interface OrderItemPayload {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface OrderPayload {
  table_id: number | null;
  customer_name: string | null;
  customer_phone: string | null;
  note: string | null;
  status: string;
  payment_method: string;
  items: OrderItemPayload[];
}
