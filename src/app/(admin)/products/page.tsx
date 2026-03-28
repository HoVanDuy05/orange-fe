'use client';

import React, { useState } from 'react';
import { 
  Button, Group, ActionIcon, TextInput, NumberInput, 
  Card, Text, Badge, Stack, SimpleGrid, Select, Image, 
  Center, Box, Paper, UnstyledButton, Tooltip, Textarea, Table, rem,
  Pagination
} from '@mantine/core';
import { AppModal } from '@/components/common/AppModal';
import { useDisclosure } from '@mantine/hooks';
import { 
  Plus, Trash2, Edit, Utensils, Tag, 
  DollarSign, ImageIcon, Upload, Search, 
  RefreshCcw, Layers, Star, TrendingUp
} from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { SectionLoader } from '@/components/common/GlobalLoading';
import MediaLibraryModal from '@/components/common/MediaLibraryModal';

import { PageHeader } from '@/components/admin/ui/PageHeader';
import { ServiceDataTable } from '@/components/admin/ui/ServiceDataTable';
import { useBrandTheme } from '@/providers/BrandThemeProvider';
import { AppTitle } from '@/components/common/AppTitle';
import { ActionButton } from '@/components/common/ActionButton';

import { useProducts } from '@/hooks/useProducts';
import { Product, Category } from '@/types/pos';
import { formatCurrency } from '@/utils/format';

