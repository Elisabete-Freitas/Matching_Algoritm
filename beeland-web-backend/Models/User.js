const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nif: { type: Number, required: true },
  phone: { type: Number, required: true },
  address: { type: String, required: true },
  postalCode: { type: String, required: true },
  locality: { type: String, required: true },
  role: { type: String, required: true, enum: ['beekeeper', 'farmer','admin'] },
  beekeeper: { type: mongoose.Schema.Types.ObjectId, ref: 'Beekeeper' },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  lat: { type: Number, /*required: true*/ },
  long: { type: Number, /*required: true*/ },
  oneSignalSubscriptionId: { type: String, required: false },
  account_status: { type: Boolean, required: true  },
  active: { type: Boolean, default: false },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  verificationToken: { type: String },
  emailVerified: { type: Boolean, default: false },
  resetToken: String,
  resetTokenExpire: Date,
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema, 'USER');
module.exports = User;
