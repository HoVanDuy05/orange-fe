'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import https from '@/api/https';
import { 
  Title, Text, SimpleGrid, Card, Group, RingProgress, Center, Loader, Select, Badge, Stack, Table, ActionIcon, Box
} from '@mantine/core';
import { AreaChart, BarChart, DonutChart } from '@mantine/charts';
import { TrendingUp, ShoppingCart, DollarSign, Wallet, RefreshCcw } from 'lucide-react';
import { SectionLoader } from '@/components/common/GlobalLoading';

export default function DashboardPage() {
  const [reportType, setReportType] = useState<string>('daily');

  const { data: rawStats, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['stats', reportType],
    queryFn: async () => (await https.get(`/stats/revenue?type=${reportType}`)).data
  });

  const stats = rawStats?.data || rawStats || {};
  const financialData = stats.financial || [];
  const topProductsData = stats.topProducts || [];
  const categoryData = (stats.byCategory || []).map((c: any) => ({
      name: c.category_name,
      value: Number(c.revenue),
      color: 'blue'
  }));

  if (isLoading) return <SectionLoader />;

  // Calculate totals
  const totalRev = financialData.reduce((acc: number, d: any) => acc + d.revenue, 0);
  const totalCost = financialData.reduce((acc: number, d: any) => acc + d.cost, 0);
  const totalProfit = totalRev - totalCost;

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <div>
          <Title order={1} className="text-blue-900 leading-tight">Báo Cáo Hoạt Động</Title>
          <Text c="dimmed" size="sm">Cập nhật lúc {new Date().toLocaleTimeString('vi-VN')}</Text>
        </div>
        <Group align="flex-end">
           <Select 
             label="Cấp độ thống kê"
             value={reportType}
             onChange={(v) => setReportType(v || 'daily')}
             data={[
               { value: 'daily', label: 'Theo Ngày' },
               { value: 'monthly', label: 'Theo Tháng' },
               { value: 'yearly', label: 'Theo Năm' },
               { value: 'hourly', label: 'Theo Giờ (Hôm nay)' },
             ]}
             w={180}
             radius="md"
           />
           <ActionIcon 
             variant="light" 
             color="blue" 
             size="lg" 
             radius="md" 
             loading={isRefetching}
             onClick={() => refetch()}
           >
              <RefreshCcw size={18} />
           </ActionIcon>
        </Group>
      </Group>

      {/* Main Stats Cards */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        <Card withBorder radius="lg" shadow="sm" p="lg" className="border-l-4 border-l-blue-500 bg-white">
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={700} c="dimmed" tt="uppercase">Tổng Doanh Thu</Text>
            <DollarSign size={20} className="text-blue-500" />
          </Group>
          <Title order={2} className="text-blue-900">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRev)}
          </Title>
          <Text size="xs" c="green" mt="sm" fw={600}>Khách mua hàng thực tế</Text>
        </Card>

        <Card withBorder radius="lg" shadow="sm" p="lg" className="border-l-4 border-l-orange-500 bg-white">
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={700} c="dimmed" tt="uppercase">Tổng Vốn (Chi phí)</Text>
            <ShoppingCart size={20} className="text-orange-500" />
          </Group>
          <Title order={2} className="text-orange-900">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalCost)}
          </Title>
          <Text size="xs" c="orange" mt="sm" fw={600}>Dựa trên phiếu nhập kho</Text>
        </Card>

        <Card withBorder radius="lg" shadow="sm" p="lg" className="border-l-4 border-l-teal-500 bg-white">
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={700} c="dimmed" tt="uppercase">Lợi Nhuận Ròng</Text>
            <Wallet size={20} className="text-teal-500" />
          </Group>
          <Title order={2} className="text-teal-900">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalProfit)}
          </Title>
          <ProgressCircle value={totalRev > 0 ? (totalProfit/totalRev)*100 : 0} />
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
         {/* Financial Trend Chart */}
         <Card withBorder radius="lg" shadow="sm" p="xl" className="bg-white">
            <Title order={4} mb="lg" className="text-slate-800">Biểu đồ Thu/Chi ({reportType === 'daily' ? '30 ngày' : 'Gần đây'})</Title>
            <Box h={300}>
               <BarChart
                 h={300}
                 data={financialData}
                 dataKey="time_label"
                 series={[
                   { name: 'revenue', color: 'blue.6', label: 'Doanh Thu' },
                   { name: 'cost', color: 'orange.6', label: 'Chi Phí (Nhập)' },
                   { name: 'profit', color: 'teal.6', label: 'Lợi Nhuận' },
                 ]}
                 tickLine="y"
                 yAxisProps={{ width: 80 }}
                 unit="đ"
               />
            </Box>
         </Card>

         {/* Product Analytics */}
         <Card withBorder radius="lg" shadow="sm" p="xl" className="bg-white">
            <Title order={4} mb="lg" className="text-slate-800">Cơ cấu Doanh Thu Theo Danh Mục</Title>
            <Center h={300}>
               <DonutChart 
                 data={categoryData} 
                 withLabelsLine 
                 labelsType="percent" 
                 withLabels 
                 thickness={30} 
                 size={220}
               />
            </Center>
         </Card>
      </SimpleGrid>

      {/* Tables & Deep List */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
         <Card withBorder radius="lg" shadow="sm" p="xl" className="bg-white">
            <Title order={4} mb="md">Top 10 Món Bán Chạy</Title>
            <Table striped highlightOnHover verticalSpacing="sm">
               <Table.Thead className="bg-slate-50">
                  <Table.Tr>
                     <Table.Th>Sản phẩm</Table.Th>
                     <Table.Th>Số lượng bán</Table.Th>
                  </Table.Tr>
               </Table.Thead>
               <Table.Tbody>
                  {topProductsData.map((p: any, idx: number) => (
                     <Table.Tr key={idx}>
                        <Table.Td fw={600} className="text-slate-700">{p.product_name}</Table.Td>
                        <Table.Td>
                           <Badge variant="light" size="lg" color="green">{Number(p.total_sold).toLocaleString()} sp</Badge>
                        </Table.Td>
                     </Table.Tr>
                  ))}
               </Table.Tbody>
            </Table>
         </Card>

         <Card withBorder radius="lg" shadow="sm" p="xl" className="bg-white flex flex-col justify-center items-center">
            <Center style={{ flex: 1 }}>
               <Stack align="center" gap="xs">
                  <TrendingUp size={48} className="text-teal-400 opacity-50 mb-4" />
                  <Title order={2} ta="center">Doanh thu dự báo</Title>
                  <Text c="dimmed" maw={300} ta="center">Dữ liệu đang được phân tích bởi hệ thống AI để đưa ra kế hoạch nhập hàng tháng tới.</Text>
               </Stack>
            </Center>
         </Card>
      </SimpleGrid>
    </Stack>
  );
}

function ProgressCircle({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <Group gap="xs" mt="sm">
       <RingProgress
         size={45}
         thickness={5}
         roundCaps
         sections={[{ value: value, color: 'teal' }]}
         label={
           <Text c="teal" fw={700} ta="center" size="xs">
             {rounded}%
           </Text>
         }
       />
       <Text size="xs" c="dimmed" fw={600}>Tỉ suất lợi nhuận</Text>
    </Group>
  );
}
