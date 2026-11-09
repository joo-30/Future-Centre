import mongoose from 'mongoose';
import { Appointment } from '../models/appointment.model.js';
import { ArticleModel } from '../models/article.model.js';
import { Audit } from '../models/audit.model.js';
import { Clinic } from '../models/clinic.model.js';
import { InBody } from '../models/inbody.model.js';
import { Interest } from '../models/interest.model.js';
import { Reservation } from '../models/reservation.model.js';
import { ServiceModel } from '../models/service.model.js';
import { Session } from '../models/session.model.js';
import { SubscriptionModel } from '../models/subscription.model.js';
import { User } from '../models/user.model.js';

export async function connectDatabase(uri: string) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  await Promise.all([
    Clinic.init(),
    ServiceModel.init(),
    ArticleModel.init(),
    Appointment.init(),
    Reservation.init(),
    Interest.init(),
    User.init(),
    Session.init(),
    SubscriptionModel.init(),
    InBody.init(),
    Audit.init(),
  ]);
}
