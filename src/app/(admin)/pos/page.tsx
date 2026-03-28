'use client';

import React from 'react';
import { 
  Center, Stack, SimpleGrid, UnstyledButton, Card, ThemeIcon, Text, Button 
} from '@mantine/core';
import { Utensils, ShoppingBag, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePosContext } from './POSContext';
import { AppTitle } from '@/components/common/AppTitle';

export default function POSModeSelector() {
  const router = useRouter();
  const { actions: { resetStore, setOrderType } } = usePosContext();

  const handleMode = (mode: 'dine-in' | 'take-away') => {
    resetStore();
    setOrderType(mode);
    if (mode === 'dine-in') router.push('/pos/dine-in');
    else router.push('/pos/take-away');
  };

  return (
    <Center h="calc(100vh - 120px)">
      <Stack gap="xl" align="center" style={{ maxWidth: 900, width: '100%', px: 20 }}>
        <Stack gap={0} align="center">
          <AppTitle level={1} style={{ fontSize: 42 }}>Chào buổi sáng, Hero! ☕</AppTitle>
          <Text c="dimmed" size="lg" fw={600}>Hôm nay bạn muốn bắt đầu phục vụ từ đâu?</Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={40} mt={40} style={{ width: '100%' }}>
          {/* OPTION: DINE-IN */}
          <UnstyledButton onClick={() => handleMode('dine-in')}>
            <Card 
              radius="32px" p={40} withBorder shadow="sm" 
              className="hover:shadow-2xl hover:-translate-y-2 transition-all group bg-white border-slate-100"
            >
              <Stack align="center" gap="xl">
                <ThemeIcon size={120} radius="xl" variant="light" color="brand" className="group-hover:scale-110 transition-transform">
                  <Utensils size={60} strokeWidth={1.5} />
                </ThemeIcon>
                <Stack gap={4} align="center">
                  <Text fw={900} size="28px" className="text-slate-800">Đặt tại bàn</Text>
                  <Text c="dimmed" fw={600} ta="center">Phục vụ khách hàng thưởng thức tại không gian của quán.</Text>
                </Stack>
                <Button variant="light" fullWidth radius="xl" size="lg" color="brand" fw={800} rightSection={<ChevronRight size={20} />}>
                  Chọn bàn ngay
                </Button>
              </Stack>
            </Card>
          </UnstyledButton>

          {/* OPTION: TAKE-AWAY */}
          <UnstyledButton onClick={() => handleMode('take-away')}>
            <Card 
              radius="32px" p={40} withBorder shadow="sm"
              className="hover:shadow-2xl hover:-translate-y-2 transition-all group bg-white border-slate-100"
            >
              <Stack align="center" gap="xl">
                <ThemeIcon size={120} radius="xl" variant="light" color="indigo" className="group-hover:scale-110 transition-transform">
                  <ShoppingBag size={60} strokeWidth={1.5} />
                </ThemeIcon>
                <Stack gap={4} align="center">
                  <Text fw={900} size="28px" className="text-slate-800">Mang đi</Text>
                  <Text c="dimmed" fw={600} ta="center">Khách hàng mua mang đi hoặc đặt giao hàng nhanh chóng.</Text>
                </Stack>
                <Button variant="light" fullWidth radius="xl" size="lg" color="indigo" fw={800} rightSection={<ChevronRight size={20} />}>
                  Lên đơn ngay
                </Button>
              </Stack>
            </Card>
          </UnstyledButton>
        </SimpleGrid>
      </Stack>
    </Center>
  );
}
