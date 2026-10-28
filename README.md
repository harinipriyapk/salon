# Velvet & Vine — MERN Salon Booking & WhatsApp Notifications

A full-stack MERN application for a vintage-inspired hair parlour where clients can reserve appointments, receive automated WhatsApp notifications, and submit verified feedback after their visit. Salon administrators have access to an administrative dashboard with booking management, feedback analytics, and WhatsApp notification dispatch logs.

---

## 🔑 Core Features

### Frontend (React + Vite)
- **Animated Entry Page (Framer Motion)**:
  - Central vintage salon sticker with dynamic fade-in, rotation, and continuous pulse animations.
  - Ornate rotating golden halo, vintage parchment border, and cycling parlour loading phrases.
  - Smooth fade-out and crossfade into the main app after 3 seconds or once backend data is ready.
  - Sticker can be easily swapped in `client/src/config/entrySticker.js`.
- **Reservation Form**:
  - Live slot availability check (`09:00` - `17:00`) preventing double-booking.
  - Interactive selection of salon services, dates, and slots.
  - Generates instant booking confirmation with WhatsApp dispatch alert and direct `wa.me` links.
- **Feedback Form**:
  - 5-Star rating picker (⭐) and reflective review comments.
  - **Strict Feedback Validation**: only clients with a completed appointment booking can submit verified feedback.
- **User Dashboard**:
  - View all reservations with status badges (`Confirmed`, `Completed`, `Cancelled`).
  - Reschedule / Edit appointments with live slot collision checks.
  - Cancel reservations with automatic WhatsApp cancellation alerts sent to client and admin.
  - Submit feedback for completed salon visits directly from the dashboard.
- **Admin Dashboard**:
  - **Booking Management**: View all appointments, search by name/phone/service, filter by status, and update statuses (`Mark Completed`, `Cancel`, etc.).
  - **Feedback Analytics**: Average satisfaction score, total verified reviews, 5-star distribution bar chart, service-specific ratings, and review moderation.
  - **WhatsApp Dispatch Center**: Audit log of all automated WhatsApp messages (Confirmations, Cancellations, Feedback Reminders) with direct `wa.me` chat links and custom test dispatcher.
- **1-Click Demo Logins**:
  - Customer: `alice@example.com` / `AlicePass123!`
  - Admin: `admin@velvetvine.com` / `AdminPass123!`

### Backend (Node + Express + MongoDB)
- **JWT Authentication**: Secure user registration, login, and role-based route middleware (`requireAuth`, `requireAdmin`, `optionalAuth`).
- **Slot Availability Logic**: Enforces single-booking per time slot on creation and rescheduling to strictly prevent double-booking.
- **WhatsApp API Integration**:
  - **On Booking Confirmation** → Notifies user and admin with schedule, duration, and price.
  - **On Cancellation** → Notifies both parties.
  - **After Appointment** → Sends WhatsApp reminder asking client to submit feedback.
  - Supports live Twilio WhatsApp API credentials or simulated in-database logging with direct `wa.me` web links.
- **Collections**:
  - `Users`: Customer and Admin accounts with hashed passwords (`bcryptjs`).
  - `Bookings`: Complete appointment lifecycle, schedule, and slot tracking.
  - `Services`: Active menu items, durations, and pricing.
  - `Feedback`: Schema: `{ userId, bookingId, rating, comment, createdAt }`.
  - `Notifications`: WhatsApp dispatch audit trail.

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd server
npm install
node src/server.js
```
The backend server runs on `http://localhost:5000`. On initial startup, it automatically seeds initial salon services, the default admin account, demo customer account, and sample completed bookings.

To run the automated integration tests:
```bash
node test-e2e.js
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔐 Demo Credentials

| Role | Email | Password |
| --- | --- | --- |
| **Admin** | `admin@velvetvine.com` | `AdminPass123!` |
| **Customer** | `alice@example.com` | `AlicePass123!` |

*(Both accounts can also be logged into with 1-click via the "Quick Demo Access" buttons in the Sign In modal).*

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Register a new customer
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve authenticated user profile

### Bookings (Appointments)
- `GET /api/bookings/availability?date=YYYY-MM-DD` — Real-time slot availability (free vs booked)
- `GET /api/bookings` — Get bookings (filtered by user or all for admin)
- `GET /api/bookings/:id` — Get single booking details
- `POST /api/bookings` — Create a new appointment (validates slot availability & dispatches WhatsApp alerts)
- `PUT /api/bookings/:id` — Update or reschedule booking (checks slot collisions; triggers WhatsApp alerts on cancel/complete)
- `DELETE /api/bookings/:id` — Cancel booking and notify user + admin
- `POST /api/bookings/:id/send-reminder` — Dispatch WhatsApp feedback reminder

### Feedback
- `GET /api/feedback` — Public approved customer testimonials
- `GET /api/feedback/eligible` — Returns completed bookings eligible for feedback for current user
- `POST /api/feedback` — Submit verified feedback (validates booking is completed and not previously reviewed)
- `GET /api/feedback/analytics` — Admin feedback analytics (average rating, distribution, service breakdown)
- `GET /api/feedback/admin` — Admin feedback moderation list
- `PUT /api/feedback/:id/moderate` — Toggle feedback approval / visibility
- `DELETE /api/feedback/:id` — Delete feedback

### Notifications & Services
- `GET /api/notifications` — Admin WhatsApp outbox log
- `POST /api/notifications/test` — Dispatch test WhatsApp message
- `GET /api/services` — List active services
