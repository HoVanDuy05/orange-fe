'use client';

import React, { useEffect, useState } from 'react';
import {
  AppShell, Burger, Group, NavLink, Title, UnstyledButton, Text, Box, Avatar, Divider, Loader, Center,
  Stack
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { LayoutDashboard, ShoppingBag, FolderTree, Armchair, UserIcon, LogOut, Warehouse, Image as ImageIcon, ShoppingCart, ConciergeBell } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/authStore';
import { useRealtime } from '@/hooks/useRealtime';
import { useQuery } from '@tanstack/react-query';
import https from '@/api/https';
import { notifications } from '@mantine/notifications';
import { IconVolume, IconVolumeOff } from '@tabler/icons-react';

const navItems = [
  // 1. Tổng quan
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },

  // 2. Bán hàng (quan trọng nhất)
  { href: '/pos', label: 'Gọi món (POS)', icon: ConciergeBell },
  { href: '/orders', label: 'Đơn hàng', icon: ShoppingCart },

  // 3. Sản phẩm & danh mục
  { href: '/products', label: 'Sản phẩm', icon: ShoppingBag },
  { href: '/categories', label: 'Danh mục', icon: FolderTree },

  // 4. Vận hành quán
  { href: '/tables', label: 'Bàn', icon: Armchair },
  { href: '/stock', label: 'Kho', icon: Warehouse },

  // 5. Nội dung & hệ thống
  { href: '/media', label: 'Media', icon: ImageIcon },
  // { href: '/users', label: 'Người dùng', icon: UserIcon },
];

export default function AdminNav({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const realtime = useRealtime();
  const [isClient, setIsClient] = useState(false);

  // Global Audio/TTS Notification Logic
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevOrdersCount = React.useRef<number>(0);

  const { data: rawOrders } = useQuery({
    queryKey: ['orders-global'],
    queryFn: async () => {
      try {
        const res = await https.get('/orders');
        return Array.isArray(res.data) ? res.data : (res.data?.data || []);
      } catch { return []; }
    },
    refetchInterval: 15000,
    enabled: !!user,
  });

  const speak = (text: string) => {
    if ('speechSynthesis' in window && soundEnabled) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      const trySpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        // Lọc tìm giọng đọc Tiếng Việt chuẩn nhất (ưu tiên Google/Microsoft)
        let viVoice = voices.find(v => v.lang.includes('vi-VN') && (v.name.includes('Google') || v.name.includes('Microsoft'))) ||
                      voices.find(v => v.lang.includes('vi-VN')) ||
                      voices.find(v => v.lang.toLowerCase().startsWith('vi'));
        
        if (viVoice) {
          utterance.voice = viVoice;
          console.log('✅ Admin Voice:', viVoice.name);
        }
        utterance.lang = 'vi-VN';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        trySpeak();
      } else {
        window.speechSynthesis.onvoiceschanged = trySpeak;
      }
    }
  };

  useEffect(() => {
    if (rawOrders && rawOrders.length > prevOrdersCount.current) {
      if (prevOrdersCount.current > 0 && soundEnabled) {
        // Play notification sound
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
        audio.play().catch(() => {});

        // Notification popup
        const latestOrder = rawOrders[0];
        const tableName = latestOrder?.table_name || 'Mang đi';
        notifications.show({
          title: '🔔 CÓ ĐƠN HÀNG MỚI!',
          message: `Một đơn hàng vừa được gửi đến từ: ${tableName}`,
          color: 'blue',
          autoClose: 10000,
          position: 'top-right'
        });

        // TTS Read Aloud
        speak(`Có đơn hàng mới từ ${tableName === 'Mang đi' ? 'đơn mang đi' : tableName}`);
      }
      prevOrdersCount.current = rawOrders.length;
    }
  }, [rawOrders, soundEnabled]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !user && isClient) {
      router.push('/login');
    }
  }, [user, isLoading, router, isClient]);

  if (!isClient || isLoading || !user) {
    return (
      <Center h="100vh" suppressHydrationWarning>
        <Stack align="center">
          <Loader size="lg" color="blue" />
          <Text c="dimmed">Đang tải...</Text>
        </Stack>
      </Center>
    );
  }

  return (
    <AppShell
      navbar={{ width: 280, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header className="bg-white border-b border-blue-100 shadow-sm">
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <img src="/logo-iuh.png" alt="IUH Logo" className="h-[45px] w-auto object-contain" />
          </Group>
          <Group gap="sm">
            <UnstyledButton 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-full transition-colors ${soundEnabled ? 'hover:bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-400'}`}
              title={soundEnabled ? 'Chuông báo: Bật' : 'Chuông báo: Tắt'}
            >
              {soundEnabled ? <IconVolume size={20} /> : <IconVolumeOff size={20} />}
            </UnstyledButton>
            
            <UnstyledButton onClick={() => router.push('/profile')}>
              <Group gap="xs">
                <Avatar radius="xl" color="blue" />
                <Box visibleFrom="sm">
                  <Text size="sm" fw={600}>{user?.name || 'Admin'}</Text>
                  <Text size="xs" c="dimmed">Quản trị viên</Text>
                </Box>
              </Group>
            </UnstyledButton>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm" className="bg-white border-r border-blue-100 flex flex-col justify-between shadow-sm">
        <Box>
          <Box className="flex-1 mt-4">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" className="px-4 mb-2 tracking-wider text-slate-400">
              Hệ thống Quản trị
            </Text>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={<Text size="sm" fw={600}>{item.label}</Text>}
                leftSection={<item.icon size={18} />}
                active={!!pathname && (pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/'))}
                variant="light"
                color="blue"
                className={`rounded-lg mb-1 transition-all ${pathname === item.href
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                  }`}
              />
            ))}
          </Box>
        </Box>

        <Box>
          <Divider my="sm" />
          <NavLink
            href="#"
            label={<Text size="sm" fw={600}>Đăng xuất</Text>}
            leftSection={<LogOut size={18} />}
            onClick={logout}
            variant="light"
            color="red"
            className="rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600"
          />
        </Box>
      </AppShell.Navbar>

      <AppShell.Main className="bg-[#f0f4f8]">
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
