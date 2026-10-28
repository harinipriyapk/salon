import express from 'express';
import Service from '../models/Service.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET all active services
router.get('/', async (req, res, next) => {
  try {
    const services = await Service.find({ active: true })
      .sort({ featured: -1, category: 1, price: 1 })
      .lean();
    res.json({ success: true, services });
  } catch (error) {
    next(error);
  }
});

// Admin: GET all services (including inactive)
router.get('/all', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const services = await Service.find().sort({ category: 1, name: 1 }).lean();
    res.json({ success: true, services });
  } catch (error) {
    next(error);
  }
});

// Admin: Create service
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { name, description, durationMinutes, price, category, featured } = req.body;
    if (!name?.trim() || !description?.trim() || !durationMinutes || price === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required service fields.' });
    }

    const service = await Service.create({
      name: name.trim(),
      description: description.trim(),
      durationMinutes: Number(durationMinutes),
      price: Number(price),
      category: category || 'General',
      featured: Boolean(featured),
    });

    res.status(201).json({ success: true, message: 'Service created successfully.', service });
  } catch (error) {
    next(error);
  }
});

// Admin: Update service
router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
    res.json({ success: true, message: 'Service updated.', service });
  } catch (error) {
    next(error);
  }
});

// Admin: Delete service
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found.' });
    res.json({ success: true, message: 'Service deleted.' });
  } catch (error) {
    next(error);
  }
});

export default router;

