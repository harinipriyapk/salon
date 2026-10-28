import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 160 },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
}, { timestamps: true });

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model('User', userSchema);

