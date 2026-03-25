'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import https from '@/api/https';
import { supabase } from '@/lib/supabase';
import {
  Title, Card, Text, Badge, Stack, Group, Button,
  Box, Tabs, Paper, Table, ScrollArea, ActionIcon
} from '@mantine/core';
import {
  IconShoppingCart, IconEye, IconClock, IconCircleCheck,
  IconChefHat, IconCash, IconCircleX,
  IconToolsKitchen2,
  IconPackage,
  IconBuildingBank
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
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      https.patch(`/orders/${id}/status`, { status }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      const label = STATUS_CONFIG[vars.status]?.label || vars.status;
      notifications.show({ title: '✅ Cập nhật thành công', message: `Đã chuyển sang: ${label}`, color: 'green' });
    }
  });

  const filteredOrders = filterStatus
    ? orders.filter((o) => o.order_status === filterStatus)
    : orders;

  const pendingCount = orders.filter(o => o.order_status === 'pending').length;

  const todayOrders = orders.filter((o) => dayjs(o.created_at).isSame(dayjs(), 'day') && o.order_status === 'paid');
  const cashRevenue = todayOrders.filter(o => o.payment_method === 'cash').reduce((sum, o) => sum + Number(o.total_amount), 0);
  const transferRevenue = todayOrders.filter(o => o.payment_method === 'transfer').reduce((sum, o) => sum + Number(o.total_amount), 0);

  if (isLoading) return <SectionLoader />;

  return (
    <Stack gap="xl" p="md">
      {/* Header */}
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
        <Stack gap={4}>
          <Title order={1} className="text-slate-800 text-4xl font-black">Quản lý Đơn hàng</Title>
          <Text size="sm" c="dimmed" fw={500}>Theo dõi và xử lý đơn hàng từ tất cả các bàn • Tự động làm mới mỗi 15 giây</Text>
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
            if (count === 0 && key !== 'pending') return null; // Luôn hiện tab pending nếu có
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
                  <Table.Th ta="center" fw={700} w={160}>Trạng thái</Table.Th>
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
                  const isDone = order.order_status === 'done';
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
                          {/* 2 nút thao tác chính luôn ưu tiên hiển thị */}
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

                          {isActive && (
                            <Button
                              size="xs"
                              variant="filled"
                              color="green"
                              leftSection={<IconCash size={14} stroke={2} />}
                              loading={updateStatus.isPending}
                              onClick={() => updateStatus.mutate({ id: order.id, status: 'paid' })}
                            >
                              Thanh toán
                            </Button>
                          )}

                          {/* Nút Xem chi tiết với text */}
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
    </Stack>
  );
}
