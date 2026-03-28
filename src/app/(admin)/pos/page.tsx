'use client';

import React from 'react';
import {
  Text, Stack, Group, Card, Badge, Button, TextInput,
  Select, ActionIcon, Divider, ScrollArea, Box,
  Image, Center, Paper, SimpleGrid, UnstyledButton,
  ThemeIcon, Indicator, SegmentedControl, Modal, Pagination
} from '@mantine/core';
import {
  Search, ShoppingCart, Plus, Minus, Trash2, ChefHat,
  Utensils, CheckCircle2, ShoppingBag, CreditCard, Receipt,
  ChevronLeft, ChevronRight, ShoppingBasket, X
} from 'lucide-react';
import { AppTitle } from '@/components/common/AppTitle';
import { ActionButton } from '@/components/common/ActionButton';
import { SectionLoader } from '@/components/common/GlobalLoading';
import { usePOS } from '@/hooks/usePOS';
import { formatCurrency } from '@/utils/format';
import { OrderType, Product, Table, Category } from '@/types/pos';
import { PaymentMethodSelect } from '@/components/common/PaymentMethodSelect';

export default function POSPage() {
  const {
    state: {
      search, setSearch,
      filterCat, setFilterCat,
      page, totalPages, total,
      cart, cartTotal, cartCount,
      orderType, setOrderType,
      tableId, setTableId,
      customerName, setCustomerName,
      customerPhone, setCustomerPhone,
      note, setNote,
      paymentModalOpen, setPaymentModalOpen,
      selectedPayment, setSelectedPayment,
      categories, catLoading,
      products, prodLoading,
      paginatedProducts,
      tables, tablesLoading,
      filteredProducts,
      isCreatingOrder
    },
    actions: {
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      handleConfirmOrder,
      setPage
    }
  } = usePOS();

  if (catLoading || prodLoading) return <SectionLoader />;

  return (
    <Box style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header - Unified & Premium */}
      <Box px="xl" py="sm" className="bg-white border-b border-slate-100" style={{ flexShrink: 0, zIndex: 10 }}>
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <ThemeIcon size={40} radius="xl" variant="filled" color="brand" className="shadow-lg shadow-blue-500/10">
              <ChefHat size={20} strokeWidth={2.5} />
            </ThemeIcon>
            <Box>
              <Text size="md" fw={900} style={{ color: '#0F172A', lineHeight: 1.1 }}>Hệ thống Gọi món</Text>
              <Text size="11px" c="dimmed" fw={600}>Phục vụ nhanh chóng · Chính xác</Text>
            </Box>
          </Group>

          <Group gap="md">
            {/* Search & Filter Bar unified */}
            <Group gap="xs" wrap="nowrap" style={{ background: '#F8FAFC', padding: '2px', borderRadius: '100px', border: '1px solid #E1E8F0' }}>
              <TextInput
                placeholder="Tìm món ngon..."
                variant="unstyled"
                leftSection={<Search size={14} color="var(--brand-primary)" style={{ marginLeft: 8 }} />}
                value={search}
                onChange={e => setSearch(e.currentTarget.value)}
                styles={{
                  input: {
                    height: 36,
                    width: 260,
                    paddingLeft: 36,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#334155'
                  }
                }}
              />
              <Divider orientation="vertical" h={16} my="auto" color="#E2E8F0" />
              <Select
                placeholder="Tất cả danh mục"
                variant="unstyled"
                data={categories.map((c) => ({ value: c.id.toString(), label: c.category_name }))}
                value={filterCat}
                onChange={setFilterCat}
                clearable
                styles={{
                  input: {
                    height: 36,
                    width: 170,
                    paddingLeft: 10,
                    fontSize: 13,
                    fontWeight: 800,
                    color: 'var(--brand-primary)'
                  }
                }}
              />
            </Group>

            {cartCount > 0 && (
              <Badge
                size="xl"
                variant="filled"
                color="brand"
                radius="xl"
                h={36} px="lg"
                leftSection={<ShoppingCart size={16} strokeWidth={2.5} />}
                className="shadow-sm"
                style={{ fontSize: 13, fontWeight: 900 }}
              >
                {formatCurrency(cartTotal)}
              </Badge>
            )}
          </Group>
        </Group>
      </Box>

      {/* Main layout: left = menu, right = cart */}
      <Box style={{ flex: 1, display: 'flex', overflow: 'hidden', background: '#F8FAFC' }}>

        {/* ===== LEFT PANEL: Product Menu ===== */}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Product grid */}
          <ScrollArea style={{ flex: 1 }} p="xl">
            {paginatedProducts.length === 0 ? (
              <Center h={400}>
                <Stack align="center" gap="xs">
                  <Box p="xl" style={{ borderRadius: '50%', background: '#F1F5F9' }}>
                    <Utensils size={48} className="text-slate-300" />
                  </Box>
                  <Text c="dimmed" fw={800} size="lg">Không tìm thấy món nào</Text>
                  <Text c="dimmed" size="sm">Thử tìm kiếm với từ khóa khác nhé!</Text>
                </Stack>
              </Center>
            ) : (
              <Stack gap="xl">
                <SimpleGrid cols={{ base: 2, sm: 3, md: 4, xl: 4 }} spacing="lg">
                  {paginatedProducts.map((product: Product) => {
                    const inCart = cart.find(i => i.product_id === product.id);
                    const price = Number(product.discount_price || product.price);
                    return (
                      <Indicator
                        key={product.id}
                        label={inCart ? `×${inCart.quantity}` : ''}
                        disabled={!inCart}
                        color="brand"
                        size={24}
                        position="top-end"
                        offset={6}
                        withBorder
                        styles={{ indicator: { fontWeight: 900 } }}
                      >
                        <UnstyledButton
                          onClick={() => addToCart(product)}
                          style={{ width: '100%' }}
                        >
                          <Card
                            radius="24px"
                            p={0}
                            className={`hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group border-0 ${inCart ? 'ring-2 ring-brand ring-offset-2' : ''}`}
                            style={{
                              background: 'white',
                              overflow: 'hidden'
                            }}
                          >
                            <Box style={{ position: 'relative', height: 160 }}>
                              {product.image_url ? (
                                <Image
                                  src={product.image_url}
                                  alt={product.product_name}
                                  h="100%"
                                  radius="0"
                                  style={{ objectFit: 'cover' }}
                                  className="group-hover:scale-110 transition-transform duration-700"
                                />
                              ) : (
                                <Center h="100%" className="bg-slate-50">
                                  <Utensils size={40} className="text-slate-200" />
                                </Center>
                              )}
                              {/* Overlay gradient */}
                              <Box
                                style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  height: '60%',
                                  background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)'
                                }}
                              />
                              <Badge
                                variant="filled"
                                color="brand"
                                size="sm"
                                radius="sm"
                                style={{ position: 'absolute', top: 12, right: 12, fontWeight: 800 }}
                              >
                                {categories.find((c: Category) => c.id.toString() === product.category_id?.toString())?.category_name || 'Món'}
                              </Badge>
                            </Box>

                            <Stack p="md" gap={4}>
                              <Text size="sm" fw={800} lineClamp={1} className="text-slate-800">
                                {product.product_name}
                              </Text>
                              <Group justify="space-between" align="center">
                                <Stack gap={0}>
                                  <Text size="md" fw={900} c="brand">
                                    {formatCurrency(price)}
                                  </Text>
                                  {product.discount_price && (
                                    <Text size="10px" c="dimmed" td="line-through" fw={600}>
                                      {formatCurrency(Number(product.price))}
                                    </Text>
                                  )}
                                </Stack>
                                <ActionIcon
                                  size={32}
                                  radius="xl"
                                  variant={inCart ? 'filled' : 'light'}
                                  color="brand"
                                  className="group-hover:scale-110 transition-transform shadow-sm"
                                >
                                  <Plus size={16} strokeWidth={3} />
                                </ActionIcon>
                              </Group>
                            </Stack>
                          </Card>
                        </UnstyledButton>
                      </Indicator>
                    );
                  })}
                </SimpleGrid>

                {totalPages > 1 && (
                  <Group justify="center" pb="xl">
                    <Pagination
                      total={totalPages}
                      value={page}
                      onChange={setPage}
                      color="brand"
                      radius="xl"
                      withEdges
                      styles={{ control: { border: '1px solid #E2E8F0', fontWeight: 800 } }}
                    />
                  </Group>
                )}
              </Stack>
            )}
          </ScrollArea>
        </Box>

        {/* ===== RIGHT PANEL: Cart & Order Info (FIXED) ===== */}
        <Box
          w={420}
          className="bg-slate-50 border-l border-slate-200 shadow-sm"
          style={{
            display: 'flex',
            flexDirection: 'column',
            zIndex: 5
          }}
        >
          {/* Service Type & Table Selection at Top */}
          <Box p="xl" className="bg-white border-b border-slate-100" style={{ flexShrink: 0 }}>
            <Stack gap="md">
              <Group justify="space-between" mb={-4}>
                <Text size="xs" fw={800} c="dimmed" tt="uppercase">Hình thức phục vụ</Text>
                <Badge color="brand" variant="light" radius="sm" size="xs" fw={800}>#NEW_ORDER</Badge>
              </Group>

              <SegmentedControl
                fullWidth
                value={orderType}
                onChange={(val) => setOrderType(val as OrderType)}
                data={[
                  { label: 'Ăn tại bàn', value: 'dine-in' },
                  { label: 'Mang đi', value: 'take-away' },
                ]}
                radius="xl"
                color="brand"
                size="md"
                styles={{
                  root: { background: '#F1F5F9', padding: 4 },
                  indicator: { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
                  label: { fontWeight: 800 }
                }}
              />

              {orderType === 'dine-in' && (
                <Select
                  placeholder={tablesLoading ? "Đang tải danh sách bàn..." : "Chọn bàn phục vụ"}
                  data={tables.map((t: Table) => ({
                    value: t.id.toString(),
                    label: t.table_name,
                  }))}
                  value={tableId}
                  onChange={setTableId}
                  radius="lg"
                  size="md"
                  leftSection={<Utensils size={18} className="text-brand" />}
                  styles={{
                    input: { fontWeight: 800, border: '2px solid #F1F5F9', background: 'white' },
                  }}
                  renderOption={({ option, checked }) => {
                    const table = tables.find(t => t.id.toString() === option.value);
                    const isOccupied = table?.table_status === 'occupied';
                    return (
                      <Group gap="xs" wrap="nowrap" justify="space-between" style={{ flex: 1 }}>
                        <Group gap="xs">
                          <Box 
                            style={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              background: isOccupied ? 'var(--mantine-color-green-6)' : 'var(--mantine-color-gray-4)',
                              border: '2px solid white',
                              boxShadow: '0 0 0 1px #E2E8F0'
                            }} 
                          />
                          <Text size="sm" fw={checked ? 900 : 700} c={checked ? 'brand' : 'gray.8'}>
                            {option.label}
                          </Text>
                        </Group>
                        {isOccupied && (
                          <Badge variant="light" color="green" size="xs" radius="sm">CÓ KHÁCH</Badge>
                        )}
                      </Group>
                    );
                  }}
                />
              )}
            </Stack>
          </Box>

          {/* Cart items */}
          <ScrollArea style={{ flex: 1 }} px="xl" py="xs">
            {cart.length === 0 ? (
              <Center h="100%" style={{ opacity: 0.5 }}>
                <Stack align="center" gap="md">
                  <Box p="xl" style={{ borderRadius: '50%', background: '#F1F5F9' }}>
                    <ShoppingBag size={48} className="text-slate-300" />
                  </Box>
                  <Text fw={800} size="sm" c="dimmed">Giỏ hàng của bạn đang trống</Text>
                  <Text size="xs" c="dimmed" ta="center">Chọn món yêu thích để bắt đầu!</Text>
                </Stack>
              </Center>
            ) : (
              <Stack gap="sm" pb="xl">
                {cart.map((item) => (
                  <Card key={item.product_id} radius="xl" p="sm" withBorder className="border-slate-100 hover:shadow-md transition-shadow">
                    <Group wrap="nowrap" gap="md">
                      {item.image_url ? (
                        <Image src={item.image_url} w={64} h={64} radius="lg" style={{ objectFit: 'cover' }} />
                      ) : (
                        <Center w={64} h={64} style={{ borderRadius: "50%" }} className="bg-slate-50">
                          <ChefHat size={20} className="text-slate-300" />
                        </Center>
                      )}

                      <Box style={{ flex: 1 }}>
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                          <Text fw={800} size="sm" lineClamp={1} className="text-slate-800">{item.product_name}</Text>
                          <ActionIcon variant="subtle" color="red" size="sm" onClick={() => removeFromCart(item.product_id)}>
                            <X size={14} />
                          </ActionIcon>
                        </Group>
                        <Group justify="space-between" align="center" mt={4}>
                          <Text fw={900} c="brand" size="md">{formatCurrency(item.unit_price * item.quantity)}</Text>
                          <Group gap={4}>
                            <ActionIcon
                              variant="light"
                              color="slate"
                              size="sm"
                              radius="xl"
                              onClick={() => updateQty(item.product_id, -1)}
                            >
                              <Minus size={12} strokeWidth={3} />
                            </ActionIcon>
                            <Text fw={900} size="sm" w={24} ta="center">{item.quantity}</Text>
                            <ActionIcon
                              variant="filled"
                              color="brand"
                              size="sm"
                              radius="xl"
                              onClick={() => updateQty(item.product_id, 1)}
                            >
                              <Plus size={12} strokeWidth={3} />
                            </ActionIcon>
                          </Group>
                        </Group>
                      </Box>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}
          </ScrollArea>

          {/* Confirm & Order Summary at Bottom */}
          <Box p="xl" className="bg-white border-t border-slate-100" style={{ flexShrink: 0, background: '#FFFFFF', borderTop: '2px solid #F1F5F9' }}>
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Stack gap={0}>
                  <Group gap="xs">
                    <ShoppingCart size={18} className="text-brand" strokeWidth={2.5} />
                    <Text fw={900} size="md" className="text-slate-800">Tóm tắt đơn hàng</Text>
                  </Group>
                  <Text size="xs" c="dimmed" fw={700}>Phục vụ {orderType === 'dine-in' ? 'tại chỗ' : 'mang về'} · {cartCount} món</Text>
                </Stack>
                {cart.length > 0 && (
                  <Button
                    variant="subtle"
                    color="red"
                    size="compact-xs"
                    onClick={clearCart}
                    leftSection={<Trash2 size={12} />}
                    fw={800}
                    radius="md"
                  >
                    Xóa tất cả
                  </Button>
                )}
              </Group>

              <Divider color="#F1F5F9" />

              {/* Total & Action */}
              <Group gap="xl" align="center" mt={4}>
                <Stack gap={0}>
                  <Text fw={800} c="dimmed" size="10px">CẦN THANH TOÁN</Text>
                  <Text fw={900} size="24px" c="brand" style={{ lineHeight: 1 }}>{formatCurrency(cartTotal)}</Text>
                </Stack>

                <Button
                  size="lg"
                  radius="xl"
                  loading={isCreatingOrder}
                  disabled={cart.length === 0 || (orderType === 'dine-in' && !tableId)}
                  onClick={() => {
                    if (orderType === 'dine-in') {
                      handleConfirmOrder();
                    } else {
                      setPaymentModalOpen(true);
                    }
                  }}
                  color="brand"
                  px="lg"
                  style={{
                    height: 48,
                    fontWeight: 900,
                    boxShadow: '0 6px 12px -4px var(--brand-primary-soft)',
                    flex: 1 
                  }}
                  leftSection={orderType === 'dine-in' ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <CreditCard size={18} strokeWidth={2.5} />}
                >
                  {orderType === 'dine-in' ? 'Xác nhận bàn' : 'Thanh toán'}
                </Button>
              </Group>

              {cart.length > 0 && (
                <Text size="10px" c="dimmed" ta="center" fw={600} style={{ opacity: 0.7 }}>
                  * Bằng việc nhấn thanh toán, đơn hàng sẽ được gửi trực tiếp đến khu vực bếp
                </Text>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Payment Modal */}
      <Modal
        opened={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={
          <Group gap="xs">
            <ThemeIcon size={32} radius="md" variant="light" color="brand">
              <CreditCard size={18} />
            </ThemeIcon>
            <Text fw={900} size="lg" className="text-slate-800">Thanh Toán Đơn Hàng</Text>
          </Group>
        }
        centered
        zIndex={1000}
        overlayProps={{ blur: 4, color: '#0f172a', opacity: 0.55 }}
        radius="xl"
        size="md"
        padding="xl"
      >
        <Stack gap="xl" mt="sm">
          {/* Total Amount Box */}
          <Paper p="md" radius="md" bg="brand-soft" className="border border-brand-soft">
            <Stack gap={4} align="center">
              <Text c="brand" fw={600} size="sm">Số tiền cần thu</Text>
              <Text fw={900} size="36px" c="brand" style={{ lineHeight: 1 }}>{formatCurrency(cartTotal)}</Text>
            </Stack>
          </Paper>

          {/* Payment Method Selection */}
          <PaymentMethodSelect 
            value={selectedPayment} 
            onChange={setSelectedPayment} 
          />

          {/* Actions */}
          <Group grow mt="xs">
            <Button
              variant="default"
              size="lg"
              radius="md"
              onClick={() => setPaymentModalOpen(false)}
              fw={600}
            >
              Hủy
            </Button>
            <Button
              size="lg"
              radius="md"
              loading={isCreatingOrder}
              color="brand"
              onClick={() => handleConfirmOrder()}
              leftSection={<CheckCircle2 size={20} />}
              className="shadow-lg shadow-blue-500/30"
              fw={800}
            >
              Lưu & In Bill
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
