import mongoose from 'mongoose';
import { Notification } from '../models/notification.model.js';
import { User } from '../models/user.model.js';

export interface CreateNotificationParams {
  userId?: mongoose.Types.ObjectId | string | null;
  patientPhone?: string;
  type: 'prescription' | 'appointment' | 'inbody' | 'subscription' | 'system';
  title: string;
  body: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export function extractPhoneVariants(rawPhone: string): string[] {
  if (!rawPhone) return [];
  const trimmed = rawPhone.trim();
  const digits = trimmed.replace(/\D/g, '');
  const variants = new Set<string>();
  variants.add(trimmed);
  if (digits) {
    variants.add(digits);
    if (digits.startsWith('2')) variants.add(digits.slice(1));
    if (digits.startsWith('0')) variants.add('2' + digits);
    if (!digits.startsWith('0') && !digits.startsWith('2')) variants.add('0' + digits);
  }
  return Array.from(variants);
}

export async function createNotification(params: CreateNotificationParams) {
  let resolvedUserId: mongoose.Types.ObjectId | null = null;

  if (params.userId) {
    resolvedUserId = typeof params.userId === 'string'
      ? new mongoose.Types.ObjectId(params.userId)
      : params.userId;
  } else if (params.patientPhone) {
    const variants = extractPhoneVariants(params.patientPhone);
    const user = await User.findOne({ phone: { $in: variants } }).select('_id').lean();
    if (user) {
      resolvedUserId = user._id;
    }
  }

  const notification = await Notification.create({
    userId: resolvedUserId,
    patientPhone: (params.patientPhone || '').trim(),
    type: params.type,
    title: params.title.trim(),
    body: params.body.trim(),
    link: params.link || '/account',
    read: false,
    metadata: params.metadata || {},
  });

  // Send OS-level Web Push notification to user's registered mobile phones and devices
  try {
    const { sendPushNotification } = await import('./web-push.service.js');
    await sendPushNotification({
      userId: resolvedUserId,
      patientPhone: params.patientPhone,
      title: params.title.trim(),
      body: params.body.trim(),
      link: params.link || '/account',
    });
  } catch (pushErr) {
    console.warn('[Notification] Background push notification error:', pushErr);
  }

  return notification;
}

export async function getUserNotifications(
  userId: mongoose.Types.ObjectId | string,
  patientPhone?: string,
  limit = 40,
) {
  const uid = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
  const orConditions: Record<string, unknown>[] = [{ userId: uid }];

  if (patientPhone) {
    const variants = extractPhoneVariants(patientPhone);
    orConditions.push({ patientPhone: { $in: variants } });
  }

  const filter = { $or: orConditions };

  const [items, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Notification.countDocuments({
      ...filter,
      read: false,
    }),
  ]);

  return {
    notifications: items,
    unreadCount,
  };
}

export async function markNotificationAsRead(
  notificationId: string,
  userId: mongoose.Types.ObjectId | string,
  patientPhone?: string,
) {
  const uid = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
  const orConditions: Record<string, unknown>[] = [{ userId: uid }];
  if (patientPhone) {
    const variants = extractPhoneVariants(patientPhone);
    orConditions.push({ patientPhone: { $in: variants } });
  }

  const updated = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      $or: orConditions,
    },
    {
      $set: { read: true, readAt: new Date() },
    },
    { returnDocument: 'after' },
  ).lean();

  return updated;
}

export async function markAllNotificationsAsRead(
  userId: mongoose.Types.ObjectId | string,
  patientPhone?: string,
) {
  const uid = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
  const orConditions: Record<string, unknown>[] = [{ userId: uid }];
  if (patientPhone) {
    const variants = extractPhoneVariants(patientPhone);
    orConditions.push({ patientPhone: { $in: variants } });
  }

  await Notification.updateMany(
    {
      $or: orConditions,
      read: false,
    },
    {
      $set: { read: true, readAt: new Date() },
    },
  );

  return { ok: true };
}
