'use client';

import React from 'react';
import {
  Title, Text, SimpleGrid, Card, Group, Skeleton, Select, Badge, Stack,
  Box, ActionIcon, Center, Button
} from '@mantine/core';
import { AreaChart, DonutChart } from '@mantine/charts';
import {
  Banknote, Wallet, RefreshCcw,
  Package, Bike, Coffee, Download, TrendingUp, ShoppingCart,
  Star
} from 'lucide-react';

import { formatCurrency } from '@/utils/helper';
import { COLORS } from '@/constants';
import { DASHBOARD_REPORT_TYPES } from '@/constants/dashboard';
import { useDashboard } from '@/hooks/useDashboard';

// Reusable Components
import { QuickCard } from '@/components/admin/dashboard/QuickCard';
import { StatCard, ChannelBar } from '@/components/admin/dashboard/DashboardElements';
import { PageHeader } from '@/components/admin/ui/PageHeader';

export default function DashboardPage() {
  const {
    reportType,
    setReportType,
    today,
    isLoading,
    isRefetching,
    refetch,
    financialData,
    topProducts,
    categoryData,
    summary: {
      totalRev,
      totalOrders,
      cashRev,
      transferRev,
      dineInRev,
      takeAwayRev,
      deliveryRev,
    }
  } = useDashboard();

  return (
    <Stack gap="xl">
      <PageHeader
        title="Orange Dashboard"
        description="Báo cáo trực tiếp tình hình kinh doanh hôm nay và các kỳ thống kê"
        actions={
          <Group gap="sm">
            <Select
              value={reportType}
              onChange={(v) => setReportType(v || 'daily')}
              data={DASHBOARD_REPORT_TYPES}
              w={220}
              radius="md"
              styles={{ input: { fontWeight: 700, fontSize: '13px' } }}
            />
            <ActionIcon
              variant="light"
              color="brand"
              size="36px"
              radius="md"
              loading={isRefetching}
              onClick={() => refetch()}
            >
              <RefreshCcw size={18} />
            </ActionIcon>
            <Button variant="outline" color="gray" leftSection={<Download size={16} />} radius="md" fw={700}>
              Xuất PDF
            </Button>
          </Group>
        }
      />

      {/* ── Today Overview ── */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
        <QuickCard
          label="Hôm này (VND)"
          value={formatCurrency(today.today_revenue || 0)}
          icon={<Banknote size={20} />}
          color="brand"
          sub={`${today.completed_orders || 0} đơn đã hoàn thành`}
          loading={isLoading}
        />
        <QuickCard
          label="Tiền mặt"
          value={formatCurrency(today.cash_revenue || 0)}
          icon={<Wallet size={20} />}
          color="#10B981"
          sub="Phát sinh trong ngày"
          loading={isLoading}
        />
        <QuickCard
          label="Chuyển khoản"
          value={formatCurrency(today.transfer_revenue || 0)}
          icon={<TrendingUp size={20} />}
          color="#6366F1"
          sub="Giao dịch trực tuyến"
          loading={isLoading}
        />
        <QuickCard
          label="Đang phục vụ"
          value={String(today.active_orders || 0)}
          icon={<ShoppingCart size={20} />}
          color="#F59E0B"
          sub={`+${today.cancelled_orders || 0} đơn bị hủy`}
          loading={isLoading}
          isCount
        />
      </SimpleGrid>

      {/* ── KPI Grid ── */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
        <StatCard label="Tổng doanh thu" value={formatCurrency(totalRev)} sub="Kỳ thống kê hiện tại" color="brand" />
        <StatCard label="Số lượng đơn" value={`${totalOrders} đơn`} sub="Giao dịch thực tế" color="#10B981" />
        <StatCard label="Doanh thu Tại bàn" value={formatCurrency(dineInRev)} sub={`${totalRev > 0 ? Math.round(dineInRev / totalRev * 100) : 0}% tỉ trọng`} color="#6366F1" />
        <StatCard label="Doanh thu Delivery" value={formatCurrency(deliveryRev)} sub={`${totalRev > 0 ? Math.round(deliveryRev / totalRev * 100) : 0}% tỉ trọng`} color="#F59E0B" />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
        {/* Main Chart */}
        <Box style={{ gridColumn: 'span 2' }}>
          <Card withBorder radius="xl" shadow="xs" p="xl" style={{ background: 'white' }}>
            <Group justify="space-between" mb="lg">
              <div>
                <Title order={4} fw={800} style={{ color: '#0F172A', fontSize: '18px' }}>Xử lý xu hướng</Title>
                <Text size="xs" c="dimmed" fw={600}>Doanh thu chi tiết theo thời gian</Text>
              </div>
              <Badge color="brand" variant="light" size="lg" radius="md" fw={700}>
                {formatCurrency(totalRev)}
              </Badge>
            </Group>
            {isLoading
              ? <Skeleton height={280} radius="xl" />
              : <AreaChart
                h={280}
                data={financialData}
                dataKey="time_label"
                series={[
                  { name: 'revenue', color: 'brand.6', label: 'Tổng thu' },
                  { name: 'dine_in_revenue', color: 'indigo.5', label: 'Tại bàn' },
                  { name: 'delivery_revenue', color: 'teal.5', label: 'Delivery' }
                ]}
                curveType="monotone"
                tickLine="y"
                yAxisProps={{ width: 80 }}
                unit="đ"
                gridAxis="xy"
              />
            }
          </Card>
        </Box>

        {/* Analytics Breakdown */}
        <Stack gap="lg">
          <Card withBorder radius="xl" shadow="xs" p="xl" style={{ background: 'white' }}>
            <Title order={4} fw={800} mb="xs" style={{ color: '#0F172A', fontSize: '16px' }}>Hình thức thanh toán</Title>
            <Center mb="md">
              <DonutChart
                data={[
                  { name: 'Tiền mặt', value: cashRev, color: 'brand.5' },
                  { name: 'Chuyển khoản', value: transferRev, color: 'indigo.5' },
                ]}
                withLabels
                labelsType="percent"
                size={160}
                thickness={24}
              />
            </Center>
            <Stack gap={8}>
              <Group justify="space-between">
                <Group gap="xs">
                  <Box h={10} w={10} style={{ background: 'var(--brand-primary)', borderRadius: 3 }} />
                  <Text size="sm" fw={600}>Tiền mặt</Text>
                </Group>
                <Text size="sm" fw={800}>{formatCurrency(cashRev)}</Text>
              </Group>
              <Group justify="space-between">
                <Group gap="xs">
                  <Box h={10} w={10} style={{ background: '#6366F1', borderRadius: 3 }} />
                  <Text size="sm" fw={600}>Chuyển khoản</Text>
                </Group>
                <Text size="sm" fw={800}>{formatCurrency(transferRev)}</Text>
              </Group>
            </Stack>
          </Card>
        </Stack>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
        {/* Channels */}
        <Card withBorder radius="xl" shadow="xs" p="xl" style={{ background: 'white' }}>
          <Title order={4} fw={800} mb="xs" style={{ color: '#0F172A', fontSize: '16px' }}>Kênh bán hàng</Title>
          <Text size="xs" c="dimmed" mb="md" fw={600}>Hiệu quả từng kênh dịch vụ</Text>
          <Stack gap="sm">
            <ChannelBar label="Tại bàn (Dine-in)" value={dineInRev} total={totalRev} color="brand" icon={<Coffee size={14} />} />
            <ChannelBar label="Mang đi (Takeaway)" value={takeAwayRev} total={totalRev} color="#10B981" icon={<Package size={14} />} />
            <ChannelBar label="Giao hàng (Delivery)" value={deliveryRev} total={totalRev} color="#6366F1" icon={<Bike size={14} />} />
          </Stack>
        </Card>

        {/* Categories */}
        <Card withBorder radius="xl" shadow="xs" p="xl" style={{ background: 'white' }}>
          <Title order={4} fw={800} mb="xs" style={{ color: '#0F172A', fontSize: '16px' }}>Tỉ lệ danh mục</Title>
          <Text size="xs" c="dimmed" mb="md" fw={600}>Cơ cấu món ăn được ưa chuộng</Text>
          {isLoading ? <Skeleton height={200} radius="xl" /> : (
            <Center>
              <DonutChart
                data={categoryData.length ? categoryData : [{ name: 'N/A', value: 1, color: 'gray.2' }]}
                withLabelsLine
                labelsType="percent"
                withLabels
                size={180}
                thickness={26}
              />
            </Center>
          )}
        </Card>

        {/* Top Products */}
        <Card withBorder radius="xl" shadow="xs" p="xl" style={{ background: 'white' }}>
          <Group justify="space-between" mb="md">
            <Box>
              <Title order={4} fw={800} style={{ color: '#0F172A', fontSize: '16px' }}>Món tiêu biểu</Title>
              <Text size="xs" c="dimmed" fw={600}>Lượng tiêu thụ cao nhất</Text>
            </Box>
            <Star size={18} fill="var(--brand-primary)" stroke="var(--brand-primary)" />
          </Group>
          <Stack gap={10}>
            {topProducts.slice(0, 7).map((p, i) => (
              <Group key={i} justify="space-between" wrap="nowrap" style={{
                padding: '10px 14px',
                borderRadius: '12px',
                background: i === 0 ? 'var(--brand-primary-soft)' : 'rgba(241, 245, 249, 0.4)'
              }}>
                <Group gap="sm" wrap="nowrap">
                  <Text size="xs" fw={900} style={{ color: i === 0 ? 'var(--brand-primary)' : '#94A3B8', width: 14 }}>{i + 1}</Text>
                  <Text size="sm" fw={700} style={{ color: '#334155' }} truncate>{p.product_name}</Text>
                </Group>
                <Badge color={i === 0 ? 'brand' : 'gray'} variant="light" size="sm" fw={800}>
                  {Number(p.total_sold).toLocaleString()}
                </Badge>
              </Group>
            ))}
          </Stack>
        </Card>
      </SimpleGrid>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.6; }
        }
      `}</style>
    </Stack>
  );
}
