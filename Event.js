const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title      : { type: String, required: true },
  description: { type: String, required: true },
  date       : { type: Date, required: true },
  endDate    : { type: Date },
  location   : { type: String },         // "Online / Zoom" or physical address
  zoomLink   : { type: String },
  thumbnail  : { type: String },
  type       : { type: String, enum: ['webinar', 'workshop', 'qa', 'masterclass', 'meetup'], default: 'webinar' },
  isPublic   : { type: Boolean, default: true },  // false = enrolled students only
  isFree     : { type: Boolean, default: true },
  price      : { type: Number, default: 0 },
  registrants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxAttendees: { type: Number, default: 100 },
  isActive   : { type: Boolean, default: true },
  tags       : [String]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
