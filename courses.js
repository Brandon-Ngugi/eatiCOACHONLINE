const express = require('express');
const router  = express.Router();
const Course  = require('../models/Course');
const { protect }    = require('../middleware/auth');
const { adminOnly }  = require('../middleware/adminAuth');

/* ── Public: list published courses ──────────────────────── */
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    const filter = { isPublished: true };
    if (category)  filter.category  = category;
    if (featured)  filter.isFeatured = true;
    const courses = await Course.find(filter).select('-modules').sort('-createdAt');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ── Public: single course preview ───────────────────────── */
router.get('/:slug', async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, isPublished: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Only send free lesson content for unauthenticated users
    const courseObj = course.toObject();
    if (!req.headers.authorization) {
      courseObj.modules = courseObj.modules.map(m => ({
        ...m,
        lessons: m.lessons.map(l => ({
          ...l,
          videoUrl: l.isFree ? l.videoUrl : null
        }))
      }));
    }
    res.json(courseObj);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ── Protected: enrolled course with full content ─────────── */
router.get('/:slug/content', protect, async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, isPublished: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const enrolled = req.user.enrolledCourses.some(id => id.toString() === course._id.toString());
    if (!enrolled && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Please enroll and complete payment to access this course.' });

    res.json(course);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ── Admin: create course ─────────────────────────────────── */
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ── Admin: update course ─────────────────────────────────── */
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ── Admin: delete course ─────────────────────────────────── */
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

/* ── Admin: all courses (including unpublished) ───────────── */
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const courses = await Course.find().sort('-createdAt');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
