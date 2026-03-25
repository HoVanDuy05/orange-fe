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

    // 1. Lắng nghe bảng ĐƠN HÀNG (Orders)
    const ordersChannel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('MỚI: Đã nhận đơn hàng!', payload);
          
          // Thông báo âm thanh (giả lập một tiếng chuông nếu trình duyệt cho phép)
          try {
             const audio = new Audio('/notification.mp3'); 
             audio.play().catch(() => {});
          } catch(e) {}

          notifications.show({
            title: '🔔 ĐƠN HÀNG MỚI!',
            message: `Khách hàng: ${payload.new.customer_name || 'Khách vãng lai'} vừa đặt món mới! Nhấn để xem chi tiết.`,
            color: 'blue',
            icon: <BellRing size={20} />,
            autoClose: 10000,
            className: 'border-2 border-blue-500 shadow-xl cursor-pointer',
            onClick: () => {
              router.push(`/admin/orders/${payload.new.id}`);
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
          
          // Nếu trạng thái đổi sang 'completed' (Hoàn thành)
          if (payload.new.status === 'completed' && payload.old.status !== 'completed') {
             notifications.show({
                title: 'Đơn hàng hoàn tất',
                message: `Bàn ${payload.new.table_id} đã thanh toán xong.`,
                color: 'green',
                icon: <CheckCircle2 size={18} />
             });
             queryClient.invalidateQueries({ queryKey: ['stats'] });
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
