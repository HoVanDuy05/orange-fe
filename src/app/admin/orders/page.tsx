'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import https from '@/api/https';
import {
  Title, Card, Text, Badge, Stack, Group, Button,
  Box, Tabs, Paper, Table, ScrollArea, Modal, Radio, Divider, Textarea
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconShoppingCart, IconEye, IconClock, IconCircleCheck,
  IconChefHat, IconCash, IconCircleX,
  IconToolsKitchen2,
  IconPackage,
  IconBuildingBank,
  IconAlertTriangle
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { SectionLoader } from '@/components/common/GlobalLoading';
import dayjs from 'dayjs';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Chờ xác nhận', color: 'orange', icon: IconClock },
  confirmed: { label: 'Đã xác nhận', color: 'blue', icon: IconCircleCheck },
  preparing: { label: 'Đang chế biến', color: 'violet', icon: IconChefHat },
  done: { label: 'Đã ra món', color: 'cyan', icon: IconPackage },
  paid: { label: 'Đã thanh toán', color: 'green', icon: IconCash },
  cancelled: { label: 'Đã huỷ', color: 'red', icon: IconCircleX },
};

const VND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Payment modal state
  const [payModalOpened, { open: openPayModal, close: closePayModal }] = useDisclosure(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrderAmount, setSelectedOrderAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');

  // Cancel modal state
  const [cancelModalOpened, { open: openCancelModal, close: closeCancelModal }] = useDisclosure(false);
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const { data: rawData, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await https.get('/orders');
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    },
    refetchInterval: 30000,
  });

  const orders: any[] = Array.isArray(rawData) ? rawData : [];

  const updateStatus = useMutation({
    mutationFn: ({ id, status, payment_method, cancel_reason }: { id: number; status: string; payment_method?: string; cancel_reason?: string }) =>
      https.patch(`/orders/${id}/status`, { status, payment_method, cancel_reason }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      const label = STATUS_CONFIG[vars.status]?.label || vars.status;
      notifications.show({ title: '✅ Cập nhật thành công', message: `Đã chuyển sang: ${label}`, color: 'green' });
    }
  });

  const handleOpenPayment = (orderId: number, amount: number) => {
    setSelectedOrderId(orderId);
    setSelectedOrderAmount(amount);
    setPaymentMethod('cash');
    openPayModal();
  };

  const handleConfirmPayment = () => {
    if (!selectedOrderId) return;
    updateStatus.mutate(
      { id: selectedOrderId, status: 'paid', payment_method: paymentMethod },
      {
        onSuccess: () => closePayModal(),
        onError: () => {
          notifications.show({ title: 'Lỗi', message: 'Không thể cập nhật đơn hàng', color: 'red' });
        }
      }
    );
  };

  const handleOpenCancel = (orderId: number) => {
    setCancelOrderId(orderId);
    setCancelReason('');
    openCancelModal();
  };

  const handleConfirmCancel = () => {
    if (!cancelOrderId) return;
    updateStatus.mutate(
      { id: cancelOrderId, status: 'cancelled', cancel_reason: cancelReason || undefined },
      {
        onSuccess: () => {
          closeCancelModal();
          setCancelReason('');
        },
        onError: () => {
          notifications.show({ title: 'Lỗi', message: 'Không thể huỷ đơn hàng', color: 'red' });
        }
      }
    );
  };

  const filteredOrders = filterStatus
    ? orders.filter((o) => o.order_status === filterStatus)
    : orders;

  const pendingCount = orders.filter(o => o.order_status === 'pending').length;

  const todayOrders = orders.filter((o) => dayjs(o.updated_at || o.created_at).isSame(dayjs(), 'day') && o.order_status === 'paid');
  const cashRevenue = todayOrders.filter(o => o.payment_method === 'cash').reduce((sum, o) => sum + Number(o.total_amount), 0);
  const transferRevenue = todayOrders.filter(o => o.payment_method === 'transfer').reduce((sum, o) => sum + Number(o.total_amount), 0);

  if (isLoading) return <SectionLoader />;

  return (
    <Stack gap="xl" p="md">
      {/* Header */}
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
        <Stack gap={4}>
          <Title order={1} className="text-slate-800 text-4xl font-black">Quản lý Đơn hàng</Title>
          <Text size="sm" c="dimmed" fw={500}>Theo dõi và xử lý đơn hàng từ tất cả các bàn • Tự động làm mới mỗi 30 giây</Text>
        </Stack>
        <Group gap="sm">
          <Paper withBorder radius="md" px="lg" py="xs" className="bg-blue-50 border-blue-100">
            <Group gap="xs">
              <IconShoppingCart size={16} className="text-blue-600" />
              <Text fw={800} c="blue">{orders.length} đơn</Text>
            </Group>
          </Paper>
          {pendingCount > 0 && (
            <Paper withBorder radius="md" px="lg" py="xs" className="bg-orange-50 border-orange-200 animate-pulse">
              <Group gap="xs">
                <IconClock size={16} className="text-orange-600" />
                <Text fw={800} c="orange">{pendingCount} chờ xử lý!</Text>
              </Group>
            </Paper>
          )}
        </Group>
      </Group>

      {/* Daily Revenue Summary Cards */}
      <Group grow>
        <Card withBorder radius="md" p="md" className="bg-green-50/50 border-green-100 shadow-sm">
          <Group justify="space-between" align="center">
            <Stack gap={0}>
              <Text fw={800} size="xs" tt="uppercase" c="dimmed" lts="1px">Doanh thu Tiền mặt (Hôm nay)</Text>
              <Text fw={900} size="xl" c="green.8" mt={4}>{VND(cashRevenue)}</Text>
            </Stack>
            <Box className="p-3 bg-green-100 rounded-full">
              <IconCash size={24} className="text-green-600" />
            </Box>
          </Group>
        </Card>

        <Card withBorder radius="md" p="md" className="bg-blue-50/50 border-blue-100 shadow-sm">
          <Group justify="space-between" align="center">
            <Stack gap={0}>
              <Text fw={800} size="xs" tt="uppercase" c="dimmed" lts="1px">Doanh thu Chuyển khoản (Hôm nay)</Text>
              <Text fw={900} size="xl" c="blue.8" mt={4}>{VND(transferRevenue)}</Text>
            </Stack>
            <Box className="p-3 bg-blue-100 rounded-full">
              <IconBuildingBank size={24} className="text-blue-600" />
            </Box>
          </Group>
        </Card>
      </Group>

      {/* Tabs lọc */}
      <Tabs value={filterStatus || 'all'} onChange={(v) => setFilterStatus(v === 'all' ? null : v)}>
        <Tabs.List className="gap-xs">
          <Tabs.Tab value="all" fw={700}>Tất cả ({orders.length})</Tabs.Tab>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = orders.filter(o => o.order_status === key).length;
            if (count === 0 && key !== 'pending') return null;
            return (
              <Tabs.Tab key={key} value={key} leftSection={<cfg.icon size={15} stroke={2} />} fw={600} color={cfg.color}>
                {cfg.label} ({count})
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </Tabs>

      {/* Danh sách đơn hàng dạng Bảng */}
      <Card withBorder shadow="md" radius="md" padding="0" className="overflow-hidden bg-white border-slate-200">
        {filteredOrders.length === 0 ? (
          <Box className="h-48 flex flex-col items-center justify-center bg-slate-50">
            <IconShoppingCart size={40} className="text-slate-300 mb-2" stroke={1.5} />
            <Text c="dimmed" fw={600}>Không có đơn hàng nào phù hợp.</Text>
          </Box>
        ) : (
          <ScrollArea>
            <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead className="bg-slate-50">
                <Table.Tr>
                  <Table.Th ta="center" fw={700} w={100}>Mã Đơn</Table.Th>
                  <Table.Th ta="center" fw={700} w={120}>Bàn</Table.Th>
                  <Table.Th ta="center" fw={700} w={180}>Trạng thái</Table.Th>
                  <Table.Th ta="right" fw={700} w={150}>Tổng tiền</Table.Th>
                  <Table.Th ta="center" fw={700} w={180}>Thời gian</Table.Th>
                  <Table.Th ta="center" fw={700}>Hành động Admin</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredOrders.map((order) => {
                  const cfg = STATUS_CONFIG[order.order_status] || STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  const isPaid = order.order_status === 'paid';
                  const isCancelled = order.order_status === 'cancelled';
                  const isActive = !isPaid && !isCancelled;

                  return (
                    <Table.Tr key={order.id} className={isPaid || isCancelled ? 'opacity-60 bg-slate-50' : ''}>
                      <Table.Td ta="center">
                        <Text fw={800} c="blue">#{order.id}</Text>
                      </Table.Td>
                      <Table.Td ta="center">
                        <Badge size="lg" variant="filled" color="dark" radius="md">
                          {order.table_name || `Bàn ${order.table_id}`}
                        </Badge>
                      </Table.Td>
                      <Table.Td ta="center">
                        <Badge
                          size="md"
                          color={cfg.color}
                          variant="light"
                          leftSection={<StatusIcon size={12} stroke={2} />}
                        >
                          {cfg.label}
                        </Badge>
                        {isPaid && order.payment_method && (
                          <Text size="xs" c="dimmed" mt={2}>
                            {order.payment_method === 'cash' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}
                          </Text>
                        )}
                        {isCancelled && order.cancel_reason && (
                          <Text size="xs" c="red.6" mt={2} lineClamp={1} title={order.cancel_reason}>
                            📋 {order.cancel_reason}
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text fw={800} c={isPaid ? 'green' : 'blue'}>
                          {VND(Number(order.total_amount))}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="center">
                        <Text size="sm" fw={600} c="dark">{dayjs(order.created_at).format('HH:mm')}</Text>
                        <Text size="xs" c="dimmed">{dayjs(order.created_at).format('DD/MM/YYYY')}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="center">
                          {/* Nút Ra món */}
                          {isActive && order.order_status !== 'done' && (
                            <Button
                              size="xs"
                              variant="light"
                              color="violet"
                              leftSection={<IconToolsKitchen2 size={14} stroke={2} />}
                              loading={updateStatus.isPending}
                              onClick={() => updateStatus.mutate({ id: order.id, status: 'done' })}
                            >
                              Ra món
                            </Button>
                          )}

                          {/* Nút Thanh toán - mở modal chọn phương thức */}
                          {isActive && (
                            <Button
                              size="xs"
                              variant="filled"
                              color="green"
                              leftSection={<IconCash size={14} stroke={2} />}
                              onClick={() => handleOpenPayment(order.id, Number(order.total_amount))}
                            >
                              Thanh toán
                            </Button>
                          )}

                          {/* Nút Huỷ - mở modal nhập lý do */}
                          {isActive && (
                            <Button
                              size="xs"
                              variant="light"
                              color="red"
                              leftSection={<IconCircleX size={14} stroke={2} />}
                              onClick={() => handleOpenCancel(order.id)}
                            >
                              Huỷ
                            </Button>
                          )}

                          {/* Nút Xem chi tiết */}
                          <Button
                            variant="subtle"
                            color="blue"
                            size="xs"
                            leftSection={<IconEye size={14} stroke={1.5} />}
                            onClick={() => router.push(`/admin/orders/${order.id}`)}
                          >
                            Chi tiết
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Card>

      {/* ===== Modal chọn phương thức thanh toán ===== */}
      <Modal
        opened={payModalOpened}
        onClose={closePayModal}
        title={
          <Text fw={900} size="lg" c="green.8">
            💳 Xác nhận Thanh toán
          </Text>
        }
        centered
        radius="lg"
        size="sm"
        overlayProps={{ blur: 4, backgroundOpacity: 0.45 }}
      >
        <Stack gap="lg">
          <Card withBorder radius="md" p="md" className="bg-green-50 border-green-200">
            <Group justify="space-between">
              <Text fw={700} c="dimmed">Đơn hàng #{selectedOrderId}</Text>
              <Text fw={900} size="xl" c="green.8">{VND(selectedOrderAmount)}</Text>
            </Group>
          </Card>

          <Divider label="Chọn phương thức thanh toán" labelPosition="center" />

          <Radio.Group value={paymentMethod} onChange={setPaymentMethod}>
            <Stack gap="sm">
              <Radio
                value="cash"
                label={
                  <Group gap="xs">
                    <IconCash size={18} className="text-green-600" />
                    <div>
                      <Text fw={700}>Tiền mặt</Text>
                      <Text size="xs" c="dimmed">Khách trả tiền mặt trực tiếp</Text>
                    </div>
                  </Group>
                }
                styles={{
                  radio: { cursor: 'pointer' },
                  label: {
                    cursor: 'pointer',
                    padding: '12px 16px',
                    border: paymentMethod === 'cash' ? '2px solid #22c55e' : '2px solid #e2e8f0',
                    borderRadius: '10px',
                    background: paymentMethod === 'cash' ? '#f0fdf4' : 'white',
                  }
                }}
              />
              <Radio
                value="transfer"
                label={
                  <Group gap="xs">
                    <IconBuildingBank size={18} className="text-blue-600" />
                    <div>
                      <Text fw={700}>Chuyển khoản</Text>
                      <Text size="xs" c="dimmed">Thanh toán qua ngân hàng / QR</Text>
                    </div>
                  </Group>
                }
                styles={{
                  radio: { cursor: 'pointer' },
                  label: {
                    cursor: 'pointer',
                    padding: '12px 16px',
                    border: paymentMethod === 'transfer' ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                    borderRadius: '10px',
                    background: paymentMethod === 'transfer' ? '#eff6ff' : 'white',
                  }
                }}
              />
            </Stack>
          </Radio.Group>

          <Group grow>
            <Button variant="light" color="gray" onClick={closePayModal} radius="md">
              Huỷ
            </Button>
            <Button
              color="green"
              radius="md"
              loading={updateStatus.isPending}
              onClick={handleConfirmPayment}
              leftSection={<IconCash size={16} />}
            >
              Xác nhận Thanh toán
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ===== Modal nhập lý do huỷ đơn ===== */}
      <Modal
        opened={cancelModalOpened}
        onClose={closeCancelModal}
        title={
          <Group gap="xs">
            <IconAlertTriangle size={20} className="text-red-500" />
            <Text fw={900} size="lg" c="red.7">Huỷ Đơn Hàng #{cancelOrderId}</Text>
          </Group>
        }
        centered
        radius="lg"
        size="sm"
        overlayProps={{ blur: 4, backgroundOpacity: 0.45 }}
      >
        <Stack gap="lg">
          <Card withBorder radius="md" p="md" className="bg-red-50 border-red-200">
            <Text size="sm" c="red.7" fw={600}>
              ⚠️ Hành động này không thể hoàn tác. Đơn hàng sẽ bị huỷ và bàn sẽ được giải phóng.
            </Text>
          </Card>

          <Textarea
            label="Lý do huỷ đơn"
            placeholder="Ví dụ: Khách đổi ý, hết nguyên liệu, nhập nhầm món..."
            value={cancelReason}
            onChange={e => setCancelReason(e.currentTarget.value)}
            radius="md"
            minRows={3}
            autosize
            description="Không bắt buộc nhưng khuyến khích ghi rõ lý do"
          />

          <Group grow>
            <Button variant="light" color="gray" onClick={closeCancelModal} radius="md">
              Quay lại
            </Button>
            <Button
              color="red"
              radius="md"
              loading={updateStatus.isPending}
              onClick={handleConfirmCancel}
              leftSection={<IconCircleX size={16} />}
            >
              Xác nhận Huỷ đơn
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
