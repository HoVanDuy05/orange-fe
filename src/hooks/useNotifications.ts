import { useState } from 'react';
import { MOCK_NOTIFICATIONS } from '@/constants/notifications';
import { NotificationItem } from '@/types/notifications';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export function useNotifications() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [list, setList] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  
  // Tab from URL
  const activeTab = searchParams.get('tab') || 'all';

  const setActiveTab = (val: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (!val || val === 'all') params.delete('tab'); else params.set('tab', val);
    router.push(`${pathname}?${params.toString()}`);
  };

  const markAllRead = () => {
    setList(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setList(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const deleteNotification = (id: number) => {
    setList(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setList([]);
  };

  const filteredList = list.filter(n => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  return {
    state: {
      list,
      activeTab,
      filteredList,
      unreadCount: list.filter(n => !n.read).length
    },
    actions: {
      setActiveTab,
      markAllRead,
      markAsRead,
      deleteNotification,
      clearAll
    }
  };
}
