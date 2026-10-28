import express from 'express';
import Notification from '../models/Notification.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { sendWhatsAppMessage } from '../services/whatsappService.js';

const router = express.Router();

/**
 * GET /api/notifications
 * Admin: Get WhatsApp notification history
 */
router.get('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const notifications = await Notification.find()
      .populate('bookingId', 'clientName serviceName date time status')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ success: true, count: notifications.length, notifications });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/notifications/test
 * Admin: Send a test WhatsApp message to any phone number
 */
router.post('/test', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ success: false, message: 'Phone and message are required.' });
    }

    const notif = await sendWhatsAppMessage({
      to: phone,
      recipientRole: 'user',
      recipientName: 'Test Recipient',
      type: 'custom',
      message,
    });

    res.json({ success: true, message: 'Test notification processed.', notification: notif });
  } catch (error) {
    next(error);
  }
});

export default router;

