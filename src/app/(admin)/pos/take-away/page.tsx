'use client';

import React from 'react';
import { 
  Box, Group, Stack, Card, Badge, Text, TextInput, Select, 
  ActionIcon, Divider, ScrollArea, Image, Center, SimpleGrid,
  Indicator, UnstyledButton, Modal, Paper, Pagination, Button, ThemeIcon
} from '@mantine/core';
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, ChefHat, 
  CheckCircle2, ShoppingBag, CreditCard, X 
} from 'lucide-react';
import { usePosContext } from '../POSContext';
import { formatCurrency } from '@/utils/format';
import { ActionButton } from '@/components/common/ActionButton';
import { PaymentMethodSelect } from '@/components/common/PaymentMethodSelect';
import { SectionLoader } from '@/components/common/GlobalLoading';
import { Product } from '@/types/pos';
import { useRouter } from 'next/navigation';

export default function TakeAwayOrderPage() {
  const router = useRouter();
  const {
    state: {
      search, filterCat, page, totalPages, cart, cartTotal, cartCount,
      paymentModalOpen, selectedPayment, categories, catLoading, 
      products, prodLoading, paginatedProducts, isCreatingOrder
    },
    actions: {
      setSearch, setFilterCat, setPage, addToCart, updateQty, 
      removeFromCart, handleConfirmOrder, setPaymentModalOpen, setSelectedPayment
    }
  } = usePosContext();

  if (catLoading || prodLoading) return <SectionLoader />;

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Box px="xl" py="sm" className="bg-white border-b border-slate-100" style={{ flexShrink: 0, zIndex: 10 }}>
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <ActionButton type="back" onClick={() => router.push('/pos')} variant="subtle" />
            <ThemeIcon size={40} radius="xl" variant="filled" color="indigo">
              <ShoppingBag size={20} />
            </ThemeIcon>
            <Box>
              <Text size="md" fw={900} style={{ color: '#0F172A', lineHeight: 1.1 }}>Bán mang đi</Text>
              <Text size="11px" c="dimmed" fw={600}>Khách mua nhanh mang về</Text>
            </Box>
          </Group>

          <Group gap="md">
            <Group gap="xs" wrap="nowrap" style={{ background: '#F8FAFC', padding: '2px', borderRadius: '100px', border: '1px solid #E1E8F0' }}>
              <TextInput
                placeholder="Tìm món ngon..."
                variant="unstyled"
                leftSection={<Search size={14} color="var(--indigo-primary)" style={{ marginLeft: 8 }} />}
                value={search}
                onChange={e => setSearch(e.currentTarget.value)}
                styles={{ input: { height: 36, width: 220, paddingLeft: 36, fontSize: 13, fontWeight: 600 } }}
              />
              <Divider orientation="vertical" h={16} my="auto" color="#E2E8F0" />
              <Select
                placeholder="Tất cả danh mục"
                variant="unstyled"
                data={categories.map((c) => ({ value: c.id.toString(), label: c.category_name }))}
                value={filterCat}
                onChange={setFilterCat}
                clearable
                styles={{ input: { height: 36, width: 160, paddingLeft: 10, fontSize: 13, fontWeight: 800, color: 'var(--brand-primary)' } }}
              />
            </Group>
          </Group>
        </Group>
      </Box>

      {/* Main layout */}
      <Box style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#F8FAFC' }}>
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <ScrollArea style={{ flex: 1 }} p="xl">
            <SimpleGrid cols={{ base: 2, sm: 3, md: 4, xl: 4 }} spacing="lg">
              {paginatedProducts.map((product: Product) => {
                const inCart = cart.find(i => i.product_id === product.id);
                const price = Number(product.discount_price || product.price);
                return (
                  <Indicator key={product.id} label={inCart ? `×${inCart.quantity}` : ''} disabled={!inCart} color="indigo" size={24} position="top-end" withBorder>
                    <UnstyledButton onClick={() => addToCart(product)} style={{ width: '100%' }}>
                      <Card radius="24px" p={0} className={`hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer border-0 ${inCart ? 'ring-2 ring-indigo ring-offset-2' : ''}`} bg="white">
                        <Box style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                          <Image src={product.image_url || ''} h="100%" radius="0" fit="cover" />
                        </Box>
                        <Stack p="md" gap={4}>
                          <Text size="sm" fw={800} lineClamp={1} c="gray.8">{product.product_name}</Text>
                          <Group justify="space-between" align="center">
                            <Text size="md" fw={900} c="indigo">{formatCurrency(price)}</Text>
                            <ActionIcon size={32} radius="xl" variant={inCart ? 'filled' : 'light'} color="indigo"><Plus size={16} strokeWidth={3} /></ActionIcon>
                          </Group>
                        </Stack>
                      </Card>
                    </UnstyledButton>
                  </Indicator>
                );
              })}
            </SimpleGrid>
            {totalPages > 1 && (
              <Group justify="center" p="xl">
                <Pagination total={totalPages} value={page} onChange={setPage} color="brand" radius="xl" fw={800} />
              </Group>
            )}
          </ScrollArea>
        </Box>

        <Box w={400} className="bg-white border-l border-slate-200" style={{ display: 'flex', flexDirection: 'column' }}>
           <Box p="xl" className="border-b border-slate-100 bg-gray-50/50">
             <Text size="xs" fw={800} c="dimmed" tt="uppercase">CHI TIẾT ĐƠN HÀNG</Text>
           </Box>
           <ScrollArea style={{ flex: 1 }} px="xl" py="xs">
             <Stack gap="sm" py="sm">
               {cart.map((item) => (
                 <Card key={item.product_id} radius="xl" p="sm" withBorder className="border-slate-100">
                    <Group wrap="nowrap" gap="md">
                      <Image src={item.image_url || ''} w={56} h={56} radius="md" fit="cover" />
                      <Box style={{ flex: 1 }}>
                        <Group justify="space-between" wrap="nowrap">
                          <Text fw={800} size="sm" lineClamp={1}>{item.product_name}</Text>
                          <ActionIcon variant="subtle" color="red" size="sm" onClick={() => removeFromCart(item.product_id)}><X size={14} /></ActionIcon>
                        </Group>
                        <Group justify="space-between" align="center" mt={4}>
                          <Text fw={900} c="brand" size="md">{formatCurrency(item.unit_price * item.quantity)}</Text>
                          <Group gap={4}>
                            <ActionIcon variant="light" color="gray" size="sm" radius="xl" onClick={() => updateQty(item.product_id, -1)}><Minus size={12} /></ActionIcon>
                            <Text fw={900} size="sm" w={20} ta="center">{item.quantity}</Text>
                            <ActionIcon variant="filled" color="brand" size="sm" radius="xl" onClick={() => updateQty(item.product_id, 1)}><Plus size={12}/></ActionIcon>
                          </Group>
                        </Group>
                      </Box>
                    </Group>
                  </Card>
               ))}
             </Stack>
           </ScrollArea>
           <Box p="xl" className="border-t-2 border-slate-100">
             <Stack gap="md">
               <Group justify="space-between">
                 <Text fw={800} c="dimmed" size="xs">TỔNG CỘNG</Text>
                 <Text fw={900} size="28px" c="indigo">{formatCurrency(cartTotal)}</Text>
               </Group>
               <Button size="lg" radius="xl" color="indigo" fw={900} loading={isCreatingOrder} disabled={cart.length === 0} onClick={() => setPaymentModalOpen(true)} leftSection={<CreditCard size={18} />}>Thanh toán</Button>
             </Stack>
           </Box>
        </Box>
      </Box>

      {/* Payment Modal */}
      <Modal opened={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} title="Thanh Toán" centered radius="xl" zIndex={1000}>
         <Stack gap="xl">
            <Paper p="md" radius="md" bg="brand-soft" className="border border-brand-soft">
              <Stack gap={4} align="center">
                <Text c="brand" fw={600} size="sm">Số tiền cần thu</Text>
                <Text fw={900} size="36px" c="brand">{formatCurrency(cartTotal)}</Text>
              </Stack>
            </Paper>
            <PaymentMethodSelect value={selectedPayment} onChange={setSelectedPayment} />
            <Group grow mb="sm">
              <Button variant="default" size="lg" onClick={() => setPaymentModalOpen(false)}>Hủy</Button>
              <Button size="lg" color="brand" fw={800} onClick={() => handleConfirmOrder()}>Hoàn tất</Button>
            </Group>
         </Stack>
      </Modal>
    </Box>
  );
}
