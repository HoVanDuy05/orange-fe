'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { notifications } from '@mantine/notifications';
import { BellRing, CheckCircle2, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import https from '@/api/https';

/**
 * Hook lắng nghe thay đổi thời gian thực từ Supabase
 * Tự động cập nhật lại Cache của React Query khi có dữ liệu mới
 */
export const useRealtime = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    console.log('🏁 useRealtime Initialized');

    // 🔊 MẸO: Mở khóa âm thanh trình duyệt ngay khi Admin nhấn chuột lần đầu
    const unlockAudio = () => {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      
      // Phát âm thanh im lặng để mở khóa
      const audio = new Audio();
      audio.play().catch(() => {});
      
      console.log('🔓 Âm thanh đã được mở khóa!');
      notifications.hide('audio-blocked');
      window.removeEventListener('click', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);

    const playBell = () => {
      if (localStorage.getItem('admin_muted') === 'true') return;
      try {
        const bell = new Audio('/bell-admin.wav');
        bell.volume = 1.0;
        bell.play()
          .then(() => {
            bell.onended = () => {
              const msg = new Audio('/am-thanh-don-hang-moi.mp3');
              msg.volume = 1.0;
              msg.play().catch(() => {});
            };
          })
          .catch(e => {
            console.warn('🔔 Lỗi phát chuông:', e);
            if (e.name === 'NotAllowedError') {
              notifications.show({
                id: 'audio-blocked',
                title: '⚠️ Bạn chưa bật âm thanh',
                message: 'Hãy nhấn chuột vào bất kỳ đâu trên trang để kích hoạt chuông báo đơn mới!',
                color: 'orange',
                autoClose: false,
              });
            }
          });
      } catch (e) { }
    };

    const playPaySound = () => {
      if (localStorage.getItem('admin_muted') === 'true') return;
      try {
        const audio = new Audio('/thanh-toan.wav');
        audio.play().catch(e => {
           if (e.name === 'NotAllowedError') {
              notifications.show({
                id: 'audio-blocked',
                title: '⚠️ Bạn chưa bật âm thanh',
                message: 'Hãy nhấn chuột vào bất kỳ đâu trên trang để kích hoạt chuông báo!',
                color: 'orange',
                autoClose: false,
              });
           }
        });
      } catch (e) {}
    };

    const channel = supabase
      .channel('admin_global_orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, async (payload) => {
        console.log('📬 [REALTIME] NHẬN ĐƠN MỚI Payload:', payload);

        let tableName = 'khách mang đi';
        if (payload.new.table_id) {
          try {
            const res = await https.get(`/tables/${payload.new.table_id}`);
            tableName = res.data?.data?.table_name || `bàn số ${payload.new.table_id}`;
          } catch (e) {
            tableName = `bàn số ${payload.new.table_id}`;
          }
        } else if (payload.new.table_name) {
          tableName = payload.new.table_name;
        }

        console.log(`📣 Đang thông báo cho: ${tableName}`);
        playBell();

        notifications.show({
          title: '🔔 CÓ ĐƠN HÀNG MỚI!',
          message: `Nguồn: ${tableName.toUpperCase()}`,
          color: 'blue',
          variant: 'filled',
          icon: <BellRing size={20} />,
          autoClose: 10000,
          onClick: () => router.push(`/orders/${payload.new.id}`)
        });

        queryClient.invalidateQueries({ queryKey: ['orders'] });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        console.log('📝 [REALTIME] CẬP NHẬT ĐƠN Payload:', payload);
        queryClient.invalidateQueries({ queryKey: ['orders'] });

        if (payload.new.order_status === 'paid' && payload.old.order_status !== 'paid') {
          const table = payload.new.table_name || 'Khách hàng';
          playPaySound();
          notifications.show({ title: '💰 Thanh toán', message: `${table} đã thanh toán xong.`, color: 'green' });
        }
      })
      .subscribe((status, err) => {
        console.log('🔌 Supabase Realtime Status:', status);
        if (err) console.error('❌ Lỗi kết nối Realtime:', err);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Đã kết nối Realtime! Sẵn sàng nhận đơn.');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, router]);

  return null;
};
