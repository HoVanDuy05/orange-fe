'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import https from '@/api/https';
import { 
  Title, Button, Group, ActionIcon, Modal, TextInput, NumberInput, 
  Card, Center, Loader, Text, Badge, Stack, SimpleGrid, Select, 
  Paper, Box
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { Plus, Trash2, Calendar, User, ShoppingCart, Edit, History, FileText, CheckCircle2, Package, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import { SectionLoader } from '@/components/common/GlobalLoading';
import { DynamicTable, TableColumn } from '@/components/common/DynamicTable';
import { AppTitle } from '@/components/common/AppTitle';
import '@mantine/dates/styles.css';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

export default function StockPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  
  const [editingStock, setEditingStock] = useState<any>(null);

  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>(0);
  const [unitPrice, setUnitPrice] = useState<number | ''>(0);
  const [supplier, setSupplier] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [unit, setUnit] = useState<string | null>('Kg');
  const [stockDate, setStockDate] = useState<Date | null>(new Date());

  const { data: rawStock = [], isLoading } = useQuery({
    queryKey: ['stock'],
    queryFn: async () => (await https.get('/stock')).data
  });

  const stockData = Array.isArray(rawStock) ? rawStock : (rawStock?.data || []);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingStock) return https.put(`/stock/${editingStock.id}`, payload);
      return https.post('/stock', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      
      notifications.show({ 
        title: 'Thành công', 
        message: editingStock ? 'Đã cập nhật phiếu và lưu lịch sử' : 'Đã lưu phiếu nhập kho mới', 
        color: 'green' 
      });
      handleClose();
    },
    onError: (error: any) => {
      notifications.show({ title: 'Lỗi', message: error.response?.data?.message || 'Không thể lưu', color: 'red' });
    }
  });

  const deleteStockMutation = useMutation({
    mutationFn: async (id: number) => https.delete(`/stock/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      notifications.show({ title: 'Xoá thành công', message: 'Đã loại bỏ phiếu nhập', color: 'orange' });
    }
  });

  const handleOpenEdit = (s: any) => {
    setEditingStock(s);
    setItemName(s.item_name);
    setQuantity(Number(s.quantity));
    setUnitPrice(Number(s.unit_price));
    setSupplier(s.supplier || '');
    setBuyerName(s.buyer_name || '');
    setUnit(s.unit || 'Kg');
    setStockDate(new Date(s.stock_date));
    open();
  };

  const handleClose = () => {
    setEditingStock(null);
    setItemName('');
    setQuantity(0);
    setUnitPrice(0);
    setSupplier('');
    setBuyerName('');
    setUnit('Kg');
    setStockDate(new Date());
    close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !quantity || !unitPrice) return;
    saveMutation.mutate({ 
      item_name: itemName, 
      quantity: Number(quantity), 
      unit_price: Number(unitPrice), 
      supplier,
      buyer_name: buyerName || 'Admin',
      unit: unit || 'Kg',
      stock_date: stockDate
    });
  };

  const columns: TableColumn<any>[] = [
    { 
      key: 'stock_date', 
      label: 'Ngày / Giờ', 
      type: 'date',
      render: (s) => (
        <Group gap="sm" justify="center">
           <Calendar size={14} className="text-brand" />
           <Stack gap={0}>
              <Text size="sm" fw={700}>{dayjs(s.stock_date).format('DD/MM/YYYY')}</Text>
              <Text size="xs" c="dimmed">{dayjs(s.stock_date).format('HH:mm')}</Text>
           </Stack>
        </Group>
      )
    },
    { 
      key: 'item_name', 
      label: 'Tên hàng hóa', 
      type: 'text',
      render: (s) => (
        <Stack gap={0} ta="left">
           <Text fw={700} size="sm" className="text-brand">{s.item_name}</Text>
           <Text size="xs" c="dimmed">{s.supplier || 'Không NCC'}</Text>
        </Stack>
      )
    },
    { 
      key: 'buyer_name', 
      label: 'Người mua', 
      type: 'action',
      render: (s) => <Badge variant="light" color="brand" size="sm">{s.buyer_name || 'Admin'}</Badge>
    },
    { 
      key: 'quantity', 
      label: 'Khối lượng', 
      type: 'action',
      render: (s) => <Text size="sm" fw={800}>{s.quantity} <span style={{fontSize: '10px', color: 'gray'}}>{s.unit || 'Kg'}</span></Text>
    },
    { 
       key: 'cost', 
       label: 'Thành tiền', 
       type: 'price',
       render: (s) => (
         <Text fw={900} color="red.7" size="sm" ta="right">
           {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(s.cost))}
         </Text>
       )
    },
    { 
      key: 'actions', 
      label: 'Thao tác', 
      type: 'action',
      render: (s) => (
        <Group gap={5} justify="center">
           <ActionIcon variant="light" color="brand" onClick={() => handleOpenEdit(s)} size="lg" radius="md"><Edit size={16} /></ActionIcon>
           <ActionIcon variant="light" color="teal" component={Link} href={`/stock/history/${s.id}`} size="lg" radius="md"><History size={16} /></ActionIcon>
           <ActionIcon variant="light" color="red" size="lg" radius="md" onClick={() => modals.openConfirmModal({
              title: 'Xác nhận xoá phiếu',
              children: <Text size="sm">Hành động này sẽ gỡ bỏ số tiền {Number(s.cost).toLocaleString()} đ ra khỏi báo cáo. Xoá?</Text>,
              labels: { confirm: 'Xoá', cancel: 'Bỏ' },
              confirmProps: { color: 'red' },
              onConfirm: () => deleteStockMutation.mutate(s.id)
           })}><Trash2 size={16} /></ActionIcon>
        </Group>
      )
    }
  ];

  if (isLoading) return <SectionLoader />;

  const totalInvCost = stockData.reduce((acc: number, item: any) => acc + Number(item.cost), 0);

  return (
    <Box p={{ base: 'md', sm: 'xl' }}>
      <Stack gap="xl">
        <Group justify="space-between" align="center">
           <Stack gap={2}>
              <AppTitle level={1}>Quản lý Nhập Kho</AppTitle>
              <Text size="md" c="dimmed" fw={500}>Kiểm kê hàng hóa và quản lý chi tiêu định kỳ</Text>
           </Stack>
           <Button leftSection={<Plus size={18} />} variant="filled" color="brand" onClick={open} size="lg" radius="md">
             Tạo phiếu nhập mới
           </Button>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
          <Paper withBorder radius="lg" p="xl" className="border-l-8 border-l-brand shadow-xl bg-white">
             <Group justify="space-between">
                <Stack gap={0}>
                  <Text size="sm" tt="uppercase" fw={800} c="dimmed">Tổng Chi Phí Tháng Này</Text>
                  <Title order={1} className="text-blue-900 text-3xl mt-1">
                     {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalInvCost)}
                  </Title>
                </Stack>
                <ShoppingCart size={40} className="text-blue-100" />
             </Group>
          </Paper>

          <Paper withBorder radius="lg" p="xl" className="border-l-8 border-l-orange-500 shadow-xl bg-white">
             <Group justify="space-between">
                <Stack gap={0}>
                  <Text size="sm" tt="uppercase" fw={800} c="dimmed">Số Lượng Phiếu Nhập</Text>
                  <Title order={1} className="text-orange-900 text-3xl mt-1">{stockData.length} Phiếu</Title>
                </Stack>
                <FileText size={40} className="text-orange-100" />
             </Group>
          </Paper>
        </SimpleGrid>

        <Card withBorder radius="xl" shadow="md" p="0" className="bg-white overflow-hidden border-slate-200">
           <DynamicTable columns={columns} data={stockData} loading={isLoading} />
        </Card>

        {/* Modal CRUD */}
        <Modal opened={opened} onClose={handleClose} title={<AppTitle level={3}>{editingStock ? 'CẬP NHẬT PHIẾU NHẬP' : 'TẠO PHIẾU NHẬP MỚI'}</AppTitle>} radius="lg" size="lg" overlayProps={{ backgroundOpacity: 0.55, blur: 5 }}>
          <form onSubmit={handleSubmit} className="p-2">
            <Stack gap="lg">
              <SimpleGrid cols={2}>
                 <DateInput label="Ngày nhập hàng" value={stockDate} onChange={(v) => { if (!v) return setStockDate(null); setStockDate(v as unknown as Date); }} placeholder="Chọn ngày" required valueFormat="DD/MM/YYYY" leftSection={<Calendar size={16} />} />
                 <TextInput label="Người đi mua" placeholder="Nguyễn Văn A" value={buyerName} onChange={(e) => setBuyerName(e.currentTarget.value)} required leftSection={<User size={16} />} />
              </SimpleGrid>

              <TextInput label="Tên hàng hóa/nguyên liệu" placeholder="Vd: Thịt bò tươi..." required value={itemName} onChange={(e) => setItemName(e.currentTarget.value)} leftSection={<Package size={16} />} />

              <SimpleGrid cols={3}>
                <NumberInput label="Số lượng" hideControls required value={quantity} onChange={(v) => setQuantity(Number(v))} />
                <Select label="Đơn vị" data={['Kg', 'Lít', 'Lon', 'Thùng', 'Bó', 'Gói', 'Cái', 'Chai']} value={unit} onChange={setUnit} required />
                <NumberInput label="Đơn giá nhập" hideControls required thousandSeparator="." decimalSeparator="," suffix=" đ" value={unitPrice} onChange={(v) => setUnitPrice(Number(v))} />
              </SimpleGrid>

              <TextInput label="Nhà cung cấp" placeholder="Vd: Chợ đầu mối Bình Điền" value={supplier} onChange={(e) => setSupplier(e.currentTarget.value)} leftSection={<Tag size={16} />} />

              <Button fullWidth type="submit" loading={saveMutation.isPending} color="brand" size="lg" radius="md" className="shadow-lg">
                {editingStock ? 'Ghi lại thay đổi' : 'Xác nhận nhập kho'}
              </Button>
            </Stack>
          </form>
        </Modal>
      </Stack>
    </Box>
  );
}
