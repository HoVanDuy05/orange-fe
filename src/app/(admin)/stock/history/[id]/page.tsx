'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import https from '@/api/https';
import {
  Title, Card, Text, Badge, Stack, Group, Button,
  Timeline, ScrollArea, Center, ActionIcon, Paper, SimpleGrid, Breadcrumbs, Box, Divider
} from '@mantine/core';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, CheckCircle2, ArrowLeft, History, Calendar, User, Package, DollarSign, Box as BoxIcon } from 'lucide-react';
import { SectionLoader } from '@/components/common/GlobalLoading';
import { AppTitle } from '@/components/common/AppTitle';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

export default function StockHistoryPage() {
  const router = useRouter();
  const { id } = useParams();

  // Fetch bản ghi hiện tại để có thông tin cơ bản (Header)
  const { data: stockData = [], isLoading: mainLoading } = useQuery({
    queryKey: ['stock'],
    queryFn: async () => (await https.get('/stock')).data
  });

  const currentRecord = Array.isArray(stockData) ? stockData.find((s: any) => s.id.toString() === id) : null;

  // Fetch lịch sử thay đổi
  const { data: rawHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['stock-history', id],
    queryFn: async () => (await https.get(`/stock/${id}/history`)).data,
    enabled: !!id
  });

  const historyData = Array.isArray(rawHistory) ? rawHistory : (rawHistory?.data || []);
  const isLoading = mainLoading || historyLoading;

  if (isLoading) return <SectionLoader />;

  return (
    <Stack gap="xl" p="md">
      {/* Breadcrumbs & Navigation */}
      <Stack gap={2}>
      {/* Breadcrumbs removed as per user request */}

        <Group justify="space-between" mt="xs">
          <Group gap="md">
            <ActionIcon variant="light" color="brand" size="xl" radius="md" onClick={() => router.push('/stock')}>
              <ArrowLeft size={20} />
            </ActionIcon>
            <AppTitle level={1}>Chi tiết Nhật ký Thay đổi</AppTitle>
          </Group>
          <Badge size="xl" variant="filled" color="brand" radius="sm">MÃ PHIẾU #{id}</Badge>
        </Group>
      </Stack>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
        {/* Left: Current Version Info */}
        <Stack gap="lg" style={{ flex: 1 }}>
          <Paper withBorder p="xl" radius="lg" shadow="sm" className="bg-blue-50/50 border-blue-100">
            <AppTitle level={3} style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={22} /> Trạng thái Hiện tại
            </AppTitle>
            {currentRecord ? (
              <Stack gap="md">
                <div>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Tên hàng hóa:</Text>
                  <Text fw={800} size="lg">{currentRecord.item_name}</Text>
                </div>
                <SimpleGrid cols={2}>
                  <div>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">Khối lượng:</Text>
                    <Text fw={800}>{currentRecord.quantity} {currentRecord.unit}</Text>
                  </div>
                  <div>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">Tổng tiền:</Text>
                    <Text fw={800} size="lg" c="red.7">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(currentRecord.cost))}
                    </Text>
                  </div>
                </SimpleGrid>
                <Divider />
                <div>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Ngày chứng từ:</Text>
                  <Text size="sm" fw={600}><Calendar size={14} style={{ display: 'inline', marginRight: '5px' }} /> {dayjs(currentRecord.stock_date).format('DD/MM/YYYY HH:mm')}</Text>
                </div>
                <div>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">Người mua hiện tại:</Text>
                  <Text size="sm" fw={600}><User size={14} style={{ display: 'inline', marginRight: '5px' }} /> {currentRecord.buyer_name || 'Admin'}</Text>
                </div>
              </Stack>
            ) : <Text c="dimmed">Không tìm thấy bản ghi hiện tại.</Text>}
          </Paper>

          <Card withBorder p="xl" radius="lg" className="bg-slate-50 border-slate-200">
            <Group gap="sm" mb="md">
              <History size={20} className="text-slate-400" />
              <AppTitle level={4} mb={12}>Tóm tắt biến động</AppTitle>
            </Group>
            <Text size="sm" c="dimmed" lh={1.6}>
              Trang này ghi lại toàn bộ quá trình thay đổi dữ liệu của phiếu nhập này.
              Mọi hành động chỉnh sửa của quản trị viên đều được hệ thống "chụp ảnh" lại trạng thái cũ
              để phục vụ việc đối soát và minh bạch tài chính.
            </Text>
            <Button fullWidth mt="xl" variant="light" onClick={() => router.push('/stock')}>Quay lại bảng chính</Button>
          </Card>
        </Stack>

        {/* Right: History Timeline */}
        <Box style={{ gridColumn: 'span 2' }}>
          <Card withBorder radius="lg" p="xl" shadow="md" className="bg-white border-slate-100 min-h-[500px]">
            <Group justify="space-between" mb="xl">
              <AppTitle level={3}>Dòng thời gian chỉnh sửa</AppTitle>
              <Badge variant="outline" size="lg">{historyData.length} Bản ghi lịch sử</Badge>
            </Group>

            {historyData.length === 0 ? (
              <Center h={400} className="bg-slate-50 rounded-xl flex-col gap-4 border-2 border-dashed border-slate-100">
                <History size={60} className="text-slate-200" />
                <Text c="dimmed" fw={600}>Phiếu này chưa từng bị chỉnh sửa.</Text>
              </Center>
            ) : (
              <Timeline active={historyData.length} bulletSize={32} lineWidth={3} color="brand">
                {historyData.map((h: any) => (
                  <Timeline.Item
                    key={h.id}
                    bullet={<FileText size={16} />}
                    title={
                      <Group justify="space-between" align="center" style={{ width: '100%' }}>
                        <Text fw={800} size="md">Thay đổi lúc: {dayjs(h.change_date).format('DD/MM/YYYY HH:mm:ss')}</Text>
                        <Badge color="brand" variant="light">SỬA BỞI: {h.updated_by || 'Admin'}</Badge>
                      </Group>
                    }
                  >
                    <Card withBorder p="lg" radius="md" mt="md" bg="slate.0" shadow="xs" className="border-slate-100">
                      <SimpleGrid cols={2} spacing="xl">
                        <Box>
                          <Text size="xs" fw={700} c="brand" tt="uppercase" mb={4}>TÊN HÀNG CŨ:</Text>
                          <Text fw={700} className="text-slate-800 p-2 rounded" style={{ background: 'var(--brand-primary-soft)' }}>{h.old_item_name}</Text>
                        </Box>
                        <Box>
                          <Text size="xs" fw={700} c="red" tt="uppercase" mb={4}>GIÁ TIỀN CŨ:</Text>
                          <Text fw={800} className="text-red-700 p-2 bg-red-50/50 rounded">{new Intl.NumberFormat('vi-VN').format(h.old_unit_price)} đ</Text>
                        </Box>
                        <Box>
                          <Text size="xs" fw={700} c="gray" tt="uppercase" mb={4}>KHỐI LƯỢNG:</Text>
                          <Text fw={600}>{h.old_quantity} {h.old_unit}</Text>
                        </Box>
                        <Box>
                          <Text size="xs" fw={700} c="gray" tt="uppercase" mb={4}>NGƯỜI ĐI MUA:</Text>
                          <Text fw={600}>{h.old_buyer_name || 'Admin'}</Text>
                        </Box>
                        <Box style={{ gridColumn: 'span 2' }}>
                          <Text size="xs" fw={700} c="gray" tt="uppercase" mb={4}>NHÀ CUNG CẤP CŨ:</Text>
                          <Text size="sm">{h.old_supplier || '-'}</Text>
                        </Box>
                      </SimpleGrid>
                    </Card>
                  </Timeline.Item>
                ))}
                <Timeline.Item
                  bullet={<CheckCircle2 size={18} className="text-green-500" />}
                  title={<Text fw={900} c="green" size="lg">BẢN GHI HIỆN TẠI (XUYÊN SUỐT)</Text>}
                >
                  <Text size="xs" c="green" fw={700}>Đây là dữ liệu chính đang được sử dụng để báo cáo doanh thu.</Text>
                </Timeline.Item>
              </Timeline>
            )}
          </Card>
        </Box>
      </SimpleGrid>
    </Stack>
  );
}

// Nhật ký thay đổi hoàn tất.
