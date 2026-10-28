import mongoose from 'mongoose';

const adminMessageSchema = new mongoose.Schema({
  sender: { type: String, default: 'Admin' },
  senderName: { type: String, default: 'Salon Manager' },
  message: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  readByClient: { type: Boolean, default: false },
  whatsappSent: { type: Boolean, default: true },
}, { _id: true });

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  serviceName: { type: String, required: true },
  servicePrice: { type: Number, required: true, min: 0 },
  durationMinutes: { type: Number, required: true },
  clientName: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  time: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  notes: { type: String, trim: true, maxlength: 500, default: '' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'confirmed',
  },
  feedbackReminderSent: { type: Boolean, default: false },
  adminMessages: [adminMessageSchema],
}, { timestamps: true });

bookingSchema.index({ date: 1, time: 1, status: 1 });
bookingSchema.index({ userId: 1, date: -1 });

export default mongoose.model('Booking', bookingSchema);
