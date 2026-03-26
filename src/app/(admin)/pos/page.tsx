'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import https from '@/api/https';
import {
  Title, Text, Stack, Group, Card, Badge, Button, TextInput,
  NumberInput, Select, ActionIcon, Divider, ScrollArea, Box,
  Image, Center, Textarea, Paper, SimpleGrid, UnstyledButton,
  ThemeIcon, Indicator, rem, SegmentedControl, Loader
} from '@mantine/core';
import {
  Search, ShoppingCart, Plus, Minus, Trash2, ChefHat,
  Tag, Utensils, Receipt, CheckCircle2, X, User, StickyNote, ShoppingBag,
  CreditCard
} from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { SectionLoader } from '@/components/common/GlobalLoading';

interface CartItem {
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  image_url?: string;
}

const VND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function POSPage() {
  const queryClient = useQueryClient();

  // Menu filters
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string | null>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Order info
  const [orderType, setOrderType] = useState<string>('dine-in'); // 'dine-in' | 'take-away'
  const [tableId, setTableId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [note, setNote] = useState('');

  // Fetching
  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await https.get('/categories');
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
  });

  const { data: products = [], isLoading: prodLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await https.get('/products');
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
  });

  const { data: rawTables = [], isLoading: tablesLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const res = await https.get('/tables');
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const tables: any[] = Array.isArray(rawTables) ? rawTables : [];
  const categoryList: any[] = Array.isArray(categories) ? categories : (categories as any)?.data || [];
  const productList: any[] = Array.isArray(products) ? products : (products as any)?.data || [];

  const filteredProducts = useMemo(() =>
    productList
      .filter(p => !filterCat || p.category_id?.toString() === filterCat)
      .filter(p => !search || p.product_name?.toLowerCase().includes(search.toLowerCase())),
    [productList, filterCat, search]
  );

  // ---- Cart helpers ----
  const addToCart = (product: any) => {
    const unitPrice = Number(product.discount_price || product.price);
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, {
        product_id: product.id,
        product_name: product.product_name,
        unit_price: unitPrice,
        quantity: 1,
        image_url: product.image_url,
      }];
    });
  };

  const updateQty = (productId: number, delta: number) => {
    setCart(prev => prev
      .map(i => i.product_id === productId ? { ...i, quantity: i.quantity + delta } : i)
      .filter(i => i.quantity > 0)
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(i => i.product_id !== productId));
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // ---- Create Order ----
  const createOrder = useMutation({
    mutationFn: () =>
      https.post('/orders', {
        table_id: orderType === 'dine-in' ? (tableId ? Number(tableId) : null) : null,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        note: note || null,
        items: cart.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      notifications.show({
        title: '✅ Đặt hàng thành công!',
        message: `Đơn hàng đã được tạo và gửi bếp.`,
        color: 'green',
      });
      setCart([]);
      setTableId(null);
      setOrderType('dine-in');
      setCustomerName('');
      setCustomerPhone('');
      setNote('');
    },
    onError: (err: any) => {
      notifications.show({
        title: 'Lỗi',
        message: err.response?.data?.message || 'Không thể tạo đơn hàng.',
        color: 'red',
      });
    },
  });

  if (catLoading || prodLoading) return <SectionLoader />;

  return (
    <Box style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <Group px="md" py="sm" justify="space-between" className="border-b border-slate-200 bg-white" style={{ flexShrink: 0 }}>
        <Group gap="sm">
          <ThemeIcon size={40} radius="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
            <ChefHat size={22} />
          </ThemeIcon>
          <Stack gap={0}>
            <Title order={3} className="text-slate-800">Gọi món cho Khách</Title>
            <Text size="xs" c="dimmed">Chọn món → Thêm giỏ → Xác nhận đơn</Text>
          </Stack>
        </Group>
        {cartCount > 0 && (
          <Badge size="xl" variant="filled" color="blue" radius="md" leftSection={<ShoppingCart size={16} />}>
            {cartCount} món · {VND(cartTotal)}
          </Badge>
        )}
      </Group>

      {/* Main layout: left = menu, right = cart */}
      <Box style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ===== LEFT PANEL: Product Menu ===== */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {/* Search & Filter bar */}
          <Box p="md" className="bg-white border-b border-slate-100" style={{ flexShrink: 0 }}>
            <Group gap="sm" wrap="nowrap">
              <TextInput
                placeholder="Tìm tên món..."
                leftSection={<Search size={16} />}
                value={search}
                onChange={e => setSearch(e.currentTarget.value)}
                style={{ flex: 1 }}
                radius="md"
              />
              <Select
                placeholder="Tất cả danh mục"
                clearable
                data={categoryList.map((c: any) => ({ value: c.id.toString(), label: c.category_name }))}
                value={filterCat}
                onChange={setFilterCat}
                leftSection={<Tag size={16} />}
                w={180}
                radius="md"
              />
            </Group>
          </Box>

          {/* Category quick-filter pills */}
          <Box px="md" pt="xs" pb="xs" className="bg-white" style={{ flexShrink: 0, borderBottom: '1px solid #f1f5f9' }}>
            <Group gap="xs" wrap="nowrap" style={{ overflowX: 'auto', paddingBottom: 6 }}>
              <UnstyledButton
                onClick={() => setFilterCat(null)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '100px',
                  fontSize: '13px',
                  fontWeight: 800,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  backgroundColor: !filterCat ? '#2563eb' : '#f1f5f9',
                  color: !filterCat ? 'white' : '#64748b',
                  boxShadow: !filterCat ? '0 8px 16px -4px rgba(37, 99, 235, 0.3)' : 'none',
                }}
              >
                Tất cả
              </UnstyledButton>
              {categoryList.map((c: any) => (
                <UnstyledButton
                  key={c.id}
                  onClick={() => setFilterCat(filterCat === c.id.toString() ? null : c.id.toString())}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '100px',
                    fontSize: '13px',
                    fontWeight: 800,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: filterCat === c.id.toString() ? '#2563eb' : '#f1f5f9',
                    color: filterCat === c.id.toString() ? 'white' : '#64748b',
                    boxShadow: filterCat === c.id.toString() ? '0 8px 16px -4px rgba(37, 99, 235, 0.3)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.category_name}
                </UnstyledButton>
              ))}
            </Group>
          </Box>

          {/* Product grid */}
          <ScrollArea style={{ flex: 1 }} p="md">
            {filteredProducts.length === 0 ? (
              <Center h={200}>
                <Stack align="center" gap="xs">
                  <Utensils size={36} className="text-slate-300" />
                  <Text c="dimmed" fw={600}>Không tìm thấy món nào</Text>
                </Stack>
              </Center>
            ) : (
              <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="sm">
                {filteredProducts.map((product: any) => {
                  const inCart = cart.find(i => i.product_id === product.id);
                  const price = Number(product.discount_price || product.price);
                  return (
                    <Indicator
                      key={product.id}
                      label={inCart ? `×${inCart.quantity}` : ''}
                      disabled={!inCart}
                      color="blue"
                      size={20}
                      position="top-end"
                      offset={6}
                    >
                      <UnstyledButton
                        onClick={() => addToCart(product)}
                        style={{ width: '100%' }}
                      >
                        <Card
                          withBorder
                          radius="lg"
                          p="xs"
                          className={`hover:shadow-lg transition-all cursor-pointer group ${inCart ? 'border-blue-400 bg-blue-50/50' : 'border-slate-200 hover:border-blue-300 bg-white'}`}
                        >
                          <Card.Section mb="xs">
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.product_name}
                                h={100}
                                radius="md"
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <Center h={100} className="bg-slate-50 rounded-lg">
                                <Utensils size={28} className="text-slate-300" />
                              </Center>
                            )}
                          </Card.Section>
                          <Text size="sm" fw={700} lineClamp={1} className="text-slate-800">
                            {product.product_name}
                          </Text>
                          <Group justify="space-between" align="center" mt={4}>
                            <Stack gap={0}>
                              <Text size="sm" fw={900} c="blue">
                                {VND(price)}
                              </Text>
                              {product.discount_price && (
                                <Text size="xs" c="dimmed" td="line-through">
                                  {VND(Number(product.price))}
                                </Text>
                              )}
                            </Stack>
                            <ThemeIcon
                              size={28}
                              radius="md"
                              variant={inCart ? 'filled' : 'light'}
                              color="blue"
                              className="group-hover:scale-110 transition-transform"
                            >
                              <Plus size={14} />
                            </ThemeIcon>
                          </Group>
                        </Card>
                      </UnstyledButton>
                    </Indicator>
                  );
                })}
              </SimpleGrid>
            )}
          </ScrollArea>
        </Box>

        {/* ===== RIGHT PANEL: Cart & Order Info ===== */}
        <Box
          style={{
            width: 380,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#f8fafc',
          }}
        >
          {/* Cart header */}
          <Box px="md" pt="md" pb="sm" className="bg-white border-b border-slate-200" style={{ flexShrink: 0 }}>
            <Group justify="space-between">
              <Group gap="xs">
                <ShoppingCart size={20} className="text-blue-600" />
                <Text fw={800} size="md" className="text-blue-800">Giỏ hàng</Text>
                <Badge size="sm" color="blue" variant="filled">{cartCount}</Badge>
              </Group>
              {cart.length > 0 && (
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  leftSection={<Trash2 size={14} />}
                  onClick={() => setCart([])}
                >
                  Xoá hết
                </Button>
              )}
            </Group>
          </Box>

          {/* Cart items */}
          <ScrollArea style={{ flex: 1 }} p="sm">
            {cart.length === 0 ? (
              <Center h={160}>
                <Stack align="center" gap="xs">
                  <ShoppingCart size={36} className="text-slate-300" />
                  <Text c="dimmed" size="sm" fw={600}>Chưa có món nào</Text>
                  <Text c="dimmed" size="xs">Chọn món từ thực đơn bên trái</Text>
                </Stack>
              </Center>
            ) : (
              <Stack gap="xs">
                {cart.map(item => (
                  <Paper key={item.product_id} withBorder radius="md" p="sm" className="bg-white">
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                        {item.image_url ? (
                          <Image src={item.image_url} w={36} h={36} radius="sm" style={{ objectFit: 'cover', flexShrink: 0 }} alt="" />
                        ) : (
                          <Center w={36} h={36} className="bg-slate-100 rounded-sm" style={{ flexShrink: 0 }}>
                            <Utensils size={14} className="text-slate-400" />
                          </Center>
                        )}
                        <Stack gap={0} style={{ minWidth: 0 }}>
                          <Text size="sm" fw={700} lineClamp={1}>{item.product_name}</Text>
                          <Text size="xs" c="blue" fw={600}>{VND(item.unit_price)}</Text>
                        </Stack>
                      </Group>
                      <Group gap={4} wrap="nowrap">
                        <ActionIcon size="sm" variant="light" color="blue" radius="md" onClick={() => updateQty(item.product_id, -1)}>
                          <Minus size={12} />
                        </ActionIcon>
                        <Text fw={800} w={24} ta="center" size="sm">{item.quantity}</Text>
                        <ActionIcon size="sm" variant="light" color="blue" radius="md" onClick={() => updateQty(item.product_id, 1)}>
                          <Plus size={12} />
                        </ActionIcon>
                        <ActionIcon size="sm" variant="subtle" color="red" radius="md" onClick={() => removeFromCart(item.product_id)}>
                          <X size={12} />
                        </ActionIcon>
                      </Group>
                    </Group>
                    <Text size="xs" c="dimmed" ta="right" mt={4} fw={600}>
                      = {VND(item.unit_price * item.quantity)}
                    </Text>
                  </Paper>
                ))}
              </Stack>
            )}
          </ScrollArea>

          {/* Order info & Confirm */}
          <Box p="md" className="bg-white border-t border-slate-200" style={{ flexShrink: 0 }}>
            <Stack gap="sm">
              {/* Order Type */}
              <Stack gap={4}>
                <Text size="sm" fw={700}>Hình thức phục vụ</Text>
                <SegmentedControl
                  fullWidth
                  value={orderType}
                  onChange={setOrderType}
                  data={[
                    { label: 'Ăn tại bàn', value: 'dine-in' },
                    { label: 'Mang đi', value: 'take-away' },
                  ]}
                  radius="md"
                  color="blue"
                />
              </Stack>

              {/* Table selection - only if dine-in */}
              {orderType === 'dine-in' && (
                <Select
                  label="Bàn số"
                  placeholder={tablesLoading ? "Đang tải danh sách bàn..." : "Chọn bàn phục vụ"}
                  clearable
                  leftSection={tablesLoading ? <Loader size={14} /> : <Utensils size={16} />}
                  data={tables.map((t: any) => ({
                    value: t.id.toString(),
                    label: `${t.table_name} ${t.table_status === 'occupied' ? '🔴' : '🟢'}`,
                    disabled: t.table_status === 'occupied',
                  }))}
                  value={tableId}
                  onChange={setTableId}
                  radius="md"
                  size="sm"
                  rightSection={tablesLoading ? <Loader size={14} color="blue" /> : null}
                  error={orderType === 'dine-in' && !tableId && cart.length > 0 ? 'Vui lòng chọn bàn' : null}
                />
              )}

              {/* Customer */}
              <SimpleGrid cols={2} spacing="xs">
                <TextInput
                  label="Tên khách"
                  placeholder="Nguyen Van A"
                  leftSection={<User size={14} />}
                  value={customerName}
                  onChange={e => setCustomerName(e.currentTarget.value)}
                  radius="md"
                  size="sm"
                />
                <TextInput
                  label="Số điện thoại"
                  placeholder="09xx..."
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.currentTarget.value)}
                  radius="md"
                  size="sm"
                />
              </SimpleGrid>

              {/* Note */}
              <Textarea
                label="Ghi chú"
                placeholder="Không hành, ít cay, dị ứng..."
                leftSection={<StickyNote size={14} />}
                value={note}
                onChange={e => setNote(e.currentTarget.value)}
                radius="md"
                size="sm"
                minRows={2}
                autosize
              />

              <Divider />

              {/* Total */}
              <Group justify="space-between">
                <Text fw={700} c="dimmed">Tổng cộng</Text>
                <Text fw={900} size="xl" c="blue">{VND(cartTotal)}</Text>
              </Group>

              {/* Confirm Button */}
              <Button
                fullWidth
                size="md"
                radius="md"
                color="blue"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
                leftSection={<CheckCircle2 size={18} />}
                disabled={cart.length === 0 || (orderType === 'dine-in' && !tableId)}
                loading={createOrder.isPending}
                onClick={() => createOrder.mutate()}
                className="shadow-md"
              >
                {cart.length === 0 ? 'Chọn món trước' : `Xác nhận đơn · ${VND(cartTotal)}`}
              </Button>

              {cart.length > 0 && (
                <Text size="xs" c="dimmed" ta="center">
                  <Receipt size={12} style={{ display: 'inline', marginRight: 4 }} />
                  Đơn sẽ được gửi bếp ngay lập tức
                </Text>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
