import type { AppointmentPublic } from '@future/shared';
import { DateTime } from 'luxon';
import { type AppointmentRecord } from '../models/appointment.model.js';
import { generateSignedQrToken } from '../services/qr.service.js';

export function publicAppointment(appointment: AppointmentRecord): AppointmentPublic {
  return {
    reference: appointment.reference,
    serviceId: appointment.serviceId,
    serviceTitle: appointment.serviceTitle,
    date: appointment.date,
    time: appointment.time,
    duration: appointment.duration,
    status: appointment.status,
    firstName: appointment.name.split(/\s+/)[0],
    phoneMasked: appointment.phone
      ? `${appointment.phone.slice(0, 5)} •••• ${appointment.phone.slice(-4)}`
      : '',
    price: appointment.price,
    holdUntil: appointment.holdUntil?.toISOString() ?? null,
    history: appointment.history.map((h) => ({
      status: h.status,
      at: new Date(h.at).toISOString(),
      message: h.message,
    })),
    reschedule: appointment.reschedule
      ? {
          ...appointment.reschedule,
          requestedAt: new Date(appointment.reschedule.requestedAt).toISOString(),
        }
      : null,
    canCancel:
      ['pending', 'confirmed'].includes(appointment.status) &&
      DateTime.fromISO(`${appointment.date}T${appointment.time}`, { zone: 'Africa/Cairo' }) >
        DateTime.now(),
    canReschedule:
      ['pending', 'confirmed'].includes(appointment.status) &&
      DateTime.fromISO(`${appointment.date}T${appointment.time}`, { zone: 'Africa/Cairo' }) >
        DateTime.now(),
    qrToken: generateSignedQrToken(appointment.reference, appointment.date, appointment.time),
  };
}
