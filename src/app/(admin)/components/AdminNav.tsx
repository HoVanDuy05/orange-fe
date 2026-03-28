'use client';

import React, { useEffect, useState } from 'react';
import {
  AppShell, Burger, Group, Text, Box, Avatar, Divider,
  Loader, Center, Stack, Tooltip, UnstyledButton, Badge,
  Menu, Indicator, rem, ScrollArea,
  Button
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  LogOut, BarChart3, Bell, BellOff, ChevronRight,
  Settings, User, ExternalLink, Volume2, VolumeX,
  Circle
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/store/authStore';
import { useRealtime } from '@/hooks/useRealtime';
import { notifications } from '@mantine/notifications';
import { ADMIN_NAV_GROUPS } from '@/constants/menu';
import { useBrandTheme } from '@/providers/BrandThemeProvider';

export default function AdminNav({ children }: { children: React.ReactNode }) {
  const { activeTheme } = useBrandTheme();
  const primaryColor = activeTheme?.primary_color || '#FF6B00';
  const secondaryColor = activeTheme?.secondary_color || '#FF8533';

  const [opened, { toggle, close }] = useDisclosure();
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  useRealtime();
  const [isClient, setIsClient] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Mock notifications
  const [notificationsList, setNotificationsList] = useState([
    { id: 1, title: 'Đơn hàng mới', message: 'Bạn có đơn hàng #1234 cần xử lý', time: '2 phút trước', read: false },
    { id: 2, title: 'Hết hàng', message: 'Sản phẩm "Cà phê sữa" đã hết hàng', time: '15 phút trước', read: false },
    { id: 3, title: 'Hệ thống', message: 'Cập nhật phiên bản mới thành công', time: '1 giờ trước', read: true },
  ]);

  const unreadCount = notificationsList.filter(n => !n.read).length;

  useEffect(() => {
    setIsClient(true);
    const isMuted = localStorage.getItem('admin_muted') === 'true';
    setSoundEnabled(!isMuted);

    const unlockAudio = () => {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAD//w==');
      audio.play().catch(() => { });
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
      title: newVal ? '🔔 Bật thông báo âm thanh' : '🔕 Tắt thông báo âm thanh',
      message: newVal ? 'Sẽ phát âm khi có đơn hàng mới.' : 'Hệ thống sẽ im lặng.',
      style: { borderLeft: `4px solid ${primaryColor}` },
      autoClose: 2000,
    });
  };

  useEffect(() => {
    if (!isLoading && !user && isClient) router.push('/login');
  }, [user, isLoading, router, isClient]);

  if (!isClient || isLoading || !user) {
    return (
      <Center h="100vh" style={{ background: '#FFF' }} suppressHydrationWarning>
        <Stack align="center" gap="md">
          <div style={{
            width: 56, height: 56,
            borderRadius: '50%',
            border: `3px solid ${primaryColor}`,
            borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite',
          }} />
          <Text c="dimmed" size="sm" fw={600}>Đang tải hệ thống...</Text>
        </Stack>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </Center>
    );
  }

  return (
    <AppShell
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      header={{ height: 64 }}
      padding={0}
    >
      <AppShell.Header style={{ background: '#FFFFFF', borderBottom: '1px solid #F1F5F9' }}>
        <Group h="100%" px="lg" justify="space-between">
          <Group gap="sm">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" color="#1E293B" />
            <Group gap="xs" align="center">
              <img src={activeTheme?.logo_url || "/orange-logo.png"} alt="Logo" style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
            </Group>
          </Group>

          <Group gap="xs">
            <Menu shadow="xl" width={320} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }} radius="lg">
              <Menu.Target>
                <Indicator label={unreadCount} size={16} offset={4} color="red" disabled={unreadCount === 0} withBorder>
                  <UnstyledButton
                    style={{
                      padding: '8px',
                      borderRadius: '10px',
                      color: '#64748B',
                      background: 'rgba(241, 245, 249, 0.8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Bell size={18} />
                  </UnstyledButton>
                </Indicator>
              </Menu.Target>

              <Menu.Dropdown p={0}>
                <Box p="md" style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <Group justify="space-between">
                    <Text fw={800} size="sm">Thông báo</Text>
                    <Badge style={{ background: primaryColor }} variant="filled" size="xs">{unreadCount} mới</Badge>
                  </Group>
                </Box>

                <ScrollArea h={300}>
                  {notificationsList.map((n) => (
                    <Menu.Item key={n.id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <Group gap="sm" wrap="nowrap" align="flex-start">
                        {!n.read && <Circle size={8} fill={primaryColor} color={primaryColor} style={{ marginTop: 6 }} />}
                        <Box style={{ flex: 1 }}>
                          <Text size="sm" fw={n.read ? 600 : 800} c={n.read ? 'gray.7' : 'gray.9'}>{n.title}</Text>
                          <Text size="xs" c="dimmed" lineClamp={2}>{n.message}</Text>
                          <Text size="10px" style={{ color: primaryColor }} mt={4} fw={700}>{n.time}</Text>
                        </Box>
                      </Group>
                    </Menu.Item>
                  ))}
                </ScrollArea>

                <Box p="xs" style={{ borderTop: '1px solid #F1F5F9' }}>
                  <Button variant="subtle" fullWidth size="compact-xs" color="gray" component={Link} href="/notifications">
                    Xem tất cả thông báo
                  </Button>
                </Box>
              </Menu.Dropdown>
            </Menu>

            <Divider orientation="vertical" mx="xs" color="gray.1" visibleFrom="sm" />

            <Menu shadow="xl" width={220} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }} radius="lg">
              <Menu.Target>
                <UnstyledButton
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', borderRadius: '12px', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Avatar
                    size={34}
                    radius="xl"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, color: 'white', fontWeight: 800, border: '2px solid white', boxShadow: `0 2px 4px ${primaryColor}44` }}
                  >
                    {(user?.name || user?.full_name || 'A').charAt(0).toUpperCase()}
                  </Avatar>
                  <Box visibleFrom="sm">
                    <Text size="sm" fw={800} c="gray.9" style={{ lineHeight: 1.2 }}>
                      {user?.name || user?.full_name || 'Admin'}
                    </Text>
                    <Text size="xs" fw={600} c="dimmed" style={{ lineHeight: 1.2 }}>
                      {user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                    </Text>
                  </Box>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Tài khoản</Menu.Label>
                <Menu.Item leftSection={<User size={16} />} component={Link} href="/profile">
                  Hồ sơ cá nhân
                </Menu.Item>
                <Menu.Item leftSection={<Settings size={16} />} component={Link} href="/system">
                  Cài đặt hệ thống
                </Menu.Item>
                <Menu.Label>Âm thanh</Menu.Label>
                <Menu.Item
                  leftSection={soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  onClick={toggleSound}
                  rightSection={<Text size="xs" c="dimmed">{soundEnabled ? 'Bật' : 'Tắt'}</Text>}
                >
                  Âm báo đơn hàng
                </Menu.Item>
                <Menu.Divider />
                <Menu.Label>Hành động</Menu.Label>
                <Menu.Item color="red" leftSection={<LogOut size={16} />} onClick={logout}>
                  Đăng xuất
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        style={{
          background: '#FFFFFF',
          borderRight: '1px solid #F1F5F9',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 12px 0',
        }}
      >
        <Box style={{ flex: 1, overflowY: 'auto' }}>
          {ADMIN_NAV_GROUPS.map((group) => (
            <Box key={group.label} mb="lg">
              <Text
                size="10px"
                fw={800}
                tt="uppercase"
                style={{ color: '#94A3B8', letterSpacing: '0.15em', padding: '0px 12px 8px' }}
              >
                {group.label}
              </Text>
              {group.items.map((item) => {
                const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/');
                return (
                  <Link key={item.href} href={item.href} onClick={close} style={{ textDecoration: 'none', display: 'block', marginBottom: 4 }}>
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 12,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: isActive ? `linear-gradient(90deg, ${primaryColor}1A 0%, ${primaryColor}05 100%)` : 'transparent',
                        borderLeft: isActive ? `4px solid ${primaryColor}` : '4px solid transparent',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F8FAFC'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <item.icon
                        size={18}
                        style={{ color: isActive ? primaryColor : '#64748B', flexShrink: 0 }}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <Text
                        size="sm"
                        fw={isActive ? 800 : 600}
                        style={{ color: isActive ? primaryColor : '#334155', flex: 1 }}
                      >
                        {item.label}
                      </Text>
                      {(item as any).badge && (
                        <Badge 
                          size="xs" 
                          variant="light" 
                          style={{ 
                            background: `${primaryColor}1A`, 
                            color: primaryColor,
                            fontSize: 9, 
                            fontWeight: 800 
                          }}
                        >
                          {(item as any).badge}
                        </Badge>
                      )}
                    </Box>
                  </Link>
                );
              })}
            </Box>
          ))}
        </Box>

        <Box style={{ borderTop: '1px solid #F1F5F9', padding: '16px 0' }}>
          <UnstyledButton
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: '10px 14px', borderRadius: 12,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#FEF2F2')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={18} style={{ color: '#EF4444' }} strokeWidth={2.5} />
            <Text size="sm" fw={700} style={{ color: '#EF4444' }}>Đăng xuất an toàn</Text>
          </UnstyledButton>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main style={{ background: '#F8FAFC', minHeight: '100vh' }}>
        <Box p={{ base: 'md', sm: 'xl' }} style={{ maxWidth: '1600px', margin: '0 auto' }}>
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
