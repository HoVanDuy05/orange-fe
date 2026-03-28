'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Text, Badge, Stack, Group, Button,
  Box, Tabs, Table, Modal, Divider, Textarea,
  UnstyledButton, ThemeIcon, SimpleGrid, Card,
  ActionIcon, Tooltip, Avatar
} from '@mantine/core';
import {
  Eye, Banknote, XCircle, Package, Building2,
  AlertTriangle, Filter, RefreshCcw, Bike, Coffee, Zap
} from 'lucide-react';
import dayjs from 'dayjs';
import { formatCurrency } from '@/utils/helper';

import { useOrders } from '@/hooks/useOrders';
import { ORDER_TABLE_COLUMNS, ORDER_TABS, ORDER_TYPE_FILTERS } from '@/constants/orders';
import { Order } from '@/types/orders';

// Reusable Components
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { ServiceDataTable } from '@/components/admin/ui/ServiceDataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { SectionLoader } from '@/components/common/GlobalLoading';
import Link from 'next/link';

export default function OrdersPage() {
  const router = useRouter();

  const {
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
  } = useOrders();

  if (isLoading && !isRefetching) return <SectionLoader />;

  return (
    <Stack gap="xl">
      <PageHeader
        title="Quản lý Đơn hàng"
        description="Hệ thống Omnichannel: Quản lý tập trung đơn Tại bàn, Mang đi và Giao hàng."
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Đơn hàng' }]}
        actions={
          <Group gap="sm">
            <Button
              variant="outline"
              color="gray"
              leftSection={<Filter size={16} />}
              radius="md"
              onClick={() => { setFilterStatus(null); setFilterType(null); }}
            >
              Bỏ lọc
            </Button>
            <ActionIcon variant="light" color="brand" size="36px" radius="md" onClick={() => refetch()} loading={isRefetching}>
              <RefreshCcw size={18} />
            </ActionIcon>
            <Button color="brand" leftSection={<Zap size={16} />} radius="md" fw={700}>
              Tạo đơn mới
            </Button>
          </Group>
        }
      />

      {/* ── Filters & Tabs ── */}
      <Card withBorder radius="xl" p="md" shadow="xs" style={{ background: 'white' }}>
        <Group justify="space-between">
          <Tabs value={filterStatus || 'all'} onChange={(v) => setFilterStatus(v === 'all' ? null : v)} color="brand" styles={{ tab: { fontWeight: 700 } }}>
            <Tabs.List>
              {ORDER_TABS.map((tab) => (
                <Tabs.Tab key={tab.value} value={tab.value} color={tab.color}>{tab.label}</Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>

          <Group gap="xs">
            {ORDER_TYPE_FILTERS.map((f) => (
              <Badge
                key={f.value || 'all'}
                variant={filterType === f.value ? 'filled' : 'light'}
                color={f.color}
                style={{ cursor: 'pointer' }}
                onClick={() => setFilterType(f.value)}
              >
                {f.label}
              </Badge>
            ))}
          </Group>
        </Group>
      </Card>

      {/* ── Data Table ── */}
      <ServiceDataTable
        columns={ORDER_TABLE_COLUMNS}
        data={orders}
        isLoading={isLoading}
        renderRow={(order: Order) => (
          <Table.Tr key={order.id} style={{ opacity: ['completed', 'cancelled'].includes(order.order_status) ? 0.6 : 1 }}>
            <Table.Td>
              <Stack gap={0}>
                <Text fw={800} size="sm" c="blue.7">#OR-{order.id}</Text>
                <Text size="10px" fw={700} c="dimmed">MÃ GIAO DỊCH</Text>
              </Stack>
            </Table.Td>
            <Table.Td>
              <Group gap={6} wrap="nowrap">
                {order.order_type === 'dine_in' ? <Coffee size={14} color="#3B82F6" /> : order.order_type === 'delivery' ? <Bike size={14} color="#6366F1" /> : <Package size={14} color="#10B981" />}
                <Text size="xs" fw={800} tt="uppercase" c="gray.7">
                  {order.order_type === 'dine_in' ? (order.table_name || 'Bàn') : order.order_type === 'delivery' ? 'Delivery' : 'Mang đi'}
                </Text>
              </Group>
            </Table.Td>
            <Table.Td>
              <Group gap="sm" wrap="nowrap">
                <Avatar size="sm" radius="xl" color="brand" variant="light">
                  {order.customer_name?.charAt(0) || '?'}
                </Avatar>
                <Box>
                  <Text size="sm" fw={700} lineClamp={1}>{order.customer_name || 'Khách vãng lai'}</Text>
                  <Text size="10px" c="dimmed" fw={600}>{order.customer_phone || 'Không để lại SDT'}</Text>
                </Box>
              </Group>
            </Table.Td>
            <Table.Td>
              <Text fw={800} size="sm" style={{ color: '#0F172A' }}>{formatCurrency(order.total_amount)}</Text>
              <Text size="10px" c="dimmed" fw={600}>{order.payment_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}</Text>
            </Table.Td>
            <Table.Td>
              <StatusBadge status={order.order_status} />
            </Table.Td>
            <Table.Td>
              <Stack gap={0}>
                <Text size="sm" fw={700} c="gray.8">{dayjs(order.created_at).format('HH:mm')}</Text>
                <Text size="10px" c="dimmed" fw={600}>{dayjs(order.created_at).format('DD/MM')}</Text>
              </Stack>
            </Table.Td>
            <Table.Td>
              <Group gap="xs" wrap="nowrap">
                <Tooltip label="Xem chi tiết">
                  <ActionIcon variant="light" color="blue" radius="md" component={Link} href={`/orders/${order.id}`}>
                    <Eye size={16} />
                  </ActionIcon>
                </Tooltip>

                {!['completed', 'cancelled'].includes(order.order_status) && (
                  <>
                    {order.order_status === 'pending' && (
                      <Button size="xs" radius="md" color="blue" onClick={() => updateStatus.mutate({ id: order.id, status: 'confirmed' })}>Xác nhận</Button>
                    )}
                    {order.order_status === 'confirmed' && (
                      <Button size="xs" radius="md" color="brand" onClick={() => updateStatus.mutate({ id: order.id, status: 'preparing' })}>Làm món</Button>
                    )}
                    {['preparing', 'served'].includes(order.order_status) && (
                      <Button size="xs" radius="md" color="green" onClick={() => handleOpenPayment(order)}>Tất toán</Button>
                    )}
                    <ActionIcon variant="light" color="red" radius="md" onClick={() => { setCancelOrderId(order.id); openCancelModal(); }}>
                      <XCircle size={16} />
                    </ActionIcon>
                  </>
                )}
              </Group>
            </Table.Td>
          </Table.Tr>
        )}
      />

      {/* ── Payment Modal ── */}
      <Modal opened={payModalOpened} onClose={closePayModal} centered radius="24px" size="md" title={<Text fw={900} size="lg">Hoàn tất Thanh toán</Text>}>
        <Stack gap="xl" p="md">
          <Card withBorder radius="xl" p="xl" bg="brand.0" style={{ borderStyle: 'dashed', borderColor: 'var(--brand-primary)' }}>
            <Stack align="center" gap={4}>
              <Text size="xs" fw={800} c="dimmed" tt="uppercase">Tổng số tiền</Text>
              <Text size="32px" fw={900} c="brand.7">{formatCurrency(selectedOrder?.total_amount || 0)}</Text>
              <Badge color="brand" variant="light">ĐƠN #OR-{selectedOrder?.id}</Badge>
            </Stack>
          </Card>

          <Box>
            <Text size="xs" fw={800} c="dimmed" mb="md" tt="uppercase">Phương thức thanh toán</Text>
            <SimpleGrid cols={2} spacing="md">
              <UnstyledButton
                p="md"
                onClick={() => setPaymentMethod('cash')}
                style={{
                  borderRadius: '24px',
                  border: `2px solid ${paymentMethod === 'cash' ? 'var(--brand-primary)' : '#E2E8F0'}`,
                  background: paymentMethod === 'cash' ? 'var(--brand-primary-soft)' : 'white',
                  transition: 'all 0.2s'
                }}
              >
                <Stack align="center" gap={8}>
                  <ThemeIcon size="lg" radius="xl" color="brand" variant={paymentMethod === 'cash' ? 'filled' : 'light'}><Banknote size={20} /></ThemeIcon>
                  <Text size="sm" fw={700}>Tiền mặt</Text>
                </Stack>
              </UnstyledButton>

              <UnstyledButton
                p="md"
                onClick={() => setPaymentMethod('transfer')}
                style={{
                  borderRadius: '24px',
                  border: `2px solid ${paymentMethod === 'transfer' ? '#3B82F6' : '#E2E8F0'}`,
                  background: paymentMethod === 'transfer' ? 'rgba(59,130,246,0.05)' : 'white',
                  transition: 'all 0.2s'
                }}
              >
                <Stack align="center" gap={8}>
                  <ThemeIcon size="lg" radius="xl" color="blue" variant={paymentMethod === 'transfer' ? 'filled' : 'light'}><Building2 size={20} /></ThemeIcon>
                  <Text size="sm" fw={700}>Chuyển khoản</Text>
                </Stack>
              </UnstyledButton>
            </SimpleGrid>
          </Box>

          <Button fullWidth size="lg" radius="xl" color="brand" fw={900} onClick={handleConfirmPayment}>
            Xác nhận & Hoàn tất
          </Button>
        </Stack>
      </Modal>

      {/* ── Cancel Modal ── */}
      <Modal opened={cancelModalOpened} onClose={closeCancelModal} centered radius="24px" title={<Text fw={900}>Hủy đơn hàng</Text>}>
        <Stack p="md" gap="lg">
          <Group gap="sm" p="sm" bg="red.0" style={{ borderRadius: 12 }}>
            <AlertTriangle color="#EF4444" size={20} />
            <Text size="sm" c="red.7" fw={700}>Hành động này sẽ ghi nhận đơn hàng bị hủy bỏ.</Text>
          </Group>
          <Textarea
            label="Lý do hủy"
            placeholder="Nhập lý do..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            radius="md"
          />
          <Button color="red" fullWidth radius="xl" fw={800} onClick={() => {
            if (cancelOrderId !== null) {
              updateStatus.mutate({ id: cancelOrderId, status: 'cancelled', cancel_reason: cancelReason });
              closeCancelModal();
            }
          }}>
            Xác nhận Hủy Đơn
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
