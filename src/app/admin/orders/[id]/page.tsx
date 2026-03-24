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
  ArrowLeft, Trash2, Clock, CheckCircle2, ChefHat, PackageCheck,
  Banknote, XCircle, ShoppingCart, MapPin, Calendar, StickyNote
} from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { SectionLoader } from '@/components/common/GlobalLoading';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending:   { label: 'Chờ xác nhận', color: 'orange',  icon: Clock },
  confirmed: { label: 'Đã xác nhận',  color: 'blue',    icon: CheckCircle2 },
  preparing: { label: 'Đang chế biến', color: 'violet', icon: ChefHat },
  done:      { label: 'Sẵn sàng',     color: 'cyan',    icon: PackageCheck },
  paid:      { label: 'Đã thanh toán', color: 'green',  icon: Banknote },
  cancelled: { label: 'Đã huỷ',       color: 'red',     icon: XCircle },
};

const STATUS_FLOW = ['pending', 'confirmed', 'preparing', 'done', 'paid'];

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
    mutationFn: (status: string) => https.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      notifications.show({ title: 'Cập nhật thành công', message: 'Trạng thái đơn đã thay đổi', color: 'green' });
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
      <Button onClick={() => router.back()} leftSection={<ArrowLeft size={16} />}>Quay lại</Button>
    </Stack>
  );

  const cfg = STATUS_CONFIG[order.order_status] || STATUS_CONFIG.pending;
  const nextStatus = getNextStatus(order.order_status);
  const nextCfg = nextStatus ? STATUS_CONFIG[nextStatus] : null;
  const StatusIcon = cfg.icon;

  return (
    <Stack gap="xl" p="md">
      {/* Header / Breadcrumb */}
      <Group justify="space-between" align="flex-start">
        <Group gap="md">
          <ActionIcon 
            variant="light" 
            color="blue" 
            size="xl" 
            radius="xl"
            onClick={() => router.push('/admin/orders')}
          >
            <ArrowLeft size={20} />
          </ActionIcon>
          <Stack gap={2}>
            <Text size="sm" c="dimmed" fw={500}>Quản lý Đơn hàng</Text>
            <Title order={1} className="text-slate-800 text-3xl font-black">
              Chi tiết Đơn hàng <span className="text-blue-600">#{order.id}</span>
            </Title>
          </Stack>
        </Group>
        <Badge size="xl" color={cfg.color} variant="filled" leftSection={<StatusIcon size={14} />} radius="md">
          {cfg.label}
        </Badge>
      </Group>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
        {/* === CỘT TRÁI: Chi tiết đơn hàng === */}
        <Box style={{ gridColumn: 'span 2' }}>
          <Stack gap="lg">
            {/* Thông tin tóm tắt */}
            <SimpleGrid cols={3} spacing="md">
              <Paper p="lg" withBorder radius="xl" className="bg-blue-50 border-blue-100 text-center">
                <ThemeIcon color="blue" size="xl" radius="xl" mx="auto" mb="xs">
                  <MapPin size={20} />
                </ThemeIcon>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">Bàn số</Text>
                <Text size="2xl" fw={900} c="blue" mt={4}>#{order.table_id}</Text>
              </Paper>
              <Paper p="lg" withBorder radius="xl" className="bg-green-50 border-green-100 text-center">
                <ThemeIcon color="green" size="xl" radius="xl" mx="auto" mb="xs">
                  <Banknote size={20} />
                </ThemeIcon>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">Tổng tiền</Text>
                <Text size="lg" fw={900} c="green" mt={4}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(order.total_amount))}
                </Text>
              </Paper>
              <Paper p="lg" withBorder radius="xl" className="text-center">
                <ThemeIcon color="gray" size="xl" radius="xl" mx="auto" mb="xs">
                  <Calendar size={20} />
                </ThemeIcon>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">Thời gian tạo</Text>
                <Text size="sm" fw={700} mt={4}>{dayjs(order.created_at).format('HH:mm')}</Text>
                <Text size="xs" c="dimmed">{dayjs(order.created_at).format('DD/MM/YYYY')}</Text>
              </Paper>
            </SimpleGrid>

            {/* Ghi chú của khách */}
            {order.note && (
              <Paper p="md" withBorder radius="xl" className="bg-yellow-50 border-yellow-200">
                <Group gap="xs" mb="xs">
                  <StickyNote size={16} className="text-yellow-600" />
                  <Text size="sm" fw={700} c="yellow.8">Ghi chú từ khách hàng</Text>
                </Group>
                <Text size="sm" className="italic">"{order.note}"</Text>
              </Paper>
            )}

            {/* Danh sách món ăn */}
            <Card withBorder radius="xl" padding="0" className="overflow-hidden">
              <Box p="md" className="bg-slate-50 border-b border-slate-100">
                <Group gap="xs">
                  <ShoppingCart size={18} className="text-blue-600" />
                  <Text fw={800} size="md">Danh sách món đã đặt</Text>
                </Group>
              </Box>
              <Table verticalSpacing="md" horizontalSpacing="xl">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th fw={700}>Mã sản phẩm</Table.Th>
                    <Table.Th ta="center" fw={700}>Số lượng</Table.Th>
                    <Table.Th ta="right" fw={700}>Đơn giá</Table.Th>
                    <Table.Th ta="right" fw={700}>Thành tiền</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {order.items && order.items.length > 0 ? order.items.map((item: any, i: number) => (
                    <Table.Tr key={i}>
                      <Table.Td>
                        <Text fw={700} c="blue">SP #{item.product_id}</Text>
                      </Table.Td>
                      <Table.Td ta="center">
                        <Badge variant="light" size="md">{item.quantity}</Badge>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text size="sm" c="dimmed">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.unit_price))}
                        </Text>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text fw={800} c="green">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.unit_price) * item.quantity)}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )) : (
                    <Table.Tr>
                      <Table.Td colSpan={4} ta="center">
                        <Text c="dimmed" py="md">Không có thông tin chi tiết món.</Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
                {order.items && order.items.length > 0 && (
                  <Table.Tfoot>
                    <Table.Tr>
                      <Table.Th colSpan={3} ta="right" fw={900}>TỔNG CỘNG</Table.Th>
                      <Table.Th ta="right">
                        <Text fw={900} c="green" size="lg">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(order.total_amount))}
                        </Text>
                      </Table.Th>
                    </Table.Tr>
                  </Table.Tfoot>
                )}
              </Table>
            </Card>
          </Stack>
        </Box>

        {/* === CỘT PHẢI: Hành động & Timeline === */}
        <Stack gap="lg">
          {/* Hành động */}
          <Card withBorder radius="xl" p="lg">
            <Text fw={800} mb="md" size="sm" tt="uppercase" c="dimmed">Cập nhật trạng thái</Text>
            <Stack gap="sm">
              {nextStatus && nextCfg && (
                <Button
                  fullWidth
                  color={nextCfg.color}
                  size="md"
                  radius="md"
                  leftSection={<nextCfg.icon size={18} />}
                  loading={updateStatusMutation.isPending}
                  onClick={() => updateStatusMutation.mutate(nextStatus)}
                  className="shadow-sm"
                >
                  Chuyển → {nextCfg.label}
                </Button>
              )}
              {order.order_status !== 'cancelled' && order.order_status !== 'paid' && (
                <Button
                  fullWidth
                  color="red"
                  variant="light"
                  size="md"
                  radius="md"
                  leftSection={<XCircle size={18} />}
                  loading={updateStatusMutation.isPending}
                  onClick={() => modals.openConfirmModal({
                    title: 'Huỷ đơn hàng',
                    children: <Text size="sm">Bạn có chắc muốn huỷ đơn hàng #{order.id}?</Text>,
                    labels: { confirm: 'Huỷ đơn', cancel: 'Không' },
                    confirmProps: { color: 'red' },
                    onConfirm: () => updateStatusMutation.mutate('cancelled')
                  })}
                >
                  Huỷ đơn hàng
                </Button>
              )}
            </Stack>
          </Card>

          {/* Timeline trạng thái */}
          <Card withBorder radius="xl" p="lg">
            <Text fw={800} mb="lg" size="sm" tt="uppercase" c="dimmed">Lộ trình xử lý</Text>
            <Timeline active={STATUS_FLOW.indexOf(order.order_status)} bulletSize={28} lineWidth={2}>
              {STATUS_FLOW.map((s) => {
                const c = STATUS_CONFIG[s];
                const Icon = c.icon;
                return (
                  <Timeline.Item
                    key={s}
                    bullet={<Icon size={14} />}
                    title={<Text size="sm" fw={700}>{c.label}</Text>}
                    color={c.color}
                  />
                );
              })}
            </Timeline>
          </Card>

          {/* Xoá đơn */}
          <Button
            variant="subtle"
            color="red"
            leftSection={<Trash2 size={16} />}
            onClick={() => modals.openConfirmModal({
              title: 'Xoá vĩnh viễn đơn hàng',
              children: <Text size="sm">Hành động này không thể khôi phục. Đơn hàng #{order.id} sẽ bị xóa hoàn toàn.</Text>,
              labels: { confirm: 'Xoá vĩnh viễn', cancel: 'Hủy' },
              confirmProps: { color: 'red' },
              onConfirm: () => deleteMutation.mutate()
            })}
          >
            Xoá đơn hàng này
          </Button>
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}
