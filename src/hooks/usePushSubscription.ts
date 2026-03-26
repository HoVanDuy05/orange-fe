import { useEffect } from 'react';
import https from '@/api/https';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushSubscription(identifier: string) {
  useEffect(() => {
    if (!identifier) return;
    
    // Check if service workers and push messaging are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('❌ Trình duyệt không hỗ trợ Web Push Notifications');
      return;
    }

    async function subscribeToPush() {
      try {
        // Đăng ký Service Worker
        const register = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker Admin đăng ký thành công');

        // Yêu cầu quyền thông báo
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('❌ Admin từ chối nhận thông báo Push nền!');
          return;
        }

        // Subscription
        const subscription = await register.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        // Gửi lên Backend (đánh dấu đây là máy của admin)
        await https.post('/push/subscribe', {
          customer_phone: identifier,
          subscription
        });

        console.log(`🚀 Đã đăng ký nhận Push (Nền) cho ID: ${identifier}`);
      } catch (error) {
        console.error('Lỗi khi đăng ký Admin Web Push:', error);
      }
    }

    subscribeToPush();
  }, [identifier]);
}
