import express from 'express';
import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';
import {
  notifyBookingConfirmation,
  notifyCancellation,
  notifyFeedbackReminder,
  notifyAdminMessageToClient,
} from '../services/whatsappService.js';

const router = express.Router();

const STANDARD_TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

/**
 * GET /api/bookings/availability
 * Slot availability logic: Query slots for a date and determine available vs booked slots
 */
router.get('/availability', async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ success: false, message: 'A valid date (YYYY-MM-DD) is required.' });
    }

    // Find all active bookings (not cancelled) for that date
    const booked = await Booking.find({
      date,
      status: { $ne: 'cancelled' },
    }).select('time serviceName status durationMinutes').lean();

    const bookedTimes = booked.map(b => b.time);

    const slotDetails = STANDARD_TIME_SLOTS.map(slot => ({
      time: slot,
      available: !bookedTimes.includes(slot),
    }));

    res.json({
      success: true,
      date,
      allSlots: STANDARD_TIME_SLOTS,
      bookedTimes,
      slots: slotDetails,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/bookings
 * Get bookings:
 * - Admin: all bookings (supports status filter, date filter, client search)
 * - Customer: user's own bookings
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { status, date, search } = req.query;
    let query = {};

    if (req.user.role === 'admin') {
      if (status && status !== 'all') query.status = status;
      if (date) query.date = date;
      if (search) {
        query.$or = [
          { clientName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { serviceName: { $regex: search, $options: 'i' } },
        ];
      }
    } else {
      // Customer: strictly filter by their own userId
      query.userId = req.user._id;
      if (status && status !== 'all') query.status = status;
    }

    const bookings = await Booking.find(query)
      .sort({ date: -1, time: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/bookings/:id
 */
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).lean();
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/bookings
 * Create a new appointment booking.
 * - Prevents double booking (slot availability logic)
 * - Dispatches WhatsApp booking confirmation to user + admin
 */
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { serviceId, clientName, email, phone, date, time, notes = '' } = req.body || {};

    if (!serviceId || !clientName?.trim() || !phone?.trim() || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Please provide service, client name, phone number, date, and time slot.',
      });
    }

    const cleanDate = date.trim();
    const cleanTime = time.trim();

    // Validate future appointment
    const chosenDateTime = new Date(`${cleanDate}T${cleanTime}:00`);
    if (Number.isNaN(chosenDateTime.getTime()) || chosenDateTime <= new Date()) {
      return res.status(400).json({ success: false, message: 'Please choose a future date and time.' });
    }

    const service = await Service.findOne({ _id: serviceId, active: true });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'That service is currently unavailable. Please choose another.',
      });
    }

    // 🔒 Slot availability check: prevent double booking for the same date and time slot
    const slotTaken = await Booking.exists({
      date: cleanDate,
      time: cleanTime,
      status: { $ne: 'cancelled' },
    });

    if (slotTaken) {
      return res.status(409).json({
        success: false,
        message: 'That time slot has already been reserved. Please pick another available time.',
      });
    }

    // Determine or create User account
    let bookingUserId = null;
    let clientEmail = email ? email.trim().toLowerCase() : '';

    if (req.user) {
      bookingUserId = req.user._id;
      if (!clientEmail) clientEmail = req.user.email;
    } else {
      // Find existing user by email or phone, or create a guest user account
      let existingUser = await User.findOne({
        $or: [
          ...(clientEmail ? [{ email: clientEmail }] : []),
          { phone: phone.trim() },
        ],
      });

      if (!existingUser) {
        // Auto-create user so customer can login later and see reservations
        const fallbackEmail = clientEmail || `client_${Date.now()}@velvetvine.local`;
        existingUser = await User.create({
          name: clientName.trim(),
          email: fallbackEmail,
          password: 'GuestPassword123!',
          phone: phone.trim(),
          role: 'customer',
        });
      }
      bookingUserId = existingUser._id;
      clientEmail = existingUser.email;
    }

    const booking = await Booking.create({
      userId: bookingUserId,
      serviceId: service._id,
      serviceName: service.name,
      servicePrice: service.price,
      durationMinutes: service.durationMinutes,
      clientName: clientName.trim(),
      email: clientEmail,
      phone: phone.trim(),
      date: cleanDate,
      time: cleanTime,
      notes: String(notes).trim(),
      status: 'confirmed',
    });

    // 📲 Trigger WhatsApp confirmation to User + Admin
    try {
      await notifyBookingConfirmation(booking);
    } catch (notifErr) {
      console.error('WhatsApp notification error on booking:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Your appointment is confirmed! A WhatsApp confirmation has been dispatched.',
      booking,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/bookings/:id
 * Edit reservation (date, time, service, notes, status).
 * Prevents double booking if slot is changed.
 */
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = booking.userId.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const { date, time, serviceId, notes, status, clientName, phone } = req.body || {};

    let targetDate = date ? date.trim() : booking.date;
    let targetTime = time ? time.trim() : booking.time;

    // If date or time changed, enforce double booking check
    if ((date && date !== booking.date) || (time && time !== booking.time)) {
      const slotTaken = await Booking.exists({
        _id: { $ne: booking._id },
        date: targetDate,
        time: targetTime,
        status: { $ne: 'cancelled' },
      });

      if (slotTaken) {
        return res.status(409).json({
          success: false,
          message: 'The selected date and time is already reserved. Please choose another.',
        });
      }

      booking.date = targetDate;
      booking.time = targetTime;
    }

    // If service changed
    if (serviceId && serviceId.toString() !== booking.serviceId.toString()) {
      const service = await Service.findById(serviceId);
      if (service) {
        booking.serviceId = service._id;
        booking.serviceName = service.name;
        booking.servicePrice = service.price;
        booking.durationMinutes = service.durationMinutes;
      }
    }

    if (clientName) booking.clientName = clientName.trim();
    if (phone) booking.phone = phone.trim();
    if (notes !== undefined) booking.notes = String(notes).trim();

    const previousStatus = booking.status;

    // Status updates
    if (status && status !== previousStatus) {
      // Only admin can mark completed or arbitrarily change status; customers can cancel
      if (!isAdmin && status !== 'cancelled') {
        return res.status(403).json({ success: false, message: 'Only admins can set this status.' });
      }

      booking.status = status;

      // If status changed to cancelled -> notify both parties via WhatsApp
      if (status === 'cancelled') {
        try {
          await notifyCancellation(booking, isAdmin ? 'Salon Administrator' : 'Customer');
        } catch (notifErr) {
          console.error('WhatsApp cancellation notification error:', notifErr.message);
        }
      }

      // If status changed to completed -> trigger WhatsApp feedback reminder
      if (status === 'completed' && !booking.feedbackReminderSent) {
        try {
          await notifyFeedbackReminder(booking);
          booking.feedbackReminderSent = true;
        } catch (notifErr) {
          console.error('WhatsApp reminder error:', notifErr.message);
        }
      }
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Booking updated successfully.',
      booking,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/bookings/:id or Cancel
 * Cancel reservation -> updates status to cancelled and notifies both parties via WhatsApp
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = booking.userId.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // 📲 On cancellation -> notify both parties via WhatsApp
    try {
      await notifyCancellation(booking, isAdmin ? 'Salon Administrator' : 'Customer');
    } catch (notifErr) {
      console.error('WhatsApp cancellation notification error:', notifErr.message);
    }

    res.json({
      success: true,
      message: 'Appointment cancelled. Cancellation WhatsApp alerts sent to customer and admin.',
      booking,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/bookings/:id/send-reminder
 * After appointment -> send WhatsApp reminder to user asking for feedback
 */
router.post('/:id/send-reminder', requireAuth, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Send WhatsApp reminder
    const record = await notifyFeedbackReminder(booking);
    booking.feedbackReminderSent = true;
    await booking.save();

    res.json({
      success: true,
      message: 'WhatsApp feedback reminder dispatched to customer!',
      notification: record,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/bookings/:id/messages
 * Admin sends direct message to client regarding their booking.
 * Dispatches WhatsApp alert to client & stores message in booking record.
 */
router.post('/:id/messages', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { message, senderName = 'Eleanor Vance (Salon Director)' } = req.body || {};
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a message to send to the client.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const newMessage = {
      sender: 'Admin',
      senderName: senderName.trim(),
      message: message.trim(),
      sentAt: new Date(),
      readByClient: false,
      whatsappSent: true,
    };

    if (!booking.adminMessages) {
      booking.adminMessages = [];
    }

    booking.adminMessages.push(newMessage);
    await booking.save();

    // 📲 Dispatch WhatsApp alert to client
    try {
      await notifyAdminMessageToClient({
        booking,
        senderName: senderName.trim(),
        message: message.trim(),
      });
    } catch (notifErr) {
      console.error('WhatsApp message dispatch error:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Message successfully sent to client & WhatsApp notification dispatched.',
      adminMessages: booking.adminMessages,
      booking,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/bookings/:id/messages/read
 * Client marks all received admin messages for this booking as read.
 */
router.put('/:id/messages/read', requireAuth, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.adminMessages && booking.adminMessages.length > 0) {
      booking.adminMessages.forEach((msg) => {
        msg.readByClient = true;
      });
      await booking.save();
    }

    res.json({
      success: true,
      message: 'Messages marked as read.',
      adminMessages: booking.adminMessages,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/bookings/:id/messages
 * Retrieve message thread for a booking (accessible by owner or admin)
 */
router.get('/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).select('adminMessages clientName serviceName date time userId phone');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isOwner = booking.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({
      success: true,
      messages: booking.adminMessages || [],
    });
  } catch (error) {
    next(error);
  }
});

export default router;

