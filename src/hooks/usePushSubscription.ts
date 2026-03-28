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
        const register = await navigator.serviceWorker.register('/sw.js');
        const permission = await Notification.requestPermission();
        if (permission !== 'granted' || !VAPID_PUBLIC_KEY) return;

        try {
          const subscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
          });

          await https.post('/push/subscribe', {
            customer_phone: identifier,
            subscription: subscription.toJSON()
          });
        } catch (subError: any) {
          // Nếu lỗi do key cũ còn tồn tại, ta hủy đăng ký cũ và đăng ký lại
          if (subError.name === 'InvalidStateError') {
            const oldSub = await register.pushManager.getSubscription();
            if (oldSub) {
              await oldSub.unsubscribe();
              // Thử lại lần nữa sau khi đã gỡ
              const newSub = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
              });
              await https.post('/push/subscribe', {
                customer_phone: identifier,
                subscription: newSub.toJSON()
              });
            }
          }
        }
      } catch (error) {
        // Silent fail in production
      }
    }

    subscribeToPush();
  }, [identifier]);
}
