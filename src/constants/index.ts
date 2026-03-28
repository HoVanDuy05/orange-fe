export const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  DONE: 'done',
  PAID: 'paid',
  CANCELLED: 'cancelled',
};

export const COLORS = {
  PRIMARY: '#228be6',
  SECONDARY: '#15aabf',
  ERROR: '#fa5252',
  BRAND_ORANGE: '#FF6B00',
  BRAND_ORANGE_SOFT: 'rgba(255,107,0,0.08)',
};
