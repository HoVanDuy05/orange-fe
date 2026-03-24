'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import https from '@/api/https';
import { Title, Button, Group, ActionIcon, Modal, TextInput, NumberInput, Card, Text, Badge, Stack, SimpleGrid, Select, Image, Center, Box, Paper, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Plus, Trash2, Edit, Utensils, Tag, Info, DollarSign, Image as ImageIcon, Upload, ShoppingBag, Search } from 'lucide-react';
import { TextInput as MantineTextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { SectionLoader } from '@/components/common/GlobalLoading';
import MediaLibraryModal from '@/components/common/MediaLibraryModal';
import { DynamicTable, TableColumn } from '@/components/common/DynamicTable';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [mediaOpened, { open: openMedia, close: closeMedia }] = useDisclosure(false);

  // States
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [discountPrice, setDiscountPrice] = useState<number | ''>('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  // Filter & Search
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // Fetching
  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await https.get('/categories');
      return Array.isArray(res.data) ? res.data : res.data.data;
    }
  });

  const { data: products = [], isLoading: prodLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await https.get('/products');
      return Array.isArray(res.data) ? res.data : res.data.data;
    }
  });

  const isLoading = catLoading || prodLoading;

  // Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingProduct) return https.put(`/products/${editingProduct.id}`, payload);
      return https.post('/products', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      notifications.show({ title: 'Thành công', message: editingProduct ? 'Đã sửa món ăn' : 'Đã thêm món mới', color: 'green' });
      handleClose();
    },
    onError: (error: any) => {
      notifications.show({ title: 'Lỗi', message: error.response?.data?.message || 'Có lỗi xảy ra', color: 'red' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => https.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      notifications.show({ title: 'Xoá thành công', message: 'Món ăn đã bị gỡ bỏ', color: 'orange' });
    }
  });

  const handleOpenEdit = (prod: any) => {
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
    setCategoryId(null);
    setImageUrl('');
    setDescription('');
    setDiscountPrice('');
    setFormSubmitted(false);
    close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    if (!name || !price || !categoryId) return;
    saveMutation.mutate({ 
      product_name: name, 
      price: Number(price), 
      category_id: categoryId, 
      image_url: imageUrl, 
      description,
      discount_price: discountPrice ? Number(discountPrice) : null,
    });
  };

  // Rendering Helper
  const categoryData = Array.isArray(categories) ? categories : (categories?.data || []);
  const productsWithCatName = Array.isArray(products) ? products.map((p: any) => ({
    ...p,
    category_name: categoryData.find((c: any) => c.id === p.category_id)?.category_name || 'N/A'
  })) : [];

  // Filtered result
  const filteredProducts = productsWithCatName
    .filter((p: any) => !filterCategory || p.category_id?.toString() === filterCategory)
    .filter((p: any) => !searchText || p.product_name?.toLowerCase().includes(searchText.toLowerCase()));

  // Table Columns
  const columns: TableColumn<any>[] = [
    { 
       key: 'image_url', 
       label: 'Ảnh', 
       type: 'action',
       width: 80,
       render: (p) => p.image_url ? (
          <Image src={p.image_url} alt="img" width={40} height={40} radius="sm" className="object-cover w-10 h-10 border border-slate-200" />
       ) : <Center className="w-10 h-10 bg-slate-50 border rounded-sm"><ImageIcon size={14} className="text-slate-200" /></Center>
    },
    { 
       key: 'product_name', 
       label: 'Tên món ăn', 
       type: 'text',
       render: (p) => <Text fw={700} className="text-blue-900">{p.product_name}</Text>
    },
    { 
       key: 'category_name', 
       label: 'Danh mục', 
       type: 'action',
       render: (p) => <Badge color="indigo" variant="light">{p.category_name}</Badge>
    },
    { 
       key: 'price', 
       label: 'Giá bán', 
       type: 'price',
       render: (p) => (
         <Stack gap={0}>
           {p.discount_price ? (
             <>
               <Text fw={800} c="red" size="sm">
                 {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(p.discount_price))}
               </Text>
               <Text size="xs" c="dimmed" td="line-through">
                 {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(p.price))}
               </Text>
             </>
           ) : (
             <Text fw={800} c="blue">
               {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(p.price))}
             </Text>
           )}
         </Stack>
       )
    },
    {
       key: 'sales_count',
       label: 'Đã bán',
       type: 'number',
       render: (p) => <Badge variant="dot" color="teal" size="sm">{p.sales_count || 0} lượt</Badge>
    },
    { 
       key: 'description', 
       label: 'Mô tả', 
       type: 'text',
       render: (p) => <Text size="xs" c="dimmed" lineClamp={1}>{p.description || '-'}</Text>
    },
    { 
       key: 'actions', 
       label: 'Hành động', 
       type: 'action',
       render: (p) => (
         <Group gap={4} justify="center">
            <ActionIcon variant="subtle" color="blue" radius="md" onClick={() => handleOpenEdit(p)}><Edit size={16} /></ActionIcon>
            <ActionIcon variant="subtle" color="red" radius="md" onClick={() => modals.openConfirmModal({
               title: 'Xác nhận xoá món',
               children: <Text size="sm">Hành động này không thể hoàn tác. Bạn chắc chứ?</Text>,
               labels: { confirm: 'Xoá ngay', cancel: 'Huỷ' },
               confirmProps: { color: 'red' },
               onConfirm: () => deleteMutation.mutate(p.id)
            })}><Trash2 size={16} /></ActionIcon>
         </Group>
       )
    }
  ];

  if (isLoading) return <SectionLoader />;

  return (
    <Stack gap="xl" p="md">
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
        <Stack gap={2}>
           <Title order={1} className="text-slate-800 text-4xl font-black">Danh sách Món Ăn</Title>
           <Text size="md" c="dimmed" fw={500}>Cập nhật công thức và giá tiền món ăn tức thời</Text>
        </Stack>
        <Group gap="md">
          <TextInput
            placeholder="Tìm tên món..."
            leftSection={<Search size={16} />}
            value={searchText}
            onChange={(e) => setSearchText(e.currentTarget.value)}
            radius="md"
            w={240}
          />
          <Select
            placeholder="Tất cả danh mục"
            clearable
            data={categoryData.map((c: any) => ({ value: c.id.toString(), label: c.category_name }))}
            value={filterCategory}
            onChange={setFilterCategory}
            radius="md"
            w={180}
            leftSection={<Tag size={16} />}
          />
          <Button leftSection={<Plus size={18} />} variant="filled" color="blue" onClick={open} radius="md" size="md" className="shadow-lg">
             Thêm món mới
          </Button>
        </Group>
      </Group>

      <Card withBorder shadow="md" radius="xl" padding="0" className="bg-white border-slate-100 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <Box className="flex flex-col items-center justify-center h-48 bg-slate-50">
            <Search size={36} className="text-slate-300 mb-2" />
            <Text c="dimmed" fw={600}>Không tìm thấy món nào phù hợp.</Text>
          </Box>
        ) : (
          <DynamicTable data={filteredProducts} columns={columns} />
        )}
      </Card>

      {/* Modal CRUD */}
      <Modal opened={opened} onClose={handleClose} title={<Text fw={900} size="xl" className="text-blue-800 uppercase">{editingProduct ? 'Chỉnh sửa Công thức / Giá' : 'Thông tin Món Mới'}</Text>} size="lg" radius="lg" overlayProps={{ blur: 5, backgroundOpacity: 0.5 }}>
        <form onSubmit={handleSubmit} className="p-1">
          <Stack gap="lg">
            <SimpleGrid cols={2}>
              <TextInput 
                label="Tên Món Ăn" 
                placeholder="Beefsteak / Sinh Tố..." 
                required 
                autoFocus 
                value={name} 
                onChange={(e) => setName(e.currentTarget.value)} 
                leftSection={<Utensils size={16} />} 
              />
              <NumberInput 
                label="Giá Bán (VND)" 
                placeholder="Nhập giá món..."
                hideControls 
                required 
                thousandSeparator="." 
                decimalSeparator="," 
                suffix=" đ" 
                value={price} 
                onChange={(v) => setPrice(v ? Number(v) : '')} 
                leftSection={<DollarSign size={16} />} 
                error={(formSubmitted && (!price || price === 0)) ? "Cần nhập giá" : null}
              />
            </SimpleGrid>

            <Select label="Phân Loại Danh Mục" placeholder="Chọn danh mục..." data={categoryData.map((c: any) => ({ value: c.id.toString(), label: c.category_name }))} required value={categoryId} onChange={setCategoryId} leftSection={<Tag size={16} />} />

            <Box>
              <Text size="sm" fw={500} mb={5}>Hình ảnh món ăn</Text>
              {imageUrl ? (
                <Paper withBorder p="xs" radius="md" style={{ position: 'relative', overflow: 'hidden' }} className="group">
                   <Image src={imageUrl} h={150} radius="md" className="object-cover" alt="Selected" />
                   <Box 
                     className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                     style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                   >
                      <Button variant="filled" color="blue" size="xs" onClick={openMedia}>Thay đổi ảnh</Button>
                      <Button variant="filled" color="red" size="xs" onClick={() => setImageUrl('')}>Gỡ bỏ</Button>
                   </Box>
                </Paper>
              ) : (
                <UnstyledButton 
                  onClick={openMedia}
                  style={{ 
                    width: '100%', 
                    height: '140px', 
                    border: '2px dashed #cbd5e1', 
                    borderRadius: '12px', 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#f8fafc'
                  }}
                  className="hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                >
                  <Upload size={28} className="text-slate-400" />
                  <Text size="sm" c="dimmed" fw={500}>Click để chọn từ thư viện hoặc tải lên</Text>
                </UnstyledButton>
              )}
            </Box>
            
            <NumberInput 
              label="Giá Khuyến Mãi (VND)" 
              placeholder="Để trống nếu không giảm giá"
              hideControls 
              thousandSeparator="." 
              decimalSeparator="," 
              suffix=" đ" 
              value={discountPrice} 
              onChange={(v) => setDiscountPrice(v ? Number(v) : '')} 
              leftSection={<Tag size={16} className="text-red-500" />} 
            />

            <TextInput label="Ghi chú mô tả" placeholder="Nguyên liệu chính, độ cay..." value={description} onChange={(e) => setDescription(e.currentTarget.value)} leftSection={<Info size={16} />} />

            <Button fullWidth type="submit" loading={saveMutation.isPending} color="blue" size="lg" radius="md" mt="md" className="shadow-md">
              {editingProduct ? 'Cập nhật món' : 'Hoàn tất thêm món'}
            </Button>
          </Stack>
        </form>
      </Modal>

      <MediaLibraryModal opened={mediaOpened} onClose={closeMedia} onSelect={(url) => setImageUrl(url)} currentImageUrl={imageUrl} />
    </Stack>
  );
}
