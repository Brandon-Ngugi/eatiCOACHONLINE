const express   = require('express');
const router    = express.Router();
const jwt       = require('jsonwebtoken');
const crypto    = require('crypto');
const User      = require('../models/User');
const { sendEmail, sendWhatsApp } = require('../utils/notifications');
const { protect } = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

/* ── REGISTER ─────────────────────────────────────────────── */
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({ firstName, lastName, email, password, phone, verifyToken });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify.html?token=${verifyToken}`;

    // Welcome email to student
    await sendEmail({
      to: email,
      subject: '🌟 Welcome to Coach Linda\'s Academy — Verify Your Email',
      html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:auto;padding:40px;background:#FAF7F2;">
          <h1 style="color:#3B1F5E;font-size:28px;margin-bottom:8px;">Welcome, ${firstName}!</h1>
          <p style="color:#5a4070;font-size:16px;line-height:1.6;">We're thrilled to have you join Coach Linda's community of growth-driven learners.</p>
          <p style="color:#5a4070;font-size:16px;">Please verify your email to activate your account:</p>
          <a href="${verifyUrl}" style="display:inline-block;background:#C9813A;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;margin:20px 0;">Verify My Email</a>
          <p style="color:#888;font-size:14px;margin-top:32px;">If you didn't create this account, please ignore this email.</p>
          <hr style="border:1px solid #e8d9c8;margin:24px 0;">
          <p style="color:#3B1F5E;font-weight:bold;">With purpose & intention,<br>Coach Linda's Team</p>
        </div>`
    });

    // Notify admin via email
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Student Registration – ${firstName} ${lastName}`,
      html: `<p>New student registered:<br><strong>${firstName} ${lastName}</strong><br>Email: ${email}<br>Phone: ${phone || 'N/A'}</p>`
    });

    // Notify admin via WhatsApp
    await sendWhatsApp(`🎉 New student registered on Coach Linda's platform!\nName: ${firstName} ${lastName}\nEmail: ${email}\nPhone: ${phone || 'N/A'}`);

    res.status(201).json({ message: 'Registration successful! Please verify your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/* ── VERIFY EMAIL ─────────────────────────────────────────── */
router.get('/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verifyToken: req.params.token });
    if (!user) return res.status(400).json({ message: 'Invalid or expired verification link' });
    user.emailVerified = true;
    user.verifyToken   = undefined;
    await user.save();
    res.json({ message: 'Email verified! You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ── LOGIN ───────────────────────────────────────────────── */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ message: 'Account suspended. Contact support.' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user._id);
    res.json({
      token,
      user: {
        id       : user._id,
        firstName: user.firstName,
        lastName : user.lastName,
        email    : user.email,
        role     : user.role,
        isPaid   : user.isPaid,
        enrolledCourses: user.enrolledCourses
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ── GET CURRENT USER ─────────────────────────────────────── */
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('enrolledCourses', 'title slug thumbnail');
  res.json(user);
});

/* ── UPDATE PROFILE ─────────────────────────────────────── */
router.put('/me', protect, async (req, res) => {
  try {
    const { firstName, lastName, phone, bio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone, bio },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
});

/* ── FORGOT PASSWORD ─────────────────────────────────────── */
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ message: 'If that email is registered, you will receive a reset link.' });

    const resetToken  = crypto.randomBytes(32).toString('hex');
    user.resetToken   = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1h
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password.html?token=${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset – Coach Linda Academy',
      html: `<p>Click below to reset your password (link expires in 1 hour):</p>
             <a href="${resetUrl}" style="background:#C9813A;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">Reset Password</a>`
    });
    res.json({ message: 'If that email is registered, you will receive a reset link.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ── RESET PASSWORD ─────────────────────────────────────── */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });
    user.password         = password;
    user.resetToken       = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
