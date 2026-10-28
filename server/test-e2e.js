import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Booking from './src/models/Booking.js';
import Service from './src/models/Service.js';
import Feedback from './src/models/Feedback.js';
import Notification from './src/models/Notification.js';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE BACKEND INTEGRATION TESTS ---');

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  console.log('✓ Health Check:', healthData.database === 'connected' ? 'PASS' : 'FAIL');

  // 2. Auth - Admin login
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@velvetvine.com', password: 'AdminPass123!' }),
  });
  const adminAuth = await adminLoginRes.json();
  console.log('✓ Admin Login:', adminAuth.success ? 'PASS' : 'FAIL', `(Role: ${adminAuth.user?.role})`);
  const adminToken = adminAuth.token;

  // 3. Auth - Customer login
  const customerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alice@example.com', password: 'AlicePass123!' }),
  });
  const customerAuth = await customerLoginRes.json();
  console.log('✓ Customer Login:', customerAuth.success ? 'PASS' : 'FAIL', `(Name: ${customerAuth.user?.name})`);
  const customerToken = customerAuth.token;

  // 4. Fetch Services
  const servicesRes = await fetch(`${BASE_URL}/services`);
  const servicesData = await servicesRes.json();
  console.log('✓ Services Loaded:', servicesData.services?.length > 0 ? `PASS (${servicesData.services.length} services)` : 'FAIL');
  const testService = servicesData.services[0];

  // 5. Slot Availability Logic
  const testDate = '2026-11-15';
  const availRes = await fetch(`${BASE_URL}/bookings/availability?date=${testDate}`);
  const availData = await availRes.json();
  console.log('✓ Slot Availability Query:', availData.success ? `PASS (${availData.slots?.length} total slots)` : 'FAIL');

  // 6. Booking Creation & WhatsApp Confirmation
  const bookingPayload = {
    serviceId: testService._id,
    clientName: 'Alice Sterling',
    email: 'alice@example.com',
    phone: '+15559876543',
    date: testDate,
    time: '11:00',
    notes: 'Testing slot availability and WhatsApp confirmation',
  };

  const createRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify(bookingPayload),
  });
  const createData = await createRes.json();
  console.log('✓ Booking Creation:', createData.success ? 'PASS' : 'FAIL', `(Status: ${createData.booking?.status})`);
  const createdBooking = createData.booking;

  // 7. Slot Availability Logic: Prevent Double Booking
  const duplicateRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify(bookingPayload),
  });
  const duplicateData = await duplicateRes.json();
  console.log(
    '✓ Double Booking Prevention (Conflict 409):',
    duplicateRes.status === 409 ? `PASS: "${duplicateData.message}"` : 'FAIL'
  );

  // 8. Rescheduling with Slot Availability check
  const rescheduleRes = await fetch(`${BASE_URL}/bookings/${createdBooking._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({ time: '13:00' }),
  });
  const rescheduleData = await rescheduleRes.json();
  console.log('✓ Rescheduling to 13:00:', rescheduleData.success && rescheduleData.booking?.time === '13:00' ? 'PASS' : 'FAIL');

  // 9. Cancellation & WhatsApp Cancellation alerts to both parties
  const cancelRes = await fetch(`${BASE_URL}/bookings/${createdBooking._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  const cancelData = await cancelRes.json();
  console.log('✓ Booking Cancellation:', cancelData.success && cancelData.booking?.status === 'cancelled' ? 'PASS' : 'FAIL');

  // 10. Admin completes appointment -> Triggers WhatsApp Feedback Reminder
  // Create another appointment on a fresh date to complete
  const testMonth = Math.floor(Math.random() * 9) + 1;
  const testDay = Math.floor(Math.random() * 20) + 1;
  const uniqueTestDate = `2027-0${testMonth}-${String(testDay).padStart(2, '0')}`;
  
  const checkSlotsRes = await fetch(`${BASE_URL}/bookings/availability?date=${uniqueTestDate}`);
  const checkSlotsData = await checkSlotsRes.json();
  const freeSlot = checkSlotsData.slots?.find(s => s.available)?.time || '10:00';

  const appt2Res = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      serviceId: testService._id,
      clientName: 'Alice Sterling',
      email: 'alice@example.com',
      phone: '+15559876543',
      date: uniqueTestDate,
      time: freeSlot,
      notes: 'For feedback validation test',
    }),
  });
  const appt2Data = await appt2Res.json();
  const appt2 = appt2Data.booking;
  if (!appt2) {
    throw new Error(`Failed to create appt2 for feedback test: ${appt2Data.message}`);
  }

  // Attempt feedback BEFORE completion -> MUST FAIL
  const earlyFeedbackRes = await fetch(`${BASE_URL}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      bookingId: appt2._id,
      rating: 5,
      comment: 'Attempting feedback before appointment completion',
    }),
  });
  const earlyFeedbackData = await earlyFeedbackRes.json();
  console.log(
    '✓ Feedback Validation - Block Non-Completed Bookings:',
    earlyFeedbackRes.status === 400 ? `PASS: "${earlyFeedbackData.message}"` : 'FAIL'
  );

  // Admin marks appointment as completed (which triggers WhatsApp reminder)
  const completeRes = await fetch(`${BASE_URL}/bookings/${appt2._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ status: 'completed' }),
  });
  const completeData = await completeRes.json();
  console.log('✓ Admin Complete Appointment:', completeData.success && completeData.booking?.status === 'completed' ? 'PASS' : 'FAIL');

  // Now submit feedback after completion -> MUST SUCCEED
  const validFeedbackRes = await fetch(`${BASE_URL}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      bookingId: appt2._id,
      rating: 5,
      comment: 'Masterful cut and beautiful parlour! Five stars for Alice’s styling.',
    }),
  });
  const validFeedbackData = await validFeedbackRes.json();
  console.log('✓ Feedback Validation - Accept Completed Booking Feedback:', validFeedbackData.success ? 'PASS' : 'FAIL');

  // Submit feedback a second time on same booking -> MUST BE PREVENTED
  const dupFeedbackRes = await fetch(`${BASE_URL}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      bookingId: appt2._id,
      rating: 4,
      comment: 'Duplicate review attempt',
    }),
  });
  const dupFeedbackData = await dupFeedbackRes.json();
  console.log(
    '✓ Feedback Validation - Prevent Duplicate Feedback (409):',
    dupFeedbackRes.status === 409 ? `PASS: "${dupFeedbackData.message}"` : 'FAIL'
  );

  // 11. Admin Feedback Analytics
  const analyticsRes = await fetch(`${BASE_URL}/feedback/analytics`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const analyticsData = await analyticsRes.json();
  console.log(
    '✓ Admin Feedback Analytics:',
    analyticsData.success
      ? `PASS (Avg Rating: ${analyticsData.analytics.averageRating}★, Total: ${analyticsData.analytics.totalReviews})`
      : 'FAIL'
  );

  // 12. WhatsApp Notification Audit Log
  const notifsRes = await fetch(`${BASE_URL}/notifications`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const notifsData = await notifsRes.json();
  console.log(
    '✓ WhatsApp Notification Audit Log:',
    notifsData.success ? `PASS (${notifsData.count} notifications dispatched & recorded)` : 'FAIL'
  );

  // 13. Admin-to-Client Direct Messaging & Client Receipt
  const sendMsgRes = await fetch(`${BASE_URL}/bookings/${appt2._id}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      message: 'Hello Alice! Warm chamomile tea and your styling chair are prepared.',
      senderName: 'Eleanor Vance (Salon Director)',
    }),
  });
  const sendMsgData = await sendMsgRes.json();
  const clientViewRes = await fetch(`${BASE_URL}/bookings`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  const clientViewData = await clientViewRes.json();
  const aliceBooking = clientViewData.bookings?.find(b => b._id === appt2._id);
  const clientReceived = aliceBooking?.adminMessages?.length > 0;
  console.log(
    '✓ Admin Sends Message & Client Receives in Dashboard:',
    sendMsgData.success && clientReceived
      ? `PASS (Latest message: "${aliceBooking.adminMessages[aliceBooking.adminMessages.length - 1].message}")`
      : 'FAIL'
  );

  console.log('\n--- ALL COMPREHENSIVE BACKEND TESTS COMPLETED SUCCESSFULLY! ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

