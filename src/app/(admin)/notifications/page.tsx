'use client';

import React, { useState } from 'react';
import { 
  Stack, Group, Text, Box, Paper, Badge, 
  ActionIcon, Tooltip, Divider, Center, Button, 
  ThemeIcon, SimpleGrid, Card, Tabs, Checkbox
} from '@mantine/core';
import { 
  Bell, CheckCircle2, AlertCircle, Info, 
  Trash2, MailOpen, Mail, Filter, RefreshCcw,
  MoreVertical, Calendar, ChevronRight, AlertTriangle, BellOff
} from 'lucide-react';
import { PageHeader } from '@/components/admin/ui/PageHeader';
import { useNotifications } from '@/hooks/useNotifications';
import { fromNow } from '@/utils/format';
import { NotificationType } from '@/types/notifications';
import { getNotificationIcon, getNotificationColor } from '@/utils/notification-ui';

export default function NotificationsPage() {
  const { 
    state: { list, activeTab, filteredList, unreadCount },
    actions: { markAllRead, markAsRead, deleteNotification, clearAll, setActiveTab }
  } = useNotifications();

  return (
    <Box p="xl">
      <Stack gap="xl">
        <PageHeader 
          title="Trung tâm Thông báo" 
          description="Theo dõi tất cả các sự kiện, cảnh báo và tin nhắn hệ thống tại đây."
          actions={
            <Group gap="sm">
              <Button 
                variant="subtle" 
                color="gray" 
                leftSection={<MailOpen size={16} />} 
                onClick={markAllRead}
                fw={700}
                radius="md"
              >
                Đánh dấu tất cả đã đọc
              </Button>
              <Button 
                variant="light" 
                color="red" 
                leftSection={<Trash2 size={16} />} 
                onClick={clearAll}
                fw={700}
                radius="md"
              >
                Xóa tất cả
              </Button>
            </Group>
          }
        />

        <Card withBorder radius="xl" p="md" shadow="sm">
          <Tabs value={activeTab} onChange={setActiveTab} color="brand">
            <Group justify="space-between" align="center" px="xs">
              <Tabs.List style={{ borderBottom: 'none' }}>
                <Tabs.Tab value="all" leftSection={<Bell size={14} />} styles={{ tab: { fontWeight: 800 } }}>
                  Tất cả ({list.length})
                </Tabs.Tab>
                <Tabs.Tab value="unread" leftSection={<Mail size={14} />} styles={{ tab: { fontWeight: 800 } }}>
                  Chưa đọc ({list.filter(n => !n.read).length})
                </Tabs.Tab>
              </Tabs.List>
              
              <Group gap="xs">
                 <ActionIcon variant="light" color="gray" radius="md"><Filter size={18} /></ActionIcon>
                 <ActionIcon variant="light" color="brand" radius="md"><RefreshCcw size={18} /></ActionIcon>
              </Group>
            </Group>
          </Tabs>
        </Card>

        {filteredList.length === 0 ? (
          <Center h={400} className="bg-white border-2 border-dashed border-slate-100 rounded-[32px]">
            <Stack align="center" gap="sm">
              <ThemeIcon size={80} radius="xl" variant="light" color="gray">
                <BellOff size={40} className="text-slate-300" />
              </ThemeIcon>
              <Text fw={800} c="dimmed">Không có thông báo nào mới</Text>
              <Text size="sm" c="dimmed">Chúng tôi sẽ thông báo cho bạn khi có sự kiện quan trọng.</Text>
            </Stack>
          </Center>
        ) : (
          <Stack gap="sm">
            {filteredList.map((n) => (
              <Paper 
                key={n.id} 
                withBorder 
                radius="24px" 
                p="md" 
                className={`transition-all hover:shadow-md hover:border-brand cursor-pointer ${!n.read ? 'bg-blue-50/20 border-blue-100' : 'bg-white'}`}
                onClick={() => markAsRead(n.id)}
              >
                <Group justify="space-between" wrap="nowrap" align="flex-start">
                  <Group gap="md" wrap="nowrap" align="flex-start">
                    <ThemeIcon 
                      size={48} 
                      radius="xl" 
                      variant="light" 
                      color={getNotificationColor(n.type)}
                      className="shadow-sm"
                    >
                      {getNotificationIcon(n.type)}
                    </ThemeIcon>
                    <Stack gap={4}>
                      <Group gap="xs">
                        <Text fw={800} size="md" c={!n.read ? 'gray.9' : 'gray.7'}>{n.title}</Text>
                        {!n.read && <Badge size="xs" color="brand" variant="filled">Mới</Badge>}
                      </Group>
                      <Text size="sm" c="dimmed" fw={500} lineClamp={2}>{n.message}</Text>
                      <Group gap="md" mt={4}>
                        <Group gap={4}>
                          <Calendar size={12} className="text-slate-400" />
                          <Text size="11px" fw={700} c="dimmed">{fromNow(n.time)}</Text>
                        </Group>
                        <Divider orientation="vertical" />
                        <Text size="11px" fw={700} c={getNotificationColor(n.type)} tt="uppercase" style={{ letterSpacing: '0.05em' }}>
                          Hệ thống {n.type}
                        </Text>
                      </Group>
                    </Stack>
                  </Group>

                  <Group gap={4}>
                    <Tooltip label="Đánh dấu là đã đọc">
                      <ActionIcon variant="subtle" color="gray" radius="md" onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}><CheckCircle2 size={18} /></ActionIcon>
                    </Tooltip>
                    <ActionIcon variant="subtle" color="red" radius="md" onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}>
                      <Trash2 size={18} />
                    </ActionIcon>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

