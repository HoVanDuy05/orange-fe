'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import https from '@/api/https';
import {
  Title, Card, Text, Badge, Stack, Group, Button, SimpleGrid,
  Box, Divider, Paper, Table, ScrollArea, ActionIcon, ThemeIcon, Timeline
} from '@mantine/core';
import {
  IconArrowLeft, IconTrash, IconClock, IconCircleCheck, 
  IconChefHat, IconPackage, IconCash, IconCircleX, 
  IconShoppingCart, IconMapPin, IconCalendar, IconNote,
  IconToolsKitchen2, IconHistory, IconUser, IconPhone
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { SectionLoader } from '@/components/common/GlobalLoading';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending:   { label: 'Chờ xác nhận', color: 'orange',  icon: IconClock },
  confirmed: { label: 'Đã xác nhận',  color: 'blue',    icon: IconCircleCheck },
  preparing: { label: 'Đang chế biến', color: 'violet', icon: IconChefHat },
  done:      { label: 'Đã ra món',    color: 'cyan',    icon: IconPackage },
  paid:      { label: 'Đã thanh toán', color: 'green',  icon: IconCash },
  cancelled: { label: 'Đã huỷ',       color: 'red',     icon: IconCircleX },
};

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'done', 'paid'];

const VND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: async () => {
      const res = await https.get(`/orders/${id}`);
      return res.data?.data || res.data;
    },
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status, payment_method }: { status: string; payment_method?: string }) => 
      https.patch(`/orders/${id}/status`, { status, payment_method }),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      notifications.show({ 
        title: 'Cập nhật thành công', 
        message: `Đã chuyển sang: ${STATUS_CONFIG[status]?.label || status}`, 
        color: 'green' 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => https.delete(`/orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      notifications.show({ title: 'Đã xoá', message: 'Đơn hàng đã bị gỡ bỏ', color: 'orange' });
      router.push('/admin/orders');
    }
  });

  const getNextStatus = (current: string) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  if (isLoading) return <SectionLoader />;
  if (!order) return (
    <Stack p="xl" align="center">
      <Text c="dimmed">Không tìm thấy đơn hàng.</Text>
      <Button onClick={() => router.back()} leftSection={<IconArrowLeft size={16} />}>Quay lại</Button>
    </Stack>
  );

  const cfg = STATUS_CONFIG[order.order_status] || STATUS_CONFIG.pending;
  const nextStatus = getNextStatus(order.order_status);
  const nextCfg = nextStatus ? STATUS_CONFIG[nextStatus] : null;
  const StatusIcon = cfg.icon;

  return (
    <Stack gap="xl" p="md">
      {/* Header */}
      <Group justify="space-between" align="center">
        <Group gap="md">
          <ActionIcon 
            variant="light" 
            color="blue" 
            size="xl" 
            radius="md"
            onClick={() => router.push('/admin/orders')}
          >
            <IconArrowLeft size={22} />
          </ActionIcon>
          <Stack gap={2}>
            <Text size="xs" c="dimmed" fw={700} tt="uppercase">Mã đơn #{order.id}</Text>
            <Title order={1} className="text-slate-800 text-3xl font-black">
              Chi tiết Đơn hàng
            </Title>
          </Stack>
        </Group>
        <Badge size="xl" color={cfg.color} variant="filled" leftSection={<StatusIcon size={16} stroke={2.5} />} radius="md">
          {cfg.label}
        </Badge>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
        {/* === LEFT: ORDER DETAILS === */}
        <Box style={{ gridColumn: 'span 2' }}>
          <Stack gap="lg">
            {/* Customer Information */}
            <Paper p="lg" withBorder radius="md" className="bg-white border-slate-200 shadow-sm relative overflow-hidden">
               <Box className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full -mr-10 -mt-10 blur-xl" />
               <Group justify="space-between" align="center">
                 <Group gap="md">
                   <ThemeIcon size={48} radius="xl" color="blue" variant="light">
                     <IconUser size={24} />
                   </ThemeIcon>
                   <Stack gap={0}>
                     <Text size="xs" fw={700} c="dimmed" tt="uppercase">Khách hàng</Text>
                     <Title order={3} fw={900} c="blue.8">{order.customer_name || 'Khách vãng lai'}</Title>
                   </Stack>
                 </Group>
                 <Group gap="md">
                   <ThemeIcon size={40} radius="xl" color="green" variant="light">
                     <IconPhone size={20} />
                   </ThemeIcon>
                   <Stack gap={0}>
                     <Text size="xs" fw={700} c="dimmed" tt="uppercase">Số điện thoại</Text>
                     <Text fw={800} size="md" c="green.8">{order.customer_phone || '---'}</Text>
                   </Stack>
                 </Group>
               </Group>
             </Paper>

            {/* Quick Summary */}
            <SimpleGrid cols={3} spacing="md">
              <Paper p="lg" withBorder radius="md" className="bg-blue-50/50 border-blue-100 text-center">
                <ThemeIcon color="blue" size="xl" radius="md" mx="auto" mb="xs" variant="light">
                  <IconMapPin size={22} />
                </ThemeIcon>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">Bàn số</Text>
                <Text size="2xl" fw={900} c="blue" mt={4}>{order.table_name || `Bàn ${order.table_id}`}</Text>
              </Paper>
              <Paper p="lg" withBorder radius="md" className="bg-green-50/50 border-green-100 text-center">
                <ThemeIcon color="green" size="xl" radius="md" mx="auto" mb="xs" variant="light">
                  <IconCash size={22} />
                </ThemeIcon>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">Tổng cộng</Text>
                <Text size="xl" fw={900} c="green" mt={4}>
                  {VND(Number(order.total_amount))}
                </Text>
              </Paper>
              <Paper p="lg" withBorder radius="md" className="text-center bg-slate-50/50">
                <ThemeIcon color="gray" size="xl" radius="md" mx="auto" mb="xs" variant="light">
                  <IconCalendar size={22} />
                </ThemeIcon>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">Thời điểm đặt</Text>
                <Text size="md" fw={700} mt={4}>{dayjs(order.created_at).format('HH:mm')}</Text>
                <Text size="xs" c="dimmed">{dayjs(order.created_at).format('DD/MM/YYYY')}</Text>
              </Paper>
            </SimpleGrid>

            {/* Note */}
            {order.note && (
              <Paper p="md" withBorder radius="md" className="bg-yellow-50 border-yellow-200">
                <Group gap="xs" mb="xs">
                  <IconNote size={18} className="text-yellow-600" />
                  <Text size="sm" fw={800} c="yellow.9">Ghi chú từ khách</Text>
                </Group>
                <Text size="sm" className="italic text-slate-700">"{order.note}"</Text>
              </Paper>
            )}

            {/* Item List */}
            <Card withBorder radius="md" padding="0" className="overflow-hidden border-slate-200 shadow-sm">
              <Box p="md" className="bg-slate-50 border-b border-slate-200">
                <Group gap="xs">
                  <IconShoppingCart size={20} className="text-blue-600" stroke={2} />
                  <Text fw={900} size="md">Các món đã gọi</Text>
                </Group>
              </Box>
              <Table verticalSpacing="md" horizontalSpacing="xl" highlightOnHover>
                <Table.Thead className="bg-slate-50/50">
                  <Table.Tr>
                    <Table.Th fw={700}>Sản phẩm</Table.Th>
                    <Table.Th ta="center" fw={700}>Số lượng</Table.Th>
                    <Table.Th ta="right" fw={700}>Đơn giá</Table.Th>
                    <Table.Th ta="right" fw={700}>Thành tiền</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {order.items && order.items.length > 0 ? order.items.map((item: any, i: number) => (
                    <Table.Tr key={i}>
                      <Table.Td>
                        <Group gap="sm">
                          <ThemeIcon color="blue" size="sm" variant="light" radius="sm">
                            <IconToolsKitchen2 size={14} />
                          </ThemeIcon>
                          <Text fw={700} c="blue">Món #{item.product_id}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td ta="center">
                        <Badge variant="light" size="lg" radius="md">{item.quantity}</Badge>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="sm" c="dimmed" fw={600}>
                          {VND(Number(item.unit_price))}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text fw={800} c="green">
                          {VND(Number(item.unit_price) * item.quantity)}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )) : (
                    <Table.Tr>
                      <Table.Td colSpan={4} ta="center">
                        <Text c="dimmed" py="xl">Không có thông tin chi tiết món ăn.</Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
                {order.items && order.items.length > 0 && (
                  <Table.Tfoot className="bg-slate-50 border-t border-slate-200">
                    <Table.Tr>
                      <Table.Th colSpan={3} ta="right" fw={900}>TỔNG TIỀN THANH TOÁN</Table.Th>
                      <Table.Th ta="right">
                        <Text fw={900} c="green" size="xl">
                          {VND(Number(order.total_amount))}
                        </Text>
                      </Table.Th>
                    </Table.Tr>
                  </Table.Tfoot>
                )}
              </Table>
            </Card>
          </Stack>
        </Box>

        {/* === RIGHT: ACTIONS & TIMELINE === */}
        <Stack gap="xl">
          {/* Main Actions */}
          <Card withBorder radius="md" p="lg" className="border-slate-200 shadow-sm">
            <Text fw={900} mb="lg" size="xs" tt="uppercase" c="dimmed" style={{ letterSpacing: '1px' }}>Thao tác Admin</Text>
            <Stack gap="md">
              {nextStatus && nextCfg && (
                <Button
                  fullWidth
                  color={nextCfg.color}
                  size="md"
                  radius="md"
                  leftSection={<nextCfg.icon size={20} stroke={2} />}
                  loading={updateStatusMutation.isPending}
                  onClick={() => {
                    if (nextStatus === 'paid') {
                      modals.open({
                        title: 'Hoàn tất thanh toán',
                        radius: 'md',
                        children: (
                          <Stack gap="md" p="md">
                            <Text size="sm">Vui lòng chọn phương thức thanh toán cho đơn hàng #{order.id}:</Text>
                            <SimpleGrid cols={2} spacing="md">
                              <Button 
                                variant="light" 
                                color="blue" 
                                h={80} 
                                onClick={() => {
                                  updateStatusMutation.mutate({ status: 'paid', payment_method: 'transfer' });
                                  modals.closeAll();
                                }}
                              >
                                <Stack align="center" gap={4}>
                                  <IconHistory size={24} />
                                  <Text size="xs" fw={700}>Chuyển khoản</Text>
                                </Stack>
                              </Button>
                              <Button 
                                variant="light" 
                                color="green" 
                                h={80} 
                                onClick={() => {
                                  updateStatusMutation.mutate({ status: 'paid', payment_method: 'cash' });
                                  modals.closeAll();
                                }}
                              >
                                <Stack align="center" gap={4}>
                                  <IconCash size={24} />
                                  <Text size="xs" fw={700}>Tiền mặt</Text>
                                </Stack>
                              </Button>
                            </SimpleGrid>
                          </Stack>
                        )
                      });
                    } else {
                      updateStatusMutation.mutate({ status: nextStatus });
                    }
                  }}
                  className="shadow-md"
                >
                  Xác nhận: {nextCfg.label}
                </Button>
              )}
              {order.order_status !== 'cancelled' && order.order_status !== 'paid' && (
                <Button
                  fullWidth
                  color="red"
                  variant="light"
                  size="sm"
                  radius="md"
                  leftSection={<IconCircleX size={18} />}
                  loading={updateStatusMutation.isPending}
                  onClick={() => modals.openConfirmModal({
                    title: 'Huỷ đơn hàng',
                    children: <Text size="sm">Bạn có chắc muốn huỷ đơn hàng #{order.id}? Khách sẽ không thể thanh toán đơn này.</Text>,
                    labels: { confirm: 'Đồng ý Huỷ', cancel: 'Bỏ qua' },
                    confirmProps: { color: 'red' },
                    onConfirm: () => updateStatusMutation.mutate({ status: 'cancelled' })
                  })}
                >
                  Huỷ đơn hàng
                </Button>
              )}
            </Stack>
          </Card>

          {/* Processing Timeline */}
          <Card withBorder radius="md" p="lg" className="border-slate-200 shadow-sm bg-slate-50/30">
            <Group justify="space-between" mb="xl">
              <Text fw={900} size="xs" tt="uppercase" c="dimmed" style={{ letterSpacing: '1px' }}>Tiến độ đơn hàng</Text>
              <IconHistory size={16} className="text-slate-400" />
            </Group>
            <Timeline active={STATUS_FLOW.indexOf(order.order_status)} bulletSize={32} lineWidth={2}>
              {STATUS_FLOW.map((s) => {
                const c = STATUS_CONFIG[s];
                const Icon = c.icon;
                const isPassed = STATUS_FLOW.indexOf(order.order_status) >= STATUS_FLOW.indexOf(s);
                return (
                  <Timeline.Item
                    key={s}
                    bullet={<Icon size={16} stroke={isPassed ? 3 : 1.5} />}
                    title={<Text size="sm" fw={isPassed ? 800 : 600} c={isPassed ? 'dark' : 'dimmed'}>{c.label}</Text>}
                    color={isPassed ? c.color : 'gray'}
                  >
                    {order.order_status === s && (
                      <Badge size="xs" variant="light" color={c.color} mt={4} mb={2}>Hiện tại</Badge>
                    )}
                    {s === 'paid' && isPassed && order.payment_method && order.payment_method !== 'unpaid' && (
                      <Text size="xs" fw={700} c="dimmed" mt={4}>
                        {order.payment_method === 'cash' ? 'Bằng tiền mặt' : 'Bằng chuyển khoản'}
                      </Text>
                    )}
                  </Timeline.Item>
                );
              })}
            </Timeline>
          </Card>

          {/* Delete (Danger Zone) */}
          <Button
            variant="subtle"
            color="red"
            size="xs"
            leftSection={<IconTrash size={14} />}
            onClick={() => modals.openConfirmModal({
              title: 'Xoá vĩnh viễn đơn hàng',
              children: <Text size="sm">Hành động này sẽ xóa sạch dữ liệu đơn #{order.id} khỏi hệ thống. Bạn có chắc không?</Text>,
              labels: { confirm: 'Xoá vĩnh viễn', cancel: 'Hủy' },
              confirmProps: { color: 'red' },
              onConfirm: () => deleteMutation.mutate()
            })}
          >
            Xoá vĩnh viễn đơn
          </Button>
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}
