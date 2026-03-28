import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { ordersApi } from '@/api/ordersApi';
import { Order, UpdateOrderStatusParams } from '@/types/orders';

export const useOrders = () => {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // States for modals
  const [payModalOpened, { open: openPayModal, close: closePayModal }] = useDisclosure(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');

  const [cancelModalOpened, { open: openCancelModal, close: closeCancelModal }] = useDisclosure(false);
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const { data: orders = [], isLoading, refetch, isRefetching } = useQuery<Order[]>({
    queryKey: ['orders', filterStatus, filterType],
    queryFn: () => ordersApi.getOrders(filterStatus, filterType),
    refetchInterval: 15000,
  });

  const updateStatus = useMutation({
    mutationFn: (params: UpdateOrderStatusParams) => ordersApi.updateOrderStatus(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      notifications.show({ title: 'Thành công', message: 'Trạng thái đơn hàng đã được cập nhật', color: 'green' });
    },
    onError: (err: any) => {
      notifications.show({ title: 'Lỗi', message: err.response?.data?.message || 'Không thể cập nhật', color: 'red' });
    }
  });

  const handleOpenPayment = (order: Order) => {
    setSelectedOrder(order);
    setPaymentMethod('cash');
    openPayModal();
  };

  const handleConfirmPayment = () => {
    if (!selectedOrder) return;
    updateStatus.mutate(
      { id: selectedOrder.id, status: 'completed', payment_method: paymentMethod },
      { onSuccess: () => closePayModal() }
    );
  };

  return {
    orders,
    isLoading,
    isRefetching,
    refetch,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    payModalOpened,
    closePayModal,
    selectedOrder,
    paymentMethod,
    setPaymentMethod,
    handleOpenPayment,
    handleConfirmPayment,
    cancelModalOpened,
    openCancelModal,
    closeCancelModal,
    cancelOrderId,
    setCancelOrderId,
    cancelReason,
    setCancelReason,
    updateStatus,
  };
};
