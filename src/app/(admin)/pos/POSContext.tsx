'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import https from '@/api/https';
import { notifications } from '@mantine/notifications';
import { useSearchParams, useRouter, usePathname, useParams } from 'next/navigation';
import { 
  Product, Category, Table, CartItem, 
  OrderType, PaymentMethod, OrderPayload 
} from '@/types/pos';

interface POSContextType {
  state: {
    search: string;
    filterCat: string | null;
    page: number;
    totalPages: number;
    total: number;
    cart: CartItem[];
    cartTotal: number;
    cartCount: number;
    orderType: OrderType;
    tableId: string | null;
    customerName: string;
    customerPhone: string;
    note: string;
    paymentModalOpen: boolean;
    selectedPayment: PaymentMethod;
    categories: Category[];
    catLoading: boolean;
    products: Product[];
    paginatedProducts: Product[];
    prodLoading: boolean;
    tables: Table[];
    tablesLoading: boolean;
    isCreatingOrder: boolean;
    tableOrder: any;
  };
  actions: {
    setSearch: (s: string) => void;
    setFilterCat: (cat: string | null) => void;
    setPage: (p: number) => void;
    setOrderType: (t: OrderType) => void;
    setTableId: (id: string | null) => void;
    setCustomerName: (n: string) => void;
    setCustomerPhone: (p: string) => void;
    setNote: (n: string) => void;
    setPaymentModalOpen: (o: boolean) => void;
    setSelectedPayment: (p: PaymentMethod) => void;
    addToCart: (p: Product) => void;
    updateQty: (id: number, d: number) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    resetStore: () => void;
    handleConfirmOrder: () => void;
    cancelTableOrder: (id: number) => void;
  };
}

const POSContext = createContext<POSContextType | null>(null);

export const POSProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  // Menu filters from URL
  const search = searchParams.get('s') || '';
  const filterCat = searchParams.get('cat') || null;
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = 16;

  // Cart (Persistent across /pos routes)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [tableId, setTableId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [note, setNote] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash');

  // Sync tableId and orderType from URL params if relevant
  useEffect(() => {
    if (params.id) setTableId(params.id as string);
    if (pathname.includes('take-away')) setOrderType('take-away');
    else if (pathname.includes('dine-in')) setOrderType('dine-in');
  }, [params.id, pathname]);

  const setPage = (val: number) => {
    const p = new URLSearchParams(searchParams);
    p.set('page', val.toString());
    router.push(`${pathname}?${p.toString()}`);
  };

  const setSearch = (val: string) => {
    const p = new URLSearchParams(searchParams);
    if (!val) p.delete('s'); else p.set('s', val);
    p.set('page', '1');
    router.push(`${pathname}?${p.toString()}`);
  };

  const setFilterCat = (val: string | null) => {
    const p = new URLSearchParams(searchParams);
    if (!val) p.delete('cat'); else p.set('cat', val);
    p.set('page', '1');
    router.push(`${pathname}?${p.toString()}`);
  };

  const { data: categories = [], isLoading: catLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await https.get('/categories');
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const { data: apiData, isLoading: prodLoading } = useQuery({
    queryKey: ['products', page, search, filterCat],
    queryFn: async () => {
      const p = new URLSearchParams();
      p.set('page', page.toString());
      p.set('limit', pageSize.toString());
      if (search) p.set('search', search);
      if (filterCat) p.set('categoryId', filterCat);
      const res = await https.get(`/products?${p.toString()}`);
      return {
        products: res.data?.products || [],
        pagination: res.data?.pagination || { total: 0, totalPages: 1 }
      };
    },
  });

  const products = apiData?.products || [];
  const total = apiData?.pagination?.total || 0;
  const totalPages = apiData?.pagination?.totalPages || 1;

  const { data: tables = [], isLoading: tablesLoading } = useQuery<Table[]>({
    queryKey: ['tables'],
    queryFn: async () => {
      const res = await https.get('/tables');
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const { data: tableOrder } = useQuery({
    queryKey: ['activeOrder', tableId],
    queryFn: async () => {
      if (!tableId || orderType !== 'dine-in') return null;
      const res = await https.get(`/orders/table/${tableId}`);
      const orders = res.data?.data || [];
      return orders.length > 0 ? orders[0] : null;
    },
    enabled: !!tableId && orderType === 'dine-in',
  });

  useEffect(() => {
    if (tableId && tableOrder) {
      setCart(tableOrder.items.map((i: any) => ({
        product_id: i.product_id, product_name: i.product_name,
        unit_price: Number(i.unit_price), quantity: i.quantity, image_url: i.image_url
      })));
      setCustomerName(tableOrder.customer_name || '');
      setCustomerPhone(tableOrder.customer_phone || '');
      setNote(tableOrder.note || '');
    }
  }, [tableOrder, tableId]);

  const addToCart = (product: Product) => {
    const price = Number(product.discount_price || product.price);
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product_id: product.id, product_name: product.product_name, unit_price: price, quantity: 1, image_url: product.image_url }];
    });
  };

  const updateQty = (id: number, delta: number) => setCart(prev => prev.map(i => i.product_id === id ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0));
  const removeFromCart = (id: number) => setCart(prev => prev.filter(i => i.product_id !== id));
  const clearCart = () => setCart([]);
  const resetStore = () => { clearCart(); setTableId(null); setCustomerName(''); setCustomerPhone(''); setNote(''); };

  const cartTotal = cart.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const createOrder = useMutation({
    mutationFn: (payload: OrderPayload) => https.post('/orders', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      notifications.show({ title: '✅ Thành công', message: 'Đơn hàng đã được ghi nhận.', color: 'green' });
      resetStore();
      router.push('/pos');
    }
  });

  const cancelTableOrder = useMutation({
    mutationFn: (orderId: number) => https.patch(`/orders/${orderId}/status`, { status: 'cancelled', cancel_reason: 'Hủy từ POS' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      notifications.show({ title: 'Đã hủy bàn', message: 'Đơn hàng hiện tại đã được hủy.', color: 'gray' });
      resetStore();
      router.push('/pos/dine-in');
    }
  });

  const handleConfirmOrder = () => {
    const payload: OrderPayload = {
      order_type: orderType === 'dine-in' ? 'dine_in' : 'take_away',
      table_id: orderType === 'dine-in' ? (tableId ? Number(tableId) : null) : null,
      customer_name: customerName || null, customer_phone: customerPhone || null, note: note || null,
      status: orderType === 'dine-in' ? 'confirmed' : 'paid',
      payment_method: selectedPayment,
      items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price })),
    };
    createOrder.mutate(payload);
  };

  const value = {
    state: {
      search, filterCat, page, totalPages, total, cart, cartTotal, cartCount,
      orderType, tableId, customerName, customerPhone, note, paymentModalOpen, selectedPayment,
      categories, catLoading, products, paginatedProducts: products, prodLoading, tables, tablesLoading,
      isCreatingOrder: createOrder.isPending, tableOrder
    },
    actions: {
      setSearch, setFilterCat, setPage, setOrderType, setTableId, setCustomerName, setCustomerPhone, setNote,
      setPaymentModalOpen, setSelectedPayment, addToCart, updateQty, removeFromCart, clearCart, resetStore,
      handleConfirmOrder, cancelTableOrder: cancelTableOrder.mutate
    }
  };

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};

export const usePosContext = () => {
  const context = useContext(POSContext);
  if (!context) throw new Error('usePosContext must be used within POSProvider');
  return context;
};
