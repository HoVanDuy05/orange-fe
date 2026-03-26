'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import https from '@/api/https';
import { Title, Button, Table, Group, ActionIcon, Modal, TextInput, Textarea, Card, Center, Loader, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { SectionLoader } from '@/components/common/GlobalLoading';

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

  const { data: rawCategories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await https.get('/categories');
      return res.data;
    }
  });

  const categories = Array.isArray(rawCategories) ? rawCategories : (rawCategories?.data || []);

  // Lưu (Thêm/Sửa)
  const saveMutation = useMutation({
    mutationFn: async (cat: Partial<Category>) => {
      if (cat.id) {
        return https.put(`/categories/${cat.id}`, cat);
      }
      return https.post('/categories', cat);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      notifications.show({ title: 'Thành công', message: 'Đã lưu danh mục!', color: 'green' });
      handleClose();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Không thể lưu danh mục.';
      notifications.show({ title: 'Lỗi', message: msg, color: 'red' });
    }
  });

  // Xóa
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => https.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      notifications.show({ title: 'Đã xoá', message: 'Danh mục đã bị xoá.', color: 'blue' });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Không thể xoá danh mục.';
      notifications.show({ title: 'Lỗi', message: msg, color: 'red' });
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
    saveMutation.mutate({
      id: editingCategory?.id,
      category_name: name,
      description
    });
  };

  if (isLoading) return <SectionLoader />;

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <Title order={2} className="text-blue-900 border-b-2 border-blue-200 pb-2">
          Quản lý Danh mục
        </Title>
        <Button
          leftSection={<Plus size={16} />}
          color="blue"
          onClick={open}
          className="shadow-sm"
        >
          Thêm Mới
        </Button>
      </Group>

      <Card withBorder shadow="sm" radius="md" padding="0" className="bg-white border-blue-100 overflow-hidden">
        <Table verticalSpacing="sm" striped>
          <Table.Thead className="bg-slate-50">
            <Table.Tr>
              <Table.Th className="text-blue-800">ID</Table.Th>
              <Table.Th className="text-blue-800">Tên Danh Mục</Table.Th>
              <Table.Th className="text-blue-800">Mô Tả</Table.Th>
              <Table.Th className="text-blue-800" w={100}>Thao Tác</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {categories.map((c: Category) => (
              <Table.Tr key={c.id}>
                <Table.Td fw={500}>{c.id}</Table.Td>
                <Table.Td>{c.category_name}</Table.Td>
                <Table.Td c="dimmed">{c.description || 'Không có mô tả'}</Table.Td>
                <Table.Td>
                  <Group gap={5}>
                    <ActionIcon variant="subtle" color="blue" onClick={() => handleOpenEdit(c)}>
                      <Edit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => modals.openConfirmModal({
                        title: 'Xác nhận xoá',
                        children: (
                          <Text size="sm">Bạn có chắc chắn muốn xoá danh mục "{c.category_name}"? Hành động này không thể hoàn tác.</Text>
                        ),
                        labels: { confirm: 'Xoá ngay', cancel: 'Hủy thao tác' },
                        confirmProps: { color: 'red' },
                        onConfirm: () => deleteMutation.mutate(c.id)
                      })}
                    >
                      <Trash2 size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Modal Thêm/Sửa */}
      <Modal opened={opened} onClose={handleClose} title={<Text fw={700} size="lg">{editingCategory ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới'}</Text>}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextInput
            label="Tên Danh Mục"
            placeholder="Ví dụ: Đồ ăn, Thức uống,..."
            required
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <Textarea
            label="Mô Tả"
            placeholder="Điền mô tả thêm về danh mục này"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
          />
          <Button fullWidth type="submit" loading={saveMutation.isPending} color="blue" mt="md">
            Lưu Danh Mục
          </Button>
        </form>
      </Modal>
    </div>
  );
}
