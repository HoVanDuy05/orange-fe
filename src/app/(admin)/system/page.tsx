'use client';

import React, { useState } from 'react';
import {
  Title, Text, Stack, Group, Button, Box, Tabs, Card,
  TextInput, Select, ColorInput, Paper, Image, SimpleGrid
} from '@mantine/core';
import { Palette, CheckCircle } from 'lucide-react';
import { useSystem } from '@/hooks/useSystem';
import { SectionLoader } from '@/components/common/GlobalLoading';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import MediaLibraryModal from '@/components/common/MediaLibraryModal';

export default function SystemPage() {
  const {
    themes, isLoading, updateTheme
  } = useSystem();

  const [opened, setOpened] = useState(false);

  if (isLoading) return <SectionLoader />;

  // Group global settings from the first theme as source of truth
  const mainTheme = themes[0] || { brand_name: 'Orange Cafe', logo_url: '', font_family: 'Be Vietnam Pro', id: 1 };
  const adminTheme = themes.find(t => t.target_type === 'admin');
  const clientTheme = themes.find(t => t.target_type === 'client');

  const handleGlobalUpdate = (data: any) => {
    themes.forEach(t => updateTheme({ id: t.id, data }));
  };

  return (
    <Stack gap="xl">
      <PageHeader
        title="Hệ thống & Cấu hình"
        description="Quản lý nhận diện thương hiệu và tùy chỉnh giao diện toàn hệ thống."
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Hệ thống' }]}
      />

      <Card withBorder radius="xl" shadow="xs" p="xl" style={{ background: 'white' }}>
        <Tabs defaultValue="brand" color="brand" variant="pills" radius="xl">
          <Tabs.List mb="xl">
            <Tabs.Tab value="brand" leftSection={<Palette size={16} />}>Cấu hình Thương hiệu</Tabs.Tab>
            <Tabs.Tab value="colors" leftSection={<CheckCircle size={16} />}>Màu sắc Giao diện</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="brand">
            <Stack gap="xl">
              <Box>
                <Title order={4} fw={800} mb={4}>Thông tin nhận diện chung</Title>
                <Text size="sm" c="dimmed" mb="lg">Logo, tên thương hiệu và font chữ dùng chung cho App & Admin.</Text>
                
                <Paper withBorder radius="xl" p="xl" bg="gray.0" style={{ borderStyle: 'dashed' }}>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                    <Stack gap="md">
                      <TextInput 
                        label="Tên thương hiệu" 
                        defaultValue={mainTheme.brand_name} 
                        size="md" radius="md" fw={700}
                        onBlur={(e) => handleGlobalUpdate({ brand_name: e.target.value })}
                      />
                      <Box>
                        <Text size="sm" fw={800} mb={5}>Logo thương hiệu</Text>
                        <Group align="flex-end" gap="sm">
                          <Paper withBorder radius="md" p={10} bg="white" w={110} h={110} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <Image 
                               src={mainTheme.logo_url || '/orange-logo.png'} 
                               fit="contain" 
                               mah="100%" 
                             />
                          </Paper>
                          <Button variant="light" size="sm" onClick={() => setOpened(true)}>Thay đổi Logo</Button>
                        </Group>
                        <MediaLibraryModal 
                           opened={opened} 
                           onClose={() => setOpened(false)} 
                           folder="logo"
                           onSelect={(url) => handleGlobalUpdate({ logo_url: url })}
                           currentImageUrl={mainTheme.logo_url ?? undefined}
                        />
                      </Box>
                    </Stack>

                    <Stack gap="md">
                      <Select 
                        label="Font chữ hệ thống (Font Family)"
                        defaultValue={mainTheme.font_family || 'Be Vietnam Pro'}
                        data={[
                          { value: 'Be Vietnam Pro', label: 'Be Vietnam Pro' },
                          { value: 'Inter', label: 'Inter' },
                          { value: 'Roboto', label: 'Roboto' },
                          { value: 'Montserrat', label: 'Montserrat' },
                          { value: 'Quicksand', label: 'Quicksand' }
                        ]}
                        size="md" radius="md" fw={700}
                        onChange={(v) => handleGlobalUpdate({ font_family: v })}
                      />
                      <Text size="xs" c="dimmed">CHÚ Ý: Các thay đổi ở phần này sẽ được áp dụng cho toàn bộ Client và Admin.</Text>
                    </Stack>
                  </SimpleGrid>
                </Paper>
              </Box>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="colors">
             <Title order={4} fw={800} mb={4}>Tùy chỉnh màu sắc riêng biệt</Title>
             <Text size="sm" c="dimmed" mb="lg">Phân tách đặc trưng màu sắc cho khu vực Quản trị và ứng dụng Khách hàng.</Text>

             <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                {/* Admin Theme */}
                {adminTheme && (
                  <Paper withBorder radius="xl" p="xl" style={{ borderLeft: `8px solid ${adminTheme.primary_color}` }}>
                    <Text fw={900} size="sm" c="red.8" mb="lg" tt="uppercase">🔵 TRANG QUẢN TRỊ (ADMIN)</Text>
                    <SimpleGrid cols={2} spacing="md">
                       <ColorInput 
                         label="Màu chủ đạo" 
                         defaultValue={adminTheme.primary_color} 
                         onChangeEnd={(v) => updateTheme({ id: adminTheme.id, data: { primary_color: v } })}
                       />
                       <ColorInput 
                         label="Màu phụ" 
                         defaultValue={adminTheme.secondary_color || ''} 
                         onChangeEnd={(v) => updateTheme({ id: adminTheme.id, data: { secondary_color: v } })}
                       />
                    </SimpleGrid>
                  </Paper>
                )}

                {/* Client Theme */}
                {clientTheme && (
                  <Paper withBorder radius="xl" p="xl" style={{ borderLeft: `8px solid ${clientTheme.primary_color}` }}>
                    <Text fw={900} size="sm" c="green.8" mb="lg" tt="uppercase">🟢 ỨNG DỤNG KHÁCH HÀNG (CLIENT)</Text>
                    <SimpleGrid cols={2} spacing="md">
                       <ColorInput 
                         label="Màu chủ đạo" 
                         defaultValue={clientTheme.primary_color} 
                         onChangeEnd={(v) => updateTheme({ id: clientTheme.id, data: { primary_color: v } })}
                       />
                       <ColorInput 
                         label="Màu phụ" 
                         defaultValue={clientTheme.secondary_color || ''} 
                         onChangeEnd={(v) => updateTheme({ id: clientTheme.id, data: { secondary_color: v } })}
                       />
                    </SimpleGrid>
                  </Paper>
                )}
             </SimpleGrid>
          </Tabs.Panel>
        </Tabs>
      </Card>
    </Stack>
  );
}
