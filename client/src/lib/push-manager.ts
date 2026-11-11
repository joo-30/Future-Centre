import { accountApi } from './portal-api';

function urlB64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function getPushPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

export async function requestAndSubscribePush(): Promise<{
  ok: boolean;
  permission: NotificationPermission;
  error?: string;
}> {
  if (!isPushSupported()) {
    return { ok: false, permission: 'denied', error: 'المتصفح لا يدعم إشعارات الـ Push' };
  }

  try {
    // 1. Ask browser / OS permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { ok: false, permission };
    }

    // 2. Wait for Service Worker to be active
    const reg = await navigator.serviceWorker.ready;

    // 3. Fetch VAPID public key from backend
    const { publicKey } = await accountApi.getPushKey();
    if (!publicKey) {
      throw new Error('لم يتم استلام مفتاح VAPID من الخادم.');
    }

    // 4. Check existing subscription or subscribe fresh
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(publicKey) as unknown as BufferSource,
      });
    }

    // 5. Send subscription to backend
    const jsonSub = sub.toJSON();
    if (jsonSub.endpoint && jsonSub.keys?.p256dh && jsonSub.keys?.auth) {
      await accountApi.subscribePush({
        endpoint: jsonSub.endpoint,
        keys: {
          p256dh: jsonSub.keys.p256dh,
          auth: jsonSub.keys.auth,
        },
      });
    }

    // 6. Trigger confirmation native notification via service worker
    await reg.showNotification('مركز المستقبل للتغذية 🔔', {
      body: 'تم تفعيل إشعارات الهاتف الخارجية بنجاح! ستصلك التنبيهات فور صدورها.',
      icon: '/icons/pwa-192x192.png',
      badge: '/icons/pwa-192x192.png',
      tag: 'welcome-push',
    });

    return { ok: true, permission: 'granted' };
  } catch (err) {
    console.error('[PushManager] Subscription error:', err);
    return {
      ok: false,
      permission: getPushPermission(),
      error: err instanceof Error ? err.message : 'فشل الاشتراك في الإشعارات',
    };
  }
}

export async function sendTestExternalPush(): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await accountApi.testPush();
    return { ok: res.ok };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'تعذر إرسال الإشعار التجريبي' };
  }
}
