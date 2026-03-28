'use client';

import React from 'react';
import { 
  Box, Stack, Group, Badge, SimpleGrid, UnstyledButton, Card, ThemeIcon, Text 
} from '@mantine/core';
import { Utensils } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePosContext } from '../POSContext';
import { AppTitle } from '@/components/common/AppTitle';
import { ActionButton } from '@/components/common/ActionButton';
import { SectionLoader } from '@/components/common/GlobalLoading';
import { Table } from '@/types/pos';

export default function DineInTableMap() {
  const router = useRouter();
  const { 
    state: { tables, tablesLoading }, 
    actions: { setTableId } 
  } = usePosContext();

  const handleTable = (id: number) => {
    setTableId(id.toString());
    router.push(`/pos/dine-in/${id}`);
  };

  return (
    <Box p="xl" style={{ overflowY: 'auto', height: '100%', background: '#F8FAFC' }}>
      <Stack gap="xl">
        <Group justify="space-between">
          <Group>
            <ActionButton type="back" onClick={() => router.push('/pos')} variant="outline" />
            <Box>
              <AppTitle level={2}>Sơ đồ phòng bàn</AppTitle>
              <Text size="sm" c="dimmed" fw={600}>Chọn bàn để tiếp tục order hoặc quẹt thanh toán.</Text>
            </Box>
          </Group>
           <Group gap="xs">
            <Badge variant="dot" color="gray" radius="sm">Trống</Badge>
            <Badge variant="dot" color="brand" radius="sm">Có khách</Badge>
            <Badge variant="dot" color="orange" radius="sm">Đặt trước</Badge>
          </Group>
        </Group>

        {tablesLoading ? <SectionLoader /> : (
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4, xl: 6 }} spacing="xl">
            {tables.map((t: Table) => {
              const isOccupied = t.is_occupied;
              return (
                <UnstyledButton key={t.id} onClick={() => handleTable(t.id)}>
                  <Card
                    radius="24px" p="xl" withBorder
                    className={`hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer border-2 ${isOccupied ? 'border-brand bg-blue-50/30' : 'border-slate-100 bg-white'}`}
                  >
                    <Stack align="center" gap="md">
                      <ThemeIcon size={56} radius="xl" variant={isOccupied ? 'filled' : 'light'} color={isOccupied ? 'brand' : 'gray'}>
                        <Utensils size={24} />
                      </ThemeIcon>
                      <Stack gap={2} align="center">
                        <Text fw={900} size="lg" className={isOccupied ? 'text-blue-700' : 'text-slate-700'}>{t.table_name}</Text>
                        <Badge variant="light" color={isOccupied ? 'brand' : 'gray'} size="xs" radius="sm">
                          {isOccupied ? 'ĐANG CÓ KHÁCH' : 'CÒN TRỐNG'}
                        </Badge>
                      </Stack>
                    </Stack>
                  </Card>
                </UnstyledButton>
              );
            })}
          </SimpleGrid>
        )}
      </Stack>
    </Box>
  );
}
