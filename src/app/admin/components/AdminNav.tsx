'use client';

import React, { useEffect, useState } from 'react';
import {
  AppShell, Burger, Group, NavLink, Title, UnstyledButton, Text, Box, Avatar, Divider, Loader, Center,
  Stack
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { LayoutDashboard, ShoppingBag, FolderTree, Armchair, UserIcon, LogOut, Warehouse, Image as ImageIcon, ShoppingCart } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/store/authStore';
import { useRealtime } from '@/hooks/useRealtime';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
  { href: '/admin/products', label: 'Sản phẩm', icon: ShoppingBag },
  { href: '/admin/categories', label: 'Danh mục', icon: FolderTree },
  { href: '/admin/tables', label: 'Bàn', icon: Armchair },
  { href: '/admin/stock', label: 'Kho', icon: Warehouse },
  { href: '/admin/media', label: 'Media', icon: ImageIcon },
  { href: '/admin/users', label: 'Người dùng', icon: UserIcon },
];

export default function AdminNav({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const realtime = useRealtime();
  const [isClient, setIsClient] = useState(false);

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
          <UnstyledButton onClick={() => router.push('/admin/profile')}>
            <Group gap="xs">
              <Avatar radius="xl" color="blue" />
              <Box visibleFrom="sm">
                <Text size="sm" fw={600}>{user?.name || 'Admin'}</Text>
                <Text size="xs" c="dimmed">Quản trị viên</Text>
              </Box>
            </Group>
          </UnstyledButton>
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
                href={item.href}
                label={<Text size="sm" fw={600}>{item.label}</Text>}
                leftSection={<item.icon size={18} />}
                active={pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/admin')}
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
