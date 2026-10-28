import Notification from '../models/Notification.js';

// Format phone numbers to clean international format (e.g. +1234567890)
function cleanPhoneNumber(phone) {
  if (!phone) return '';
  const digits = phone.replace(/[^\d+]/g, '');
  if (!digits.startsWith('+')) {
    // If without country code, default to international prefix or prepend '+'
    return '+' + digits;
  }
  return digits;
}

// Generate wa.me direct WhatsApp link
export function generateWhatsAppLink(phone, message) {
  const clean = cleanPhoneNumber(phone).replace('+', '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

/**
 * Send WhatsApp notification via Twilio API (if configured) or simulation logger
 */
export async function sendWhatsAppMessage({ to, recipientRole = 'user', recipientName = '', type, message, bookingId = null }) {
  const formattedPhone = cleanPhoneNumber(to);
  const waLink = generateWhatsAppLink(formattedPhone, message);

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioSender = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

  let status = 'sent';

  if (twilioSid && twilioToken && !twilioSid.includes('your_')) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const body = new URLSearchParams({
        From: twilioSender.startsWith('whatsapp:') ? twilioSender : `whatsapp:${twilioSender}`,
        To: `whatsapp:${formattedPhone}`,
        Body: message,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (response.ok) {
        status = 'delivered';
        console.log(`[WhatsApp Twilio API] Message sent to ${formattedPhone}`);
      } else {
        const errText = await response.text();
        console.warn(`[WhatsApp Twilio Warning] Failed: ${errText}. Falling back to simulation.`);
        status = 'simulated';
      }
    } catch (err) {
      console.warn(`[WhatsApp Network Error] ${err.message}. Recorded as simulated.`);
      status = 'simulated';
    }
  } else {
    // Mock / Simulated Mode
    status = 'simulated';
    console.log(`\n================== [WHATSAPP NOTIFICATION (${type.toUpperCase()})] ==================`);
    console.log(`To: ${recipientName} (${formattedPhone}) [Role: ${recipientRole}]`);
    console.log(`Message:\n${message}`);
    console.log(`Direct wa.me URL: ${waLink}`);
    console.log(`=========================================================================\n`);
  }

  // Persist notification log into MongoDB
  try {
    const record = await Notification.create({
      recipientPhone: formattedPhone,
      recipientRole,
      recipientName,
      type,
      message,
      bookingId,
      status,
      whatsappUrl: waLink,
    });
    return record;
  } catch (err) {
    console.error('Error saving notification record:', err.message);
    return null;
  }
}

/**
 * On booking confirmation -> notify user + admin
 */
export async function notifyBookingConfirmation(booking) {
  const adminPhone = process.env.ADMIN_PHONE || '+15551234567';

  // 1. User notification
  const userMessage =
    `✨ *Velvet & Vine Hair Parlour* ✨\n\n` +
    `Hello ${booking.clientName}! Your appointment for *${booking.serviceName}* is confirmed.\n\n` +
    `📅 Date: ${booking.date}\n` +
    `⏰ Time: ${booking.time}\n` +
    `✂️ Duration: ${booking.durationMinutes} mins\n` +
    `💵 Price: $${booking.servicePrice}\n` +
    (booking.notes ? `📝 Note: "${booking.notes}"\n\n` : `\n`) +
    `We look forward to pampering you! If you need to make changes, please visit your user dashboard.\n\n` +
    `— The Velvet & Vine Team`;

  await sendWhatsAppMessage({
    to: booking.phone,
    recipientRole: 'user',
    recipientName: booking.clientName,
    type: 'booking_confirmation',
    message: userMessage,
    bookingId: booking._id,
  });

  // 2. Admin notification
  const adminMessage =
    `🛎️ *Velvet & Vine — New Booking Confirmed*\n\n` +
    `Client: *${booking.clientName}*\n` +
    `Phone: ${booking.phone}\n` +
    `Service: ${booking.serviceName} ($${booking.servicePrice})\n` +
    `Schedule: ${booking.date} at ${booking.time}\n` +
    `Status: Confirmed\n` +
    (booking.notes ? `Notes: ${booking.notes}\n` : '');

  await sendWhatsAppMessage({
    to: adminPhone,
    recipientRole: 'admin',
    recipientName: 'Salon Manager',
    type: 'booking_confirmation',
    message: adminMessage,
    bookingId: booking._id,
  });
}

/**
 * On cancellation -> notify both parties
 */
export async function notifyCancellation(booking, cancelledBy = 'Customer') {
  const adminPhone = process.env.ADMIN_PHONE || '+15551234567';

  // 1. User message
  const userMessage =
    `⚠️ *Velvet & Vine Hair Parlour*\n\n` +
    `Dear ${booking.clientName},\n` +
    `Your appointment for *${booking.serviceName}* on ${booking.date} at ${booking.time} has been cancelled (${cancelledBy}).\n\n` +
    `If you wish to reschedule or have any questions, you can book anytime via our website or reply here.\n\n` +
    `Warm regards,\nVelvet & Vine`;

  await sendWhatsAppMessage({
    to: booking.phone,
    recipientRole: 'user',
    recipientName: booking.clientName,
    type: 'cancellation',
    message: userMessage,
    bookingId: booking._id,
  });

  // 2. Admin message
  const adminMessage =
    `❌ *Velvet & Vine — Appointment Cancelled*\n\n` +
    `Booking for *${booking.clientName}* (${booking.phone}) for *${booking.serviceName}* on ${booking.date} at ${booking.time} has been cancelled by ${cancelledBy}.`;

  await sendWhatsAppMessage({
    to: adminPhone,
    recipientRole: 'admin',
    recipientName: 'Salon Manager',
    type: 'cancellation',
    message: adminMessage,
    bookingId: booking._id,
  });
}

/**
 * After appointment -> send WhatsApp reminder to user asking for feedback
 */
export async function notifyFeedbackReminder(booking) {
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  const feedbackLink = `${clientOrigin}/#reviews`;

  const reminderMessage =
    `⭐ *Velvet & Vine Hair Parlour*\n\n` +
    `Hi ${booking.clientName}! We hope you enjoyed your *${booking.serviceName}* experience with us today! ✨\n\n` +
    `Your thoughts mean the world to our stylists. Could you take a moment to leave us a quick review and rating?\n\n` +
    `👉 Submit your feedback here: ${feedbackLink}\n\n` +
    `Thank you for trusting Velvet & Vine! 🌿`;

  const record = await sendWhatsAppMessage({
    to: booking.phone,
    recipientRole: 'user',
    recipientName: booking.clientName,
    type: 'feedback_reminder',
    message: reminderMessage,
    bookingId: booking._id,
  });

  return record;
}



/**
 * Admin sends direct message to client regarding their booking
 */
export async function notifyAdminMessageToClient({ booking, senderName = 'Salon Director', message }) {
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

  const userMessage =
    `💬 *Velvet & Vine Hair Parlour*\n\n` +
    `Hello ${booking.clientName},\n\n` +
    `*Message from ${senderName}:*\n` +
    `"${message}"\n\n` +
    `🗓️ *Booking Ref:* ${booking.serviceName} on ${booking.date} at ${booking.time}\n\n` +
    `You can view and manage via your parlour dashboard: ${clientOrigin}\n\n` +
    `Warm regards,\nVelvet & Vine Team`;

  const record = await sendWhatsAppMessage({
    to: booking.phone,
    recipientRole: 'user',
    recipientName: booking.clientName,
    type: 'custom',
    message: userMessage,
    bookingId: booking._id,
  });

  return record;
}
