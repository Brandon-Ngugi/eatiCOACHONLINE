const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title      : { type: String, required: true },
  description: { type: String },
  videoUrl   : { type: String },        // YouTube / Vimeo / direct URL
  videoType  : { type: String, enum: ['youtube', 'vimeo', 'direct', 'embed'], default: 'youtube' },
  duration   : { type: String },        // e.g. "24:30"
  resources  : [{ name: String, url: String }],
  order      : { type: Number, default: 0 },
  isFree     : { type: Boolean, default: false }
});

const moduleSchema = new mongoose.Schema({
  title   : { type: String, required: true },
  lessons : [lessonSchema],
  order   : { type: Number, default: 0 }
});

const courseSchema = new mongoose.Schema({
  title      : { type: String, required: true, trim: true },
  slug       : { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDesc  : { type: String },
  thumbnail  : { type: String },
  price      : { type: Number, required: true },
  currency   : { type: String, default: 'KES' },
  category   : { type: String, enum: ['coaching', 'etiquette', 'leadership', 'wellness', 'business'], default: 'coaching' },

  modules    : [moduleSchema],

  duration   : { type: String },       // e.g. "6 weeks"
  level      : { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  language   : { type: String, default: 'English' },

  instructor : { type: String, default: 'Coach Linda' },
  maxStudents: { type: Number, default: 30 },
  enrolled   : [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  isPublished: { type: Boolean, default: false },
  isFeatured : { type: Boolean, default: false },
  startDate  : { type: Date },
  endDate    : { type: Date },

  tags       : [String],
  whatYouLearn: [String],
  requirements: [String],

  rating     : { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

courseSchema.virtual('enrolledCount').get(function () {
  return this.enrolled.length;
});

module.exports = mongoose.model('Course', courseSchema);