export default function ProductsPage() {
  const { activeTheme } = useBrandTheme();
  const primaryColor = activeTheme?.primary_color || '#FF6B00';
  const [opened, { open, close }] = useDisclosure(false);
  const [mediaOpened, { open: openMedia, close: closeMedia }] = useDisclosure(false);

  const { 
    state: { categories, products, isLoading, isRefetching, isSaving, page, totalPages, search, filterCat, total },
    actions: { refetch, saveProduct, deleteProduct, setPage, setSearch, setFilterCat }
  } = useProducts();

  // Form States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [discountPrice, setDiscountPrice] = useState<number | ''>('');
  
  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.product_name);
    setPrice(Number(prod.price));
    setCategoryId(prod.category_id?.toString());
    setImageUrl(prod.image_url || '');
    setDescription(prod.description || '');
    setDiscountPrice(prod.discount_price ? Number(prod.discount_price) : '');
    open();
  };

  const handleClose = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setCategoryId(undefined);
    setImageUrl('');
    setDescription('');
    setDiscountPrice('');
    handleCloseForm();
  };

  const handleCloseForm = () => close();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) return;
    
    saveProduct({
      id: editingProduct?.id,
      payload: {
        product_name: name,
        price: Number(price),
        category_id: categoryId,
        image_url: imageUrl,
        description,
        discount_price: discountPrice === '' ? undefined : Number(discountPrice),
        is_available: true
      }
    }, {
      onSuccess: () => handleClose()
    });
  };

  const tableColumns = [
    { key: 'product', label: 'Sản phẩm', width: 300 },
    { key: 'category', label: 'Danh mục', width: 140 },
    { key: 'price', label: 'Giá niêm yết', width: 160 },
    { key: 'sales', label: 'Hiệu suất', width: 140 },
    { key: 'actions', label: 'Thao tác', width: 120 },
  ];

  if (isLoading && !isRefetching) return <SectionLoader />;

  return (
    <Box p="xl">
      <Stack gap="xl">
        <PageHeader 
          title="Danh mục Sản phẩm" 
          description="Quản lý thực đơn, điều chỉnh giá và công thức món ăn của Orange."
          actions={
            <Group gap="sm">
              <ActionButton 
                type="reset" 
                variant="light" 
                onClick={() => refetch()} 
                loading={isRefetching}
                tooltip="Làm mới danh sách"
              />
              <ActionButton 
                type="add" 
                label="Thêm món ăn" 
                onClick={open} 
                fw={800} 
              />
            </Group>
          }
        />

        {/* ── Filters ── */}
        <Card withBorder radius="xl" p="md" shadow="xs" style={{ background: 'white' }}>
          <Group justify="space-between" wrap="nowrap">
            <Group gap="md" style={{ flex: 1 }}>
              <TextInput
                placeholder="Tìm kiếm món ăn..."
                leftSection={<Search size={16} color="var(--mantine-color-gray-5)" />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                radius="md"
                style={{ width: 300 }}
                styles={{ input: { border: '1px solid var(--mantine-color-gray-2)' } }}
              />
              <Select
                placeholder="Tất cả danh mục"
                data={categories.map((c: Category) => ({ value: c.id.toString(), label: c.category_name }))}
                value={filterCat}
                onChange={setFilterCat}
                radius="md"
                w={220}
                clearable
                styles={{ input: { border: '1px solid var(--mantine-color-gray-2)' } }}
                leftSection={<Layers size={16} color="var(--mantine-color-gray-5)" />}
              />
            </Group>
            <Group gap="xs">
              <Badge variant="dot" color="brand" size="lg" radius="md">{total} món ăn</Badge>
            </Group>
          </Group>
        </Card>

        {/* ── Data Table ── */}
        <ServiceDataTable 
          columns={tableColumns} 
          data={products}
          isLoading={isLoading}
          renderRow={(p) => (
            <Table.Tr key={p.id}>
              <Table.Td>
                <Group gap="md" wrap="nowrap">
                  {p.image_url ? (
                    <Image src={p.image_url} h={44} w={44} radius="lg" className="object-cover border border-slate-100" />
                  ) : (
                    <Center h={44} w={44} bg="gray.1" style={{ border: '1px solid var(--mantine-color-gray-2)', color: 'var(--mantine-color-gray-4)', borderRadius: '12px' }}>
                      <ImageIcon size={20} />
                    </Center>
                  )}
                  <Box>
                    <Text size="sm" fw={800} c="gray.8">{p.product_name}</Text>
                    <Text size="xs" c="dimmed" lineClamp={1} fw={500}>{p.description || 'Chưa có mô tả chi tiết'}</Text>
                  </Box>
                </Group>
              </Table.Td>
              <Table.Td>
                <Badge variant="light" color="indigo" radius="md" size="sm" fw={800}>{p.category_name}</Badge>
              </Table.Td>
              <Table.Td>
                <Stack gap={0}>
                  {p.discount_price ? (
                    <>
                      <Text fw={900} size="sm" c="red.6">{formatCurrency(p.discount_price)}</Text>
                      <Text size="10px" c="dimmed" td="line-through">{formatCurrency(p.price)}</Text>
                    </>
                  ) : (
                    <Text fw={900} size="sm" c="gray.9">{formatCurrency(p.price)}</Text>
                  )}
                </Stack>
              </Table.Td>
              <Table.Td>
                <Group gap={6}>
                   <TrendingUp size={14} color="var(--mantine-color-green-6)" />
                   <Text size="sm" fw={700} c="gray.8">{p.sales_count || 0}</Text>
                   <Text size="xs" c="dimmed" fw={600}>đã bán</Text>
                </Group>
              </Table.Td>
              <Table.Td>
                <Group gap="xs" wrap="nowrap" justify="center">
                   <ActionButton 
                     type="edit" 
                     onClick={() => handleOpenEdit(p)} 
                   />
                   <ActionButton 
                     type="delete" 
                     onClick={() => modals.openConfirmModal({
                        title: 'Xoá sản phẩm',
                        children: <Text size="sm">Bạn có chắc chắn muốn xoá {p.product_name}? Hành động này không thể hoàn tác.</Text>,
                        labels: { confirm: 'Xoá ngay', cancel: 'Bỏ qua' },
                        confirmProps: { color: 'red' },
                        onConfirm: () => deleteProduct(p.id)
                     })}
                   />
                </Group>
              </Table.Td>
            </Table.Tr>
          )}
        />

        {/* ── Product Form AppModal ── */}
        <AppModal
          opened={opened}
          onClose={handleClose}
          size="lg"
          title={editingProduct ? 'Cập nhật món ăn' : 'Thêm món ăn mới'}
          subtitle="Quản lý chi tiết món ăn, giá bán và hình ảnh thực đơn."
          actions={
            <>
              <Button variant="subtle" color="gray" onClick={handleClose} radius="xl" h={44} fw={800}>Hủy bỏ</Button>
              <Button 
                onClick={handleSubmit} 
                color="brand"
                h={44} radius="xl" px="xl" fw={900} 
                loading={isSaving} 
                className="shadow-lg"
                style={{ boxShadow: `0 8px 20px -6px var(--brand-primary-soft)` }}
              >
                {editingProduct ? 'Lưu thay đổi' : 'Xác nhận Thêm Món'}
              </Button>
            </>
          }
        >
          <Stack gap="xl">
            <SimpleGrid cols={1} spacing="lg">
              <Box>
                  <Text size="sm" fw={800} mb={6} c="gray.7">Thông tin cơ bản</Text>
                  <Paper withBorder radius="lg" p="lg" style={{ background: '#F8FAFC' }}>
                     <Stack gap="md">
                        <SimpleGrid cols={2} spacing="md">
                          <TextInput 
                            label="Tên sản phẩm" 
                            placeholder="VD: Cà phê sữa đá..." 
                            required 
                            value={name} onChange={(e) => setName(e.currentTarget.value)} 
                            radius="md"
                            leftSection={<Utensils size={16} color="#94A3B8" />}
                          />
                          <Select 
                            label="Danh mục" 
                            placeholder="Phân loại..." 
                            data={categories.map((c: Category) => ({ value: c.id.toString(), label: c.category_name }))} 
                            required value={categoryId} onChange={(v) => setCategoryId(v || undefined)} 
                            radius="md"
                            leftSection={<Layers size={16} color="#94A3B8" />}
                          />
                        </SimpleGrid>

                        <SimpleGrid cols={2} spacing="md">
                          <NumberInput 
                            label="Giá niêm yết" 
                            required 
                            thousandSeparator="." 
                            decimalSeparator=","
                            value={price} onChange={(v) => setPrice(v ? Number(v) : '')} 
                            radius="md"
                            leftSection={<DollarSign size={16} color="#10B981" />}
                            rightSection={<Text size="11px" fw={800} c="dimmed" pr="xs">VNĐ</Text>}
                            rightSectionWidth={52}
                            styles={{ input: { textAlign: 'right', fontWeight: 800, paddingRight: '55px' } }}
                          />
                          <NumberInput 
                            label="Giá khuyến mãi (Nếu có)" 
                            thousandSeparator="." 
                            decimalSeparator=","
                            value={discountPrice} onChange={(v) => setDiscountPrice(v ? Number(v) : '')} 
                            radius="md"
                            leftSection={<Star size={16} color="#F59E0B" />}
                            rightSection={<Text size="11px" fw={800} c="dimmed" pr="xs">VNĐ</Text>}
                            rightSectionWidth={52}
                            styles={{ input: { textAlign: 'right', fontWeight: 800, paddingRight: '55px' } }}
                          />
                        </SimpleGrid>
                     </Stack>
                  </Paper>
              </Box>

              <Box>
                  <Text size="sm" fw={800} mb={10} c="gray.7" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ImageIcon size={16} color="var(--brand-primary)" /> Hình ảnh & Mô tả
                  </Text>
                  <Paper withBorder radius="xl" p="xl" style={{ backgroundColor: '#FFFFFF', borderStyle: 'dashed', borderWidth: 2 }}>
                     <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                          <Stack gap={8}>
                            <Text size="xs" fw={800} c="dimmed" style={{ letterSpacing: '0.5px' }}>ẢNH THÀNH PHẨM</Text>
                            <UnstyledButton 
                              onClick={openMedia}
                              style={{ 
                                height: 180, 
                                borderRadius: 20, 
                                border: `2px dashed ${imageUrl ? primaryColor + '44' : '#E2E8F0'}`, 
                                background: imageUrl ? 'none' : '#F8FAFC',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'var(--brand-primary)';
                                e.currentTarget.style.backgroundColor = 'var(--brand-primary-soft)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.borderColor = imageUrl ? 'var(--brand-primary-soft)' : '#E2E8F0';
                                e.currentTarget.style.backgroundColor = imageUrl ? 'transparent' : '#F8FAFC';
                              }}
                            >
                              {imageUrl ? (
                                <>
                                  <Image src={imageUrl} h="100%" w="100%" style={{ objectFit: 'cover' }} />
                                  <Box 
                                    style={{ 
                                      position: 'absolute', 
                                      inset: 0, 
                                      background: 'rgba(0,0,0,0.5)', 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center',
                                      opacity: 0,
                                      transition: 'opacity 0.2s',
                                      backdropFilter: 'blur(4px)'
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                                  >
                                     <Stack align="center" gap={8}>
                                        <Button size="compact-xs" radius="xl" variant="white" color="brand" fw={800}>Thay đổi ảnh</Button>
                                        <Text size="10px" c="white" fw={700} style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={(e) => { e.stopPropagation(); setImageUrl(''); }}>Gỡ ảnh hiện tại</Text>
                                     </Stack>
                                  </Box>
                                </>
                              ) : (
                                <Stack align="center" gap={8}>
                                   <Box style={{ padding: 12, borderRadius: '50%', background: 'var(--brand-primary-soft)', color: 'var(--brand-primary)' }}>
                                      <Upload size={28} />
                                   </Box>
                                   <Stack gap={0} align="center">
                                      <Text size="sm" fw={800} c="gray.8">Tải ảnh món ăn</Text>
                                      <Text size="10px" c="dimmed" fw={600}>Hỗ trợ JPG, PNG, WEBP</Text>
                                   </Stack>
                                </Stack>
                              )}
                            </UnstyledButton>
                          </Stack>
                          
                          <Stack gap={8}>
                            <Text size="xs" fw={800} c="dimmed" style={{ letterSpacing: '0.5px' }}>GIỚI THIỆU MÓN</Text>
                            <Textarea 
                              placeholder="Nhập mô tả hấp dẫn cho món ăn, thành phần chính, cách chế biến để thu hút khách hàng..." 
                              value={description} onChange={(e) => setDescription(e.currentTarget.value)} 
                              radius="lg"
                              minRows={6}
                              styles={{ 
                                input: { 
                                  height: 180, 
                                  fontSize: rem(14), 
                                  fontWeight: 500,
                                  border: '2px solid #F1F5F9',
                                  backgroundColor: '#F8FAFC',
                                  '&:focus': { borderColor: primaryColor }
                                } 
                              }}
                            />
                          </Stack>
                     </SimpleGrid>
                  </Paper>
              </Box>
            </SimpleGrid>
          </Stack>
        </AppModal>

        <MediaLibraryModal opened={mediaOpened} onClose={closeMedia} onSelect={(url) => setImageUrl(url)} currentImageUrl={imageUrl} />
        
        {totalPages > 1 && (
          <Group justify="center" mt="xl" pb="xl">
            <Pagination 
              total={totalPages} 
              value={page} 
              onChange={setPage} 
              color="brand" 
              radius="xl" 
              size="lg"
              withEdges
              styles={{
                control: { fontWeight: 800, border: '1px solid #E2E8F0' }
              }}
            />
          </Group>
        )}
      </Stack>
    </Box>
  );

}
