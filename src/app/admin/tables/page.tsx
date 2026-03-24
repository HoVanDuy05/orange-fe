'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import https from '@/api/https';
import { Title, Button, Table, Group, ActionIcon, Modal, TextInput, Select, Card, Center, Loader, Badge, SimpleGrid, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Plus, Edit, Trash2, Sofa } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { SectionLoader } from '@/components/common/GlobalLoading';

interface DiningTable {
  id: number;
  table_name: string;
  table_status: string;
}

export default function TablesPage() {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingTable, setEditingTable] = useState<DiningTable | null>(null);
  
  const [name, setName] = useState('');
  const [status, setStatus] = useState<string>('empty');

  const { data: rawTables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const res = await https.get('/tables');
      return res.data;
    }
  });

  const tables = Array.isArray(rawTables) ? rawTables : (rawTables?.data || []);

  const saveMutation = useMutation({
    mutationFn: async (tbl: Partial<DiningTable>) => {
      if (tbl.id) {
        return https.put(`/tables/${tbl.id}`, tbl);
      }
      return https.post('/tables', tbl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      notifications.show({ title: 'Thành công', message: 'Thông tin bàn đã cập nhật', color: 'green' });
      handleClose();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Không thể lưu bàn.';
      notifications.show({ title: 'Lỗi', message: msg, color: 'red' });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: number, newStatus: string }) => {
      return https.patch(`/tables/${id}/status`, { table_status: newStatus });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tables'] })
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => https.delete(`/tables/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      notifications.show({ title: 'Đã xoá', message: 'Bàn đã bị xoá.', color: 'blue' });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Không thể xoá bàn.';
      notifications.show({ title: 'Lỗi', message: msg, color: 'red' });
    }
  });

  const handleOpenEdit = (tbl: DiningTable) => {
    setEditingTable(tbl);
    setName(tbl.table_name);
    setStatus(tbl.table_status);
    open();
  };

  const handleClose = () => {
    setEditingTable(null);
    setName('');
    setStatus('empty');
    close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveMutation.mutate({ 
      id: editingTable?.id, 
      table_name: name, 
      table_status: status 
    });
  };

  const getStatusColor = (ts: string) => {
    switch (ts) {
      case 'empty': return 'green';
      case 'occupied': return 'red';
      case 'reserved': return 'orange';
      default: return 'gray';
    }
  };

  if (isLoading) return <SectionLoader />;

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <Title order={2} className="text-blue-900 border-b-2 border-blue-200 pb-2">
          Sơ đồ & Định dạng Bàn
        </Title>
        <Button 
          leftSection={<Plus size={16} />} 
          color="blue" 
          onClick={open}
          className="shadow-sm"
        >
          Thêm Bàn
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="lg">
        {tables.map((t: DiningTable) => (
           <Card key={t.id} withBorder shadow="sm" radius="md" padding="lg" className="bg-white border-blue-100 hover:shadow-md transition-shadow">
             <Group justify="space-between" mb="xs">
                <Group gap="xs">
                   <div className={`p-2 rounded-full bg-${getStatusColor(t.table_status)}-100`}>
                      <Sofa size={20} className={`text-${getStatusColor(t.table_status)}-600`} />
                   </div>
                   <Title order={5} className="text-slate-800">{t.table_name}</Title>
                </Group>
             </Group>
             <Group justify="space-between" mt="md">
                <Badge variant="light" color={getStatusColor(t.table_status)} size="lg">
                   {t.table_status === 'empty' ? 'Trống' : t.table_status === 'occupied' ? 'Đang dùng' : 'Đã Đặt'}
                </Badge>
                <Group gap="xs">
                   <ActionIcon variant="light" color="blue" onClick={() => handleOpenEdit(t)}>
                     <Edit size={16} />
                   </ActionIcon>
                   <ActionIcon variant="light" color="red" onClick={() => modals.openConfirmModal({
                     title: 'Xóa bàn ăn',
                     children: (<Text size="sm">Bạn có chắc chắn muốn xoá bàn {t.table_name}?</Text>),
                     labels: { confirm: 'Chắc chắn xoá', cancel: 'Hủy' },
                     confirmProps: { color: 'red' },
                     onConfirm: () => deleteMutation.mutate(t.id)
                   })}>
                     <Trash2 size={16} />
                   </ActionIcon>
                </Group>
             </Group>
           </Card>
        ))}
      </SimpleGrid>

      <Modal opened={opened} onClose={handleClose} title={<Text fw={700} size="lg">{editingTable ? 'Cập nhật thông tin bàn' : 'Thêm bàn mới'}</Text>}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextInput 
            label="Tên/Số Bàn" 
            placeholder="Ví dụ: Bàn 5, Khu VIP 2..." 
            required 
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <Select
            label="Trạng thái khởi tạo"
            value={status}
            onChange={(val) => setStatus(val || 'empty')}
            data={[
              { value: 'empty', label: 'Bàn Trống (Empty)' },
              { value: 'occupied', label: 'Đang Có Khách (Occupied)' },
              { value: 'reserved', label: 'Đã Đặt Trước (Reserved)' },
            ]}
          />
          <Button fullWidth type="submit" loading={saveMutation.isPending} color="blue" mt="md">
            Luư Thông Tin Bàn
          </Button>
        </form>
      </Modal>
    </div>
  );
}
