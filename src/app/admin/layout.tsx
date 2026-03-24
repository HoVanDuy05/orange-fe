'use client';

import React, { useEffect, useState } from 'react';
import {
  AppShell, Burger, Group, NavLink, Title, UnstyledButton, Text, Box, Avatar, Divider, Loader, Center
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { LayoutDashboard, ShoppingBag, FolderTree, Armchair, UserIcon, LogOut, Warehouse, Image as ImageIcon, ShoppingCart } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/store/authStore';
import { useRealtime } from '@/hooks/useRealtime';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const router = useRouter();
  useRealtime();
  const pathname = usePathname();
  const { user, token, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !token) {
      router.push('/login');
    }
  }, [mounted, token, router]);

  if (!mounted || !token) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-blue-50">
        <Center>
          <Loader color="blue" type="bars" />
        </Center>
      </div>
    );
  }

  const navItems = [
    { label: 'Tổng quan', icon: LayoutDashboard, href: '/admin' },
    { label: 'Đơn hàng', icon: ShoppingCart, href: '/admin/orders' },
    { label: 'Danh mục', icon: FolderTree, href: '/admin/categories' },
    { label: 'Món ăn', icon: ShoppingBag, href: '/admin/products' },
    { label: 'Nhập kho', icon: Warehouse, href: '/admin/stock' },
    { label: 'Thư viện Ảnh', icon: ImageIcon, href: '/admin/media' },
    { label: 'Quản lý bàn', icon: Armchair, href: '/admin/tables' },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="0"
      bg="#f8fafc" // Sắc thái xanh lam siêu nhẹ của Tailwind (slate-50)
    >
      <AppShell.Header className="bg-white border-b border-blue-100 shadow-sm">
        <Group h="100%" px="xl" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="blue" />
            <Group gap="xs" align="center">
              <img
                src="/logo-iuh-1.png"
                alt="IUH Logo"
                style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
              />
              <Box className="hidden sm:block">
                <Text size="xs" fw={800} c="blue.7" tt="uppercase" className="tracking-widest leading-none">
                  ADMIN PORTAL
                </Text>
                <Text size="xs" c="dimmed" className="leading-none mt-0.5">Hệ thống quản trị</Text>
              </Box>
            </Group>
          </Group>
          <Group gap="sm">
            <div className="text-right hidden sm:block">
              <Text size="sm" fw={600} className="text-slate-800 leading-tight">
                {user?.full_name || 'System Admin'}
              </Text>
              <Text size="xs" className="text-slate-500 font-mono">
                {user?.role || 'administrator'}
              </Text>
            </div>
            <Avatar radius="xl" color="blue" />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm" className="bg-white border-r border-blue-100 flex flex-col justify-between shadow-sm">
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
        <Box>
          <Divider my="sm" color="gray.2" />
          <UnstyledButton
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="w-full p-3 flex items-center justify-start text-slate-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} className="mr-3" />
            <Text size="sm" fw={600}>Đăng xuất an toàn</Text>
          </UnstyledButton>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main className="bg-[#f0f4f8]">
        <div className="h-full w-full p-6 text-slate-800 overflow-y-auto">
          {children}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
