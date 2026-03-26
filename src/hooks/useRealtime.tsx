'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import { notifications } from '@mantine/notifications';
import { BellRing, CheckCircle2, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

/**
 * Hook lắng nghe thay đổi thời gian thực từ Supabase
 * Tự động cập nhật lại Cache của React Query khi có dữ liệu mới
 */
export const useRealtime = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    console.log('--- ĐANG KHỞI TẠO REAL-TIME UPDATE ---');

    // Helper: TTS Đọc tiếng Việt
    const speak = (text: string) => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const trySpeak = () => {
          const voices = window.speechSynthesis.getVoices();
          // Ưu tiên giọng Google hoặc Microsoft Tiếng Việt
          const viVoice = voices.find(v => v.lang.includes('vi-VN') && (v.name.includes('Google') || v.name.includes('Microsoft'))) ||
                        voices.find(v => v.lang.includes('vi-VN')) ||
                        voices.find(v => v.lang.toLowerCase().includes('vi'));
          if (viVoice) utterance.voice = viVoice;
          utterance.lang = 'vi-VN';
          utterance.rate = 0.95;
          window.speechSynthesis.speak(utterance);
        };
        if (window.speechSynthesis.getVoices().length > 0) trySpeak();
        else window.speechSynthesis.onvoiceschanged = trySpeak;
      }
    };

    // 1. Lắng nghe bảng ĐƠN HÀNG (Orders)
    const ordersChannel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('MỚI: Đã nhận đơn hàng!', payload);
          
          const customer = payload.new.customer_name || 'Khách vãng lai';
          const table = payload.new.table_name || 'Mang đi';

          // Phát âm thanh & Đọc thông báo
          try {
             // Phát tiếng chuông mặc định
             const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3'); 
             audio.play().catch(() => {});
             
             // AI Đọc
             speak(`Có đơn hàng mới từ ${table === 'Mang đi' ? 'đơn mang đi' : table}.`);
          } catch(e) {}

          notifications.show({
            title: '🔔 ĐƠN HÀNG MỚI!',
            message: `Bàn: ${table} - Khách: ${customer} vừa đặt món!`,
            color: 'blue',
            icon: <BellRing size={20} />,
            autoClose: 10000,
            className: 'border-2 border-blue-500 shadow-xl cursor-pointer',
            onClick: () => {
              router.push(`/orders/${payload.new.id}`);
            }
          });

          // Làm mới dữ liệu liên quan
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['stats'] });
          queryClient.invalidateQueries({ queryKey: ['tables'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('CẬP NHẬT: Đơn hàng thay đổi!', payload);
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          
          // Thông báo khi có đơn được thanh toán (để thu dọn bàn)
          if (payload.new.order_status === 'paid' && payload.old.order_status !== 'paid') {
             const tableName = payload.new.table_name || 'Mang đi';
             speak(`Bàn ${tableName} đã thanh toán.`);
             
             notifications.show({
                title: '💰 Đã thanh toán',
                message: `Bàn: ${tableName} đã thanh toán xong. Vui lòng kiểm tra và dọn dẹp (nếu cần).`,
                color: 'green',
                icon: <CheckCircle2 size={18} />
             });
             queryClient.invalidateQueries({ queryKey: ['stats'] });
             queryClient.invalidateQueries({ queryKey: ['tables'] });
          }
        }
      )
      .subscribe();

    // 2. Lắng nghe bảng DANH MỤC & SẢN PHẨM (Nếu cần thiết kế Real-time Menu)
    const catalogChannel = supabase
      .channel('public:catalog')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => queryClient.invalidateQueries({ queryKey: ['products'] })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => queryClient.invalidateQueries({ queryKey: ['categories'] })
      )
      .subscribe();

    return () => {
      console.log('--- ĐÓNG KÊNH REAL-TIME ---');
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(catalogChannel);
    };
  }, [queryClient]);

  return null;
};
