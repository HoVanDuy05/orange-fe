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

  // Global Audio/TTS Notification Logic (Controlled via useRealtime and localStorage)
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 🔑 GIẢI PHÁP: Tự động "mở khoá" âm thanh khi người dùng click bất cứ đâu
  useEffect(() => {
    setIsClient(true);
    const isMuted = localStorage.getItem('admin_muted') === 'true';
    setSoundEnabled(!isMuted);

    const unlockAudio = () => {
       // Tạo và Resume AudioContext rỗng để trình duyệt cho phép phát âm thanh từ sau đó
       const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
       if (audioCtx.state === 'suspended') audioCtx.resume();
       
       // Play một tiếng bíp cực nhỏ (0.01s) để kích hoạt Audio
       const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAD//w==');
       audio.play().catch(() => {});

       console.log('🔊 Đã mở khoá âm thanh cho hệ thống.');
       window.removeEventListener('click', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    return () => window.removeEventListener('click', unlockAudio);
  }, []);

  const toggleSound = () => {
    const newVal = !soundEnabled;
    setSoundEnabled(newVal);
    localStorage.setItem('admin_muted', (!newVal).toString());
    notifications.show({
      title: newVal ? 'Bật âm báo' : 'Tắt âm báo',
      message: newVal ? 'Hệ thống sẽ phát âm thanh khi có đơn mới.' : 'Hệ thống sẽ im lặng.',
      color: newVal ? 'blue' : 'gray',
      autoClose: 2000
    });
  };

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
          <Group gap="xs">
            <UnstyledButton
              onClick={() => {
                const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
                audio.play().catch(() => { });
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  const utterance = new SpeechSynthesisUtterance('Kiểm tra âm thanh thành công. Hệ thống đã sẵn sàng.');
                  const voices = window.speechSynthesis.getVoices();
                  const viVoice = voices.find(v => v.lang.includes('vi-VN')) || voices.find(v => v.lang.toLowerCase().startsWith('vi'));
                  if (viVoice) utterance.voice = viVoice;
                  utterance.lang = 'vi-VN';
                  window.speechSynthesis.speak(utterance);
                }
                notifications.show({ title: 'Loa thông báo', message: 'Âm thanh kiểm tra đã phát.', color: 'blue' });
              }}
              className="p-2 rounded-full hover:bg-blue-50 text-blue-500 transition-colors"
              title="Thử âm thanh"
            >
              <ConciergeBell size={20} />
            </UnstyledButton>

            <UnstyledButton
              onClick={toggleSound}
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
