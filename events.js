const express = require('express');
const router  = express.Router();
const Event   = require('../models/Event');
const { protect }   = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');
const { sendEmail } = require('../utils/notifications');

/* ── Public: upcoming events ─────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const now    = new Date();
    const filter = { date: { $gte: now }, isActive: true };
    if (req.query.public === 'true') filter.isPublic = true;
    const events = await Event.find(filter).sort('date');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ── Register for event ───────────────────────────────────── */
router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.registrants.includes(req.user._id))
      return res.status(409).json({ message: 'Already registered' });
    if (event.registrants.length >= event.maxAttendees)
      return res.status(400).json({ message: 'Event is fully booked' });

    event.registrants.push(req.user._id);
    await event.save();

    await sendEmail({
      to     : req.user.email,
      subject: `📅 You're Registered – ${event.title}`,
      html   : `<p>Hi ${req.user.firstName}, you're registered for <strong>${event.title}</strong> on ${new Date(event.date).toDateString()}. ${event.zoomLink ? `Join link: <a href="${event.zoomLink}">${event.zoomLink}</a>` : ''}</p>`
    });

    res.json({ message: 'Successfully registered!', event });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ── Admin: CRUD ─────────────────────────────────────────── */
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const events = await Event.find().populate('registrants', 'firstName lastName email').sort('-date');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
