import express from 'express';
import Feedback from '../models/Feedback.js';
import Booking from '../models/Booking.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/feedback
 * Public approved feedback testimonials
 */
router.get('/', async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json({ success: true, feedback });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/feedback/eligible
 * Returns completed bookings for the logged-in customer that don't have feedback yet.
 */
router.get('/eligible', requireAuth, async (req, res, next) => {
  try {
    // 1. Get all completed bookings for this user
    const completedBookings = await Booking.find({
      userId: req.user._id,
      status: 'completed',
    }).sort({ date: -1, time: -1 }).lean();

    if (!completedBookings.length) {
      return res.json({ success: true, eligibleBookings: [] });
    }

    // 2. Find which ones already have feedback
    const existingFeedback = await Feedback.find({
      userId: req.user._id,
      bookingId: { $in: completedBookings.map(b => b._id) },
    }).select('bookingId').lean();

    const reviewedBookingIds = new Set(existingFeedback.map(f => f.bookingId.toString()));

    const eligibleBookings = completedBookings.filter(
      b => !reviewedBookingIds.has(b._id.toString())
    );

    res.json({ success: true, eligibleBookings });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/feedback/analytics
 * Admin dashboard analytics: total reviews, average rating, star distribution, etc.
 */
router.get('/analytics', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const allFeedback = await Feedback.find().lean();
    const totalCount = allFeedback.length;

    let avgRating = 0;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const serviceMap = {};

    if (totalCount > 0) {
      const sum = allFeedback.reduce((acc, curr) => {
        const star = Math.min(5, Math.max(1, Math.round(curr.rating)));
        distribution[star] = (distribution[star] || 0) + 1;

        const svc = curr.serviceName || 'General';
        if (!serviceMap[svc]) serviceMap[svc] = { count: 0, sum: 0 };
        serviceMap[svc].count += 1;
        serviceMap[svc].sum += curr.rating;

        return acc + curr.rating;
      }, 0);
      avgRating = Number((sum / totalCount).toFixed(1));
    }

    const serviceBreakdown = Object.entries(serviceMap).map(([serviceName, data]) => ({
      serviceName,
      reviewsCount: data.count,
      averageRating: Number((data.sum / data.count).toFixed(1)),
    }));

    res.json({
      success: true,
      analytics: {
        totalReviews: totalCount,
        averageRating: avgRating,
        distribution,
        serviceBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/feedback/admin
 * Admin list all feedback with filtering
 */
router.get('/admin', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const feedback = await Feedback.find()
      .populate('userId', 'name email phone')
      .populate('bookingId', 'date time serviceName')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, feedback });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/feedback
 * Submit feedback.
 * 🔑 FEEDBACK VALIDATION: Only users with completed bookings can submit.
 * Feedback schema: { userId, bookingId, rating, comment, createdAt }
 */
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body || {};
    const score = Number(rating);

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: 'A completed booking reference (bookingId) is required to submit feedback.',
      });
    }

    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a star rating between 1 and 5.',
      });
    }

    if (!comment?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please write a brief comment describing your experience.',
      });
    }

    // 1. Validate that the booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking record not found.',
      });
    }

    // 2. Validate ownership (unless admin)
    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only leave feedback for your own bookings.',
      });
    }

    // 3. 🔑 Validate booking status is 'completed'
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Feedback validation failed: only completed bookings are eligible for reviews. Current booking status is '${booking.status}'.`,
      });
    }

    // 4. Validate that feedback for this booking has not already been submitted
    const existing = await Feedback.findOne({ bookingId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Feedback for this completed appointment has already been submitted. Thank you!',
      });
    }

    // 5. Create feedback with strictly requested schema: { userId, bookingId, rating, comment, createdAt }
    const feedback = await Feedback.create({
      userId: req.user._id,
      bookingId: booking._id,
      clientName: req.user.name || booking.clientName,
      serviceName: booking.serviceName,
      rating: score,
      comment: comment.trim(),
      approved: true,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your valuable feedback! Your review has been recorded.',
      feedback,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/feedback/:id/moderate
 * Admin moderate/approve feedback
 */
router.put('/:id/moderate', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { approved } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { approved: Boolean(approved) },
      { new: true }
    );
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found.' });
    res.json({ success: true, message: 'Feedback status updated.', feedback });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/feedback/:id
 * Delete feedback (Admin or author)
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found.' });

    if (req.user.role !== 'admin' && feedback.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Feedback deleted.' });
  } catch (error) {
    next(error);
  }
});

export default router;

