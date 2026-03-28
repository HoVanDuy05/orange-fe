import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import https from '@/api/https';
import { notifications } from '@mantine/notifications';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { 
  Product, Category, Table, CartItem, 
  OrderType, PaymentMethod, OrderPayload 
} from '@/types/pos';

export function usePOS() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Menu filters from URL
  const search = searchParams.get('s') || '';
  const filterCat = searchParams.get('cat') || null;
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = 16; // Optimized for grid

  const setPage = (val: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', val.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const setSearch = (val: string) => {
    const params = new URLSearchParams(searchParams);
    if (!val) params.delete('s'); else params.set('s', val);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const setFilterCat = (val: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (!val) params.delete('cat'); else params.set('cat', val);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  // Workflow state
  const [step, setStep] = useState<'start' | 'table-grid' | 'ordering'>('start');

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Order info
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [tableId, setTableId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [note, setNote] = useState('');

  // Payment UI
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash');

  // Reset helper
  const resetStore = () => {
    setStep('start');
    setCart([]);
    setTableId(null);
    setOrderType('dine-in');
    setCustomerName('');
    setCustomerPhone('');
    setNote('');
  };

  // Fetching categories
  const { data: categories = [], isLoading: catLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await https.get('/categories');
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  // Fetching products
  const { data: apiData, isLoading: prodLoading } = useQuery<{ products: Product[], pagination: any }>({
    queryKey: ['products', page, search, filterCat],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', pageSize.toString());
      if (search) params.set('search', search);
      if (filterCat) params.set('categoryId', filterCat);
      
      const res = await https.get(`/products?${params.toString()}`);
      return {
        products: res.data?.products || [],
        pagination: res.data?.pagination || { total: 0, totalPages: 1 }
      };
    },
  });

  const products = apiData?.products || [];
  const total = apiData?.pagination?.total || 0;
  const totalPages = apiData?.pagination?.totalPages || 1;
  const paginatedProducts = products;
  const filteredProducts = products;

  // Fetching tables
  const { data: tables = [], isLoading: tablesLoading } = useQuery<Table[]>({
    queryKey: ['tables'],
    queryFn: async () => {
      const res = await https.get('/tables');
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  // 🔄 Automatic Order Loading Logic
  const { data: tableOrder, isFetching: loadingTableOrder } = useQuery({
    queryKey: ['activeOrder', tableId],
    queryFn: async () => {
      if (!tableId || orderType !== 'dine-in') return null;
      const res = await https.get(`/orders/table/${tableId}`);
      const orders = res.data?.data || [];
      return orders.length > 0 ? orders[0] : null;
    },
    enabled: !!tableId && orderType === 'dine-in',
    staleTime: 0, // Always get fresh data when switching tables
  });

  useEffect(() => {
    if (tableId && tableOrder) {
      setCart(tableOrder.items.map((i: any) => ({
        product_id: i.product_id,
        product_name: i.product_name,
        unit_price: Number(i.unit_price),
        quantity: i.quantity,
        image_url: i.image_url
      })));
      setCustomerName(tableOrder.customer_name || '');
      setCustomerPhone(tableOrder.customer_phone || '');
      setNote(tableOrder.note || '');
    } else if (tableId) {
      // If table is empty, start fresh. 
      // NOTE: We only clear if switching TO an empty table.
      clearCart();
    }
  }, [tableOrder, tableId]);

  // Cart helpers
  const addToCart = (product: Product) => {
    const unitPrice = Number(product.discount_price || product.price);
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        product_id: product.id,
        product_name: product.product_name,
        unit_price: unitPrice,
        quantity: 1,
        image_url: product.image_url,
      }];
    });
  };

  const updateQty = (productId: number, delta: number) => {
    setCart(prev => prev
      .map(i => i.product_id === productId ? { ...i, quantity: i.quantity + delta } : i)
      .filter(i => i.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(i => i.product_id !== productId));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Create Order mutation
  const createOrder = useMutation({
    mutationFn: (payload: OrderPayload) => https.post('/orders', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      notifications.show({
        title: '✅ Đặt hàng thành công!',
        message: 'Đơn hàng đã được tạo và lưu trữ trên hệ thống.',
        color: 'green',
      });
      clearCart();
      setTableId(null);
      setOrderType('dine-in');
      setCustomerName('');
      setCustomerPhone('');
      setNote('');
      setPaymentModalOpen(false);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      notifications.show({
        title: 'Lỗi',
        message: err.response?.data?.message || 'Không thể tạo đơn hàng.',
        color: 'red',
      });
    },
  });

  const cancelTableOrder = useMutation({
    mutationFn: (orderId: number) => https.patch(`/orders/${orderId}/status`, { status: 'cancelled', cancel_reason: 'Hủy từ POS' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      notifications.show({ title: 'Đã hủy bàn', message: 'Đơn hàng hiện tại của bàn đã được hủy.', color: 'gray' });
      resetStore();
    }
  });

  const handleConfirmOrder = () => {
    const payload: OrderPayload = {
      order_type: orderType === 'dine-in' ? 'dine_in' : 'take_away',
      table_id: orderType === 'dine-in' ? (tableId ? Number(tableId) : null) : null,
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      note: note || null,
      status: orderType === 'dine-in' ? 'confirmed' : 'paid',
      payment_method: selectedPayment,
      items: cart.map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
      })),
    };
    createOrder.mutate(payload);
  };

  return {
    state: {
      step,
      search, setSearch,
      filterCat, setFilterCat,
      page, totalPages, total,
      cart, cartTotal, cartCount,
      orderType, setOrderType,
      tableId, setTableId,
      customerName, setCustomerName,
      customerPhone, setCustomerPhone,
      note, setNote,
      paymentModalOpen, setPaymentModalOpen,
      selectedPayment, setSelectedPayment,
      categories, catLoading,
      products, prodLoading,
      paginatedProducts,
      tables, tablesLoading,
      filteredProducts,
      isCreatingOrder: createOrder.isPending,
      tableOrder
    },
    actions: {
      setStep,
      resetStore,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      handleConfirmOrder,
      cancelTableOrder: cancelTableOrder.mutate,
      setPage
    }
  };
}
