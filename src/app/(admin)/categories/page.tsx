'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import https from '@/api/https';
import { 
  Button, Table, Group, Text, Stack, Box, Avatar, TextInput, Textarea,
  UnstyledButton, Image, Center
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Layers, FolderTree, ImageIcon, Upload } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { SectionLoader } from '@/components/common/GlobalLoading';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { ServiceDataTable } from '@/components/admin/ui/ServiceDataTable';
import { ActionButton } from '@/components/common/ActionButton';
import { AppModal } from '@/components/common/AppModal';
import MediaLibraryModal from '@/components/common/MediaLibraryModal';
import { useBrandTheme } from '@/providers/BrandThemeProvider';

interface Category {
  id: number;
  category_name: string;
  description: string;
  image_url?: string;
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { activeTheme } = useBrandTheme();
  const primaryColor = activeTheme?.primary_color || '#FF6B00';

  const [opened, { open, close }] = useDisclosure(false);
  const [mediaOpened, { open: openMedia, close: closeMedia }] = useDisclosure(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

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
    setImageUrl(cat.image_url || '');
    open();
  };

  const handleClose = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageUrl('');
    close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveMutation.mutate({ 
      id: editingCategory?.id, 
      category_name: name, 
      description,
      image_url: imageUrl || undefined
    });
  };

  const tableColumns = [
    { key: 'id', label: 'ID', width: 60 },
    { key: 'image', label: 'Ảnh', width: 80 },
    { key: 'name', label: 'Tên danh mục', width: 200 },
    { key: 'description', label: 'Mô tả' },
    { key: 'actions', label: 'Thao tác', width: 120 },
  ];

  if (isLoading && !isRefetching) return <SectionLoader />;

  return (
    <Box p={{ base: 'md', sm: 'xl' }}>
      <Stack gap="xl">
        <PageHeader 
          title="Quản lý Danh mục" 
          description="Phân loại các nhóm sản phẩm để quản lý thực đơn hiệu quả hơn."
          breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Danh mục' }]}
          actions={
            <Group gap="sm">
              <ActionButton 
                type="reset" 
                variant="light" 
                onClick={() => refetch()} 
                loading={isRefetching} 
                tooltip="Làm mới"
              />
              <ActionButton 
                type="add" 
                label="Thêm danh mục" 
                onClick={open} 
                fw={800} 
              />
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
                <Avatar
                  src={c.image_url || undefined}
                  size={44}
                  radius="xl"
                  color="brand"
                  variant={c.image_url ? 'transparent' : 'light'}
                >
                  <FolderTree size={20} />
                </Avatar>
              </Table.Td>
              <Table.Td>
                <Text fw={700} style={{ color: '#1E293B' }}>{c.category_name}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed" fw={500} lineClamp={1}>
                  {c.description || '—'}
                </Text>
              </Table.Td>
              <Table.Td>
                <Group gap="xs" justify="center">
                  <ActionButton type="edit" onClick={() => handleOpenEdit(c)} />
                  <ActionButton 
                    type="delete" 
                    onClick={() => modals.openConfirmModal({
                      title: 'Xoá danh mục',
                      children: <Text size="sm">Bạn có chắc chắn muốn xoá <b>{c.category_name}</b>?</Text>,
                      labels: { confirm: 'Xoá ngay', cancel: 'Huỷ' },
                      confirmProps: { color: 'red' },
                      onConfirm: () => deleteMutation.mutate(c.id)
                    })}
                  />
                </Group>
              </Table.Td>
            </Table.Tr>
          )}
        />

        {/* CATEGORY FORM MODAL */}
        <AppModal 
          opened={opened} 
          onClose={handleClose} 
          title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
          subtitle="Phân loại nhóm sản phẩm giúp việc chọn món trở nên dễ dàng hơn."
          actions={
            <>
               <Button variant="subtle" color="gray" onClick={handleClose} radius="xl" fw={700}>Bỏ qua</Button>
               <Button onClick={handleSubmit} color="brand" radius="xl" fw={900} h={48} loading={saveMutation.isPending}>
                  Lưu danh mục
               </Button>
            </>
          }
        >
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

            {/* Ảnh — dùng MediaLibrary giống Products */}
            <Box>
              <Text size="sm" fw={800} mb={8} c="gray.7">Ảnh danh mục</Text>
              <UnstyledButton
                onClick={openMedia}
                style={{
                  width: '100%',
                  height: 160,
                  borderRadius: 16,
                  border: `2px dashed ${imageUrl ? primaryColor + '66' : '#E2E8F0'}`,
                  background: imageUrl ? 'none' : '#F8FAFC',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
              >
                {imageUrl ? (
                  <Image src={imageUrl} h="100%" w="100%" style={{ objectFit: 'cover' }} />
                ) : (
                  <Stack align="center" gap={8}>
                    <Center
                      w={48} h={48}
                      style={{ borderRadius: 12, backgroundColor: '#F1F5F9' }}
                    >
                      <Upload size={22} color="#94A3B8" />
                    </Center>
                    <Text size="xs" fw={700} c="dimmed">Chọn ảnh từ thư viện</Text>
                    <Text size="10px" c="dimmed">Ảnh tròn hiển thị trên app · Tỷ lệ 1:1</Text>
                  </Stack>
                )}
              </UnstyledButton>
            </Box>

            <Textarea
              label="Mô tả"
              placeholder="Điền ghi chú cho phân loại này..."
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              radius="md"
              minRows={3}
            />
          </Stack>
        </AppModal>

        {/* MEDIA LIBRARY */}
        <MediaLibraryModal
          opened={mediaOpened}
          onClose={closeMedia}
          onSelect={(url: string) => {
            setImageUrl(url);
            closeMedia();
          }}
        />
      </Stack>
    </Box>
  );
}
