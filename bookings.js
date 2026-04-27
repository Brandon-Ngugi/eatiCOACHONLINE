const express  = require('express');
const router   = express.Router();
const Booking  = require('../models/Booking');
const Course   = require('../models/Course');
const User     = require('../models/User');
const { protect }   = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');
const { sendEmail, sendWhatsApp } = require('../utils/notifications');

/* ── Create booking / initiate payment ───────────────────── */
router.post('/', protect, async (req, res) => {
  try {
    const { courseId, paymentMethod, paymentRef } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const existing = await Booking.findOne({ student: req.user._id, course: courseId });
    if (existing) return res.status(409).json({ message: 'You already have a booking for this course', booking: existing });

    const booking = await Booking.create({
      student     : req.user._id,
      course      : courseId,
      studentName : req.user.fullName || `${req.user.firstName} ${req.user.lastName}`,
      studentEmail: req.user.email,
      studentPhone: req.user.phone,
      amount      : course.price,
      currency    : course.currency,
      paymentMethod,
      paymentRef,
      paymentStatus: paymentRef ? 'paid' : 'pending'
    });

    // If payment ref provided (Google Pay success), grant access immediately
    if (paymentRef) {
      booking.paymentStatus = 'paid';
      booking.paymentDate   = new Date();
      booking.status        = 'confirmed';
      booking.accessGranted = true;
      await booking.save();

      // Grant course access to user
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { enrolledCourses: courseId },
        isPaid: true,
        paymentRef
      });
      await Course.findByIdAndUpdate(courseId, { $addToSet: { enrolled: req.user._id } });

      // Confirmation email to student
      await sendEmail({
        to     : req.user.email,
        subject: `✅ Booking Confirmed – ${course.title}`,
        html   : `
          <div style="font-family:Georgia,serif;max-width:600px;margin:auto;padding:40px;background:#FAF7F2;">
            <h1 style="color:#3B1F5E;">Your Spot is Reserved! 🎉</h1>
            <p style="color:#5a4070;font-size:16px;">Hi ${req.user.firstName},</p>
            <p style="color:#5a4070;font-size:16px;">You're now enrolled in <strong>${course.title}</strong>.</p>
            <p style="color:#5a4070;">Payment Reference: <code>${paymentRef}</code></p>
            <p style="color:#5a4070;">Amount: ${course.currency} ${course.price}</p>
            <a href="${process.env.FRONTEND_URL}/dashboard.html" style="display:inline-block;background:#C9813A;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;margin:20px 0;">Access My Dashboard</a>
            <hr style="border:1px solid #e8d9c8;margin:24px 0;">
            <p style="color:#3B1F5E;font-weight:bold;">With pride,<br>Coach Linda's Team</p>
          </div>`
      });

      // WhatsApp + email to admin
      await sendEmail({
        to     : process.env.ADMIN_EMAIL,
        subject: `💰 New Payment – ${req.user.firstName} ${req.user.lastName} – ${course.title}`,
        html   : `<p><strong>${req.user.firstName} ${req.user.lastName}</strong> (${req.user.email}) just paid for <strong>${course.title}</strong>.<br>Amount: ${course.currency} ${course.price}<br>Ref: ${paymentRef}</p>`
      });
      await sendWhatsApp(`💰 New payment received!\nStudent: ${req.user.firstName} ${req.user.lastName}\nCourse: ${course.title}\nAmount: ${course.currency} ${course.price}\nRef: ${paymentRef}`);
    }

    res.status(201).json({ booking, message: paymentRef ? 'Booking confirmed!' : 'Booking initiated. Awaiting payment.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── Get my bookings ─────────────────────────────────────── */
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user._id }).populate('course', 'title slug thumbnail price currency');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ── Admin: all bookings ─────────────────────────────────── */
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('student', 'firstName lastName email phone')
      .populate('course', 'title price currency')
      .sort('-createdAt');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ── Admin: update booking & grant access ────────────────── */
router.put('/admin/:id', protect, adminOnly, async (req, res) => {
  try {
    const { paymentStatus, status, accessGranted, adminNotes } = req.body;
    const booking = await Booking.findById(req.params.id).populate('student course');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (status)        booking.status        = status;
    if (adminNotes)    booking.adminNotes    = adminNotes;

    if (accessGranted && !booking.accessGranted) {
      booking.accessGranted = true;
      booking.paymentStatus = 'paid';
      booking.status        = 'confirmed';
      booking.paymentDate   = new Date();

      await User.findByIdAndUpdate(booking.student._id, {
        $addToSet: { enrolledCourses: booking.course._id },
        isPaid: true
      });
      await Course.findByIdAndUpdate(booking.course._id, { $addToSet: { enrolled: booking.student._id } });

      // Notify student
      await sendEmail({
        to     : booking.student.email,
        subject: `✅ Access Granted – ${booking.course.title}`,
        html   : `<p>Hi ${booking.student.firstName}, your payment has been confirmed and you now have access to <strong>${booking.course.title}</strong>. <a href="${process.env.FRONTEND_URL}/dashboard.html">Visit your dashboard</a>.</p>`
      });
      await sendWhatsApp(`✅ Access granted for ${booking.student.firstName} ${booking.student.lastName} on ${booking.course.title}`);
    }

    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
