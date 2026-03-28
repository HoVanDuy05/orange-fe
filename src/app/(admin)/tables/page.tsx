'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import https from '@/api/https';
import { 
  Button, Group, ActionIcon, Modal, TextInput, 
  Card, Badge, SimpleGrid, Text, Stack, Box, 
  Tooltip, Indicator
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  Plus, Edit, Trash2, Armchair, 
  RefreshCcw, Coffee
} from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { SectionLoader } from '@/components/common/GlobalLoading';

// Reusable Components
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { AppTitle } from '@/components/common/AppTitle';
import { ActionButton } from '@/components/common/ActionButton';

interface DiningTable {
  id: number;
  table_name: string;
  table_status: string;
  is_occupied?: boolean; // Computed field from backend
}

export default function TablesPage() {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingTable, setEditingTable] = useState<DiningTable | null>(null);
  const [name, setName] = useState('');

  const { data: rawTables = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => (await https.get('/tables')).data?.data || []
  });

  const tables: DiningTable[] = rawTables;

  const saveMutation = useMutation({
    mutationFn: async (tbl: Partial<DiningTable>) => {
      if (tbl.id) return https.put(`/tables/${tbl.id}`, tbl);
      return https.post('/tables', tbl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      notifications.show({ title: 'Thành công', message: 'Sơ đồ bàn đã được cập nhật', color: 'green' });
      handleClose();
    },
    onError: (error: any) => {
      notifications.show({ title: 'Lỗi', message: error.response?.data?.message || 'Không thể lưu', color: 'red' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => https.delete(`/tables/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      notifications.show({ title: 'Đã xoá', message: 'Bàn đã được gỡ bỏ khỏi hệ thống', color: 'orange' });
    }
  });

  const handleOpenEdit = (tbl: DiningTable) => {
    setEditingTable(tbl);
    setName(tbl.table_name);
    open();
  };

  const handleClose = () => {
    setEditingTable(null);
    setName('');
    close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveMutation.mutate({ id: editingTable?.id, table_name: name });
  };

  if (isLoading && !isRefetching) return <SectionLoader />;

  return (
    <Stack gap="xl">
      <PageHeader 
        title="Quản lý Bàn phục vụ" 
        description="Theo dõi tình trạng bàn trống và sơ đồ các khu vực phục vụ tại quán."
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Bàn phục vụ' }]}
        actions={
          <Group gap="sm">
            <ActionButton 
              type="reset" 
              variant="light" 
              onClick={() => refetch()} 
              loading={isRefetching}
              tooltip="Làm mới sơ đồ"
            />
            <ActionButton 
              type="add" 
              label="Thêm bàn mới" 
              onClick={open} 
              fw={800} 
            />
          </Group>
        }
      />

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
        {tables.map((t) => {
          const isOccupied = t.table_status === 'occupied' || t.is_occupied;
          return (
            <Card 
              key={t.id} 
              withBorder 
              radius="24px" 
              p="xl" 
              style={{ 
                background: 'white',
                border: isOccupied ? '1px solid #FF6B0030' : '1px solid #E2E8F0',
                transition: 'all 0.2s ease',
              }}
              className="group hover:shadow-lg hover:-translate-y-1"
            >
              <Stack align="center" gap="md">
                <Indicator 
                   color={isOccupied ? 'red' : 'green'} 
                   size={12} 
                   offset={4} 
                   processing={isOccupied}
                   styles={{ indicator: { border: '2px solid white' } }}
                >
                  <Box 
                    style={{ 
                      width: 64, height: 64, borderRadius: 20, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isOccupied ? 'rgba(255,107,0,0.08)' : 'rgba(241,245,249,1)',
                      color: isOccupied ? '#FF6B00' : '#94A3B8'
                    }}
                  >
                    {isOccupied ? <Coffee size={32} /> : <Armchair size={32} />}
                  </Box>
                </Indicator>

                <Box style={{ textAlign: 'center' }}>
                  <Text size="lg" fw={900} style={{ color: '#1E293B', letterSpacing: '-0.02em' }}>
                    {t.table_name}
                  </Text>
                  <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts="0.05em">
                    {isOccupied ? 'Đang có khách' : 'Đang còn trống'}
                  </Text>
                </Box>

                <Group gap="xs" mt="xs">
                   <ActionButton 
                     type="edit" 
                     onClick={() => handleOpenEdit(t)} 
                   />
                   <ActionButton 
                     type="delete" 
                     onClick={() => modals.openConfirmModal({
                       title: 'Xoá bàn phục vụ',
                       children: <Text size="sm">Bạn có chắc chắn muốn xoá {t.table_name}? Lưu ý: Không thể xoá bàn đang có hoá đơn chưa thanh toán.</Text>,
                       labels: { confirm: 'Xoá ngay', cancel: 'Bỏ qua' },
                       confirmProps: { color: 'red' },
                       onConfirm: () => deleteMutation.mutate(t.id)
                     })}
                   />
                </Group>
              </Stack>

              {isOccupied && (
                 <Box style={{ position: 'absolute', top: 12, right: 12 }}>
                    <Badge size="xs" color="red" variant="light" fw={800}>LIVE</Badge>
                 </Box>
              )}
            </Card>
          );
        })}
      </SimpleGrid>

      {/* ── Table CRUD Modal ── */}
      <Modal opened={opened} onClose={handleClose} centered radius="24px" title={<AppTitle level={3}>{editingTable ? 'Cập nhật bàn' : 'Thiết lập bàn mới'}</AppTitle>}>
        <form onSubmit={handleSubmit}>
          <Stack gap="lg" p="md">
            <TextInput 
              label="Tên / Số hiệu bàn" 
              placeholder="Ví dụ: Bàn 01, Khu VIP 2..." 
              required 
              autoFocus
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              radius="md"
              leftSection={<Armchair size={16} color="#94A3B8" />}
            />
            
            <Group grow mt="md">
               <Button variant="subtle" color="gray" onClick={handleClose} radius="xl" fw={700}>Bỏ qua</Button>
               <Button type="submit" color="brand" radius="xl" fw={900} h={48} loading={saveMutation.isPending}>
                  Lưu thiết lập
               </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
