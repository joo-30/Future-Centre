import { createRequire } from 'node:module';
import mongoose from 'mongoose';
import { config } from '../config.js';
import { PushSubscription } from '../models/push-subscription.model.js';
import { extractPhoneVariants } from './notification.service.js';

const require = createRequire(import.meta.url);
const webpush = require('web-push');

// Configure Web Push with VAPID credentials
if (config.VAPID_PUBLIC_KEY && config.VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(
      config.VAPID_SUBJECT || 'mailto:admin@futurecenter.clinic',
      config.VAPID_PUBLIC_KEY,
      config.VAPID_PRIVATE_KEY,
    );
  } catch (err) {
    console.error('[WebPush] Error setting VAPID details:', err);
  }
}

export function getVapidPublicKey(): string {
  return config.VAPID_PUBLIC_KEY;
}

export interface SaveSubscriptionParams {
  userId?: mongoose.Types.ObjectId | string | null;
  patientPhone?: string;
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  userAgent?: string;
}

export async function savePushSubscription(params: SaveSubscriptionParams) {
  const { subscription, userAgent } = params;
  if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    throw new Error('Invalid push subscription format');
  }

  let resolvedUserId: mongoose.Types.ObjectId | null = null;
  if (params.userId) {
    resolvedUserId = typeof params.userId === 'string'
      ? new mongoose.Types.ObjectId(params.userId)
      : params.userId;
  }

  return await PushSubscription.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    {
      $set: {
        userId: resolvedUserId,
        patientPhone: (params.patientPhone || '').trim(),
        keys: subscription.keys,
        userAgent: userAgent || '',
      },
    },
    { upsert: true, returnDocument: 'after' },
  );
}

export interface SendPushParams {
  userId?: mongoose.Types.ObjectId | string | null;
  patientPhone?: string;
  title: string;
  body: string;
  icon?: string;
  link?: string;
}

export async function sendPushNotification(params: SendPushParams): Promise<{ sent: number; failed: number }> {
  const queryConditions: Record<string, unknown>[] = [];

  if (params.userId) {
    const uid = typeof params.userId === 'string'
      ? new mongoose.Types.ObjectId(params.userId)
      : params.userId;
    queryConditions.push({ userId: uid });
  }

  if (params.patientPhone) {
    const variants = extractPhoneVariants(params.patientPhone);
    if (variants.length > 0) {
      queryConditions.push({ patientPhone: { $in: variants } });
    }
  }

  if (queryConditions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const subscriptions = await PushSubscription.find({ $or: queryConditions }).lean();
  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const payload = JSON.stringify({
    title: params.title,
    body: params.body,
    icon: params.icon || '/icons/pwa-192x192.png',
    badge: '/icons/pwa-192x192.png',
    link: params.link || '/account',
    timestamp: Date.now(),
  });

  let sent = 0;
  let failed = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth,
            },
          },
          payload,
          {
            TTL: 60 * 60 * 24, // 24 hours
            urgency: 'high',
          },
        );
        sent++;
      } catch (err: unknown) {
        failed++;
        const statusCode = (err as { statusCode?: number })?.statusCode;
        // 410 Gone or 404 Not Found means the subscription expired or user revoked it
        if (statusCode === 410 || statusCode === 404) {
          try {
            await PushSubscription.deleteOne({ _id: sub._id });
          } catch {
            // ignore cleanup errors
          }
        } else {
          console.warn('[WebPush] Error sending push to endpoint:', sub.endpoint.slice(0, 40), err);
        }
      }
    }),
  );

  return { sent, failed };
}
