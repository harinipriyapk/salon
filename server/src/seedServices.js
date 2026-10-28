import Service from './models/Service.js';
import User from './models/User.js';
import Booking from './models/Booking.js';
import Feedback from './models/Feedback.js';

const starterServices = [
  { name: 'The Signature Cut', description: 'A considered cut, wash, and finish shaped around you.', durationMinutes: 60, price: 65, category: 'Cuts & styling', featured: true },
  { name: 'Wash & Set', description: 'A soothing wash followed by a soft, polished blow-dry.', durationMinutes: 45, price: 42, category: 'Cuts & styling', featured: true },
  { name: 'Fringe Refresh', description: 'A tidy-up for bangs and face-framing layers between visits.', durationMinutes: 20, price: 22, category: 'Cuts & styling' },
  { name: 'The Restorative Treatment', description: 'Deep conditioning ritual for softness, shine, and bounce.', durationMinutes: 35, price: 38, category: 'Treatments' },
  { name: 'Gloss & Tone', description: 'A luminous, low-commitment gloss to refresh your color.', durationMinutes: 75, price: 78, category: 'Color' },
  { name: 'Occasion Hair', description: 'A tailored, lasting style for celebrations and special days.', durationMinutes: 75, price: 85, category: 'Occasion', featured: true },
];

export async function seedInitialData() {
  // 1. Seed Services
  if (!(await Service.exists())) {
    await Service.insertMany(starterServices);
    console.log('Seeded starter salon services');
  }

  // 2. Seed Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@velvetvine.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Eleanor Vance (Salon Director)',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'AdminPass123!',
      phone: process.env.ADMIN_PHONE || '+15551234567',
      role: 'admin',
    });
    console.log(`Seeded admin user: ${adminEmail}`);
  }

  // 3. Seed Demo Customer User
  const customerEmail = 'alice@example.com';
  let customer = await User.findOne({ email: customerEmail });
  if (!customer) {
    customer = await User.create({
      name: 'Alice Sterling',
      email: customerEmail,
      password: 'AlicePass123!',
      phone: '+15559876543',
      role: 'customer',
    });
    console.log(`Seeded demo customer: ${customerEmail}`);
  }

  // 4. Seed initial bookings if none exist
  if (!(await Booking.exists())) {
    const services = await Service.find();
    const signature = services.find(s => s.name === 'The Signature Cut') || services[0];
    const gloss = services.find(s => s.name === 'Gloss & Tone') || services[1];
    const wash = services.find(s => s.name === 'Wash & Set') || services[2];

    // Completed booking with existing feedback
    const completedBooking1 = await Booking.create({
      userId: customer._id,
      serviceId: signature._id,
      serviceName: signature.name,
      servicePrice: signature.price,
      durationMinutes: signature.durationMinutes,
      clientName: customer.name,
      email: customer.email,
      phone: customer.phone,
      date: '2026-10-20',
      time: '11:00',
      notes: 'Prefers herbal tea and light layering.',
      status: 'completed',
      feedbackReminderSent: true,
    });

    // Completed booking eligible for new feedback!
    await Booking.create({
      userId: customer._id,
      serviceId: gloss._id,
      serviceName: gloss.name,
      servicePrice: gloss.price,
      durationMinutes: gloss.durationMinutes,
      clientName: customer.name,
      email: customer.email,
      phone: customer.phone,
      date: '2026-10-25',
      time: '14:00',
      notes: 'Subtle warm honey gloss.',
      status: 'completed',
      feedbackReminderSent: true,
    });

    // Upcoming confirmed booking
    await Booking.create({
      userId: customer._id,
      serviceId: wash._id,
      serviceName: wash.name,
      servicePrice: wash.price,
      durationMinutes: wash.durationMinutes,
      clientName: customer.name,
      email: customer.email,
      phone: customer.phone,
      date: '2026-10-30',
      time: '10:00',
      notes: 'Upcoming weekend prep appointment.',
      status: 'confirmed',
    });

    // Seed initial feedback
    await Feedback.create({
      userId: customer._id,
      bookingId: completedBooking1._id,
      clientName: customer.name,
      serviceName: signature.name,
      rating: 5,
      comment: 'An exquisite parlour with wonderful hospitality. The cut shaped my natural wave perfectly, and the cup of Earl Grey was delightful!',
      approved: true,
    });

    console.log('Seeded demo bookings and feedback');
  }
}

export { seedInitialData as seedServicesIfEmpty };
