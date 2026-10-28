import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String, required: true, trim: true },
  durationMinutes: { type: Number, required: true, min: 15 },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, default: 'Hair', trim: true },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
