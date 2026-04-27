const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  student     : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course      : { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

  // Student info snapshot
  studentName : { type: String },
  studentEmail: { type: String },
  studentPhone: { type: String },

  amount      : { type: Number, required: true },
  currency    : { type: String, default: 'KES' },
  paymentMethod: { type: String, enum: ['google_pay', 'mpesa', 'bank', 'other'], default: 'google_pay' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentRef  : { type: String },
  paymentDate : { type: Date },

  status      : { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  accessGranted: { type: Boolean, default: false },

  notes       : { type: String },
  adminNotes  : { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
