import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientPhone: { type: String, required: true },
  recipientRole: { type: String, enum: ['user', 'admin'], default: 'user' },
  recipientName: { type: String, default: '' },
  type: {
    type: String,
    enum: ['booking_confirmation', 'cancellation', 'feedback_reminder', 'custom'],
    required: true,
  },
  message: { type: String, required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'simulated', 'failed'],
    default: 'sent',
  },
  whatsappUrl: { type: String, default: '' },
}, { timestamps: true });

notificationSchema.index({ createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);

