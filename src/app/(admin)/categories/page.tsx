'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import https from '@/api/https';
import { 
  Button, Table, Group, ActionIcon, Modal, TextInput, 
  Textarea, Card, Text, Stack, Tooltip 
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Plus, Edit, Trash2, FolderTree, RefreshCcw, Layers } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { SectionLoader } from '@/components/common/GlobalLoading';

// Reusable Components
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { ServiceDataTable } from '@/components/admin/ui/ServiceDataTable';
import { AppTitle } from '@/components/common/AppTitle';

interface Category {
  id: number;
  category_name: string;
  description: string;
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const { data: rawCategories = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await https.get('/categories')).data?.data || []
  });

  const categories: Category[] = rawCategories;

  const saveMutation = useMutation({
    mutationFn: async (cat: Partial<Category>) => {
      if (cat.id) return https.put(`/categories/${cat.id}`, cat);
      return https.post('/categories', cat);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      notifications.show({ title: 'Thành công', message: 'Danh mục đã được lưu!', color: 'green' });
      handleClose();
    },
    onError: (error: any) => {
      notifications.show({ title: 'Lỗi', message: error.response?.data?.message || 'Không thể lưu', color: 'red' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => https.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      notifications.show({ title: 'Đã xoá', message: 'Danh mục đã bị xoá.', color: 'orange' });
    }
  });

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.category_name);
    setDescription(cat.description || '');
    open();
  };

  const handleClose = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveMutation.mutate({ id: editingCategory?.id, category_name: name, description });
  };

  const tableColumns = [
    { key: 'id', label: 'ID', width: 80 },
    { key: 'name', label: 'Tên danh mục', width: 240 },
    { key: 'description', label: 'Mô tả chi tiết' },
    { key: 'actions', label: 'Thao tác', width: 120 },
  ];

  if (isLoading && !isRefetching) return <SectionLoader />;

  return (
    <Stack gap="xl">
      <PageHeader 
        title="Quản lý Danh mục" 
        description="Phân loại các nhóm sản phẩm để quản lý thực đơn hiệu quả hơn."
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Danh mục' }]}
        actions={
          <Group gap="sm">
            <ActionIcon variant="light" color="brand" size="36px" radius="md" onClick={() => refetch()} loading={isRefetching}>
              <RefreshCcw size={18} />
            </ActionIcon>
            <Button leftSection={<Plus size={18} />} color="brand" onClick={open} radius="md" fw={800}>
               Thêm danh mục
            </Button>
          </Group>
        }
      />

      <ServiceDataTable 
        columns={tableColumns} 
        data={categories}
        isLoading={isLoading}
        renderRow={(c) => (
          <Table.Tr key={c.id}>
            <Table.Td>
              <Text fw={800} size="sm" c="dimmed">#{c.id}</Text>
            </Table.Td>
            <Table.Td>
              <Group gap="sm">
                <FolderTree size={16} color="var(--brand-primary)" />
                <Text fw={700} style={{ color: '#1E293B' }}>{c.category_name}</Text>
              </Group>
            </Table.Td>
            <Table.Td>
              <Text size="sm" c="dimmed" fw={500} lineClamp={1}>
                {c.description || 'Chưa có thông tin mô tả cho nhóm này.'}
              </Text>
            </Table.Td>
            <Table.Td>
              <Group gap="xs" justify="center">
                <Tooltip label="Chỉnh sửa">
                  <ActionIcon variant="light" color="brand" radius="md" onClick={() => handleOpenEdit(c)}>
                    <Edit size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Xoá">
                  <ActionIcon variant="light" color="red" radius="md" onClick={() => modals.openConfirmModal({
                    title: 'Xoá danh mục',
                    children: <Text size="sm">Bạn có chắc chắn muốn xoá danh mục {c.category_name}? Các sản phẩm thuộc danh mục này sẽ mất liên kết.</Text>,
                    labels: { confirm: 'Xoá ngay', cancel: 'Huỷ' },
                    confirmProps: { color: 'red' },
                    onConfirm: () => deleteMutation.mutate(c.id)
                  })}>
                    <Trash2 size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Table.Td>
          </Table.Tr>
        )}
      />

      <Modal opened={opened} onClose={handleClose} centered radius="24px" title={<AppTitle level={3}>{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}</AppTitle>}>
        <form onSubmit={handleSubmit}>
          <Stack gap="lg" p="md">
            <TextInput
              label="Tên danh mục"
              placeholder="VD: Cà phê, Trà sữa, Bánh ngọt..."
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              radius="md"
              leftSection={<Layers size={16} color="#94A3B8" />}
            />
            <Textarea
              label="Mô tả"
              placeholder="Điền ghi chú cho phân loại này..."
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              radius="md"
              minRows={3}
            />
            <Group grow mt="md">
               <Button variant="subtle" color="gray" onClick={handleClose} radius="xl" fw={700}>Bỏ qua</Button>
               <Button type="submit" color="brand" radius="xl" fw={900} h={48} loading={saveMutation.isPending} className="shadow-lg">
                  Lưu danh mục
               </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
