/* ============================================================
   COACH LINDA — dashboard.js
   Student Dashboard Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  // Auth guard
  const token = getToken();
  const user  = getUser();
  if (!token || !user) {
    window.location.href = 'login.html';
    return;
  }

  // Populate user info
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;
  document.getElementById('user-avatar').textContent  = initials;
  document.getElementById('header-avatar').textContent = initials;
  document.getElementById('user-name').textContent    = `${user.firstName} ${user.lastName}`;
  document.getElementById('welcome-name').textContent = user.firstName || 'there';

  // Load data
  await Promise.all([loadEnrollments(), loadStats()]);
  loadProfileForm(user);
  renderEvents();
  initVideoEmbeds();
});

/* ── Tab Navigation ─────────────────────────────────────── */
function showTab(tab) {
  const tabs = ['overview', 'courses', 'events', 'profile', 'community', 'progress', 'resources'];
  tabs.forEach(t => {
    const el = document.getElementById('tab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
  });

  // Update sidebar active state
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

  const titles = { overview:'Dashboard', courses:'My Courses', events:'Events', profile:'My Profile', community:'Community', progress:'My Progress', resources:'Resources' };
  document.getElementById('page-title').textContent = titles[tab] || 'Dashboard';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  return false;
}
window.showTab = showTab;

/* ── Load Enrollments ───────────────────────────────────── */
async function loadEnrollments() {
  try {
    const res = await authFetch('/api/student/enrollments');
    if (!res) return;
    const data = await res.json();
    const enrollments = data.enrollments || [];

    document.getElementById('course-count').textContent = enrollments.length || '0';
    document.getElementById('stat-courses').textContent = enrollments.length || '0';

    renderContinueLearning(enrollments);
    renderCoursesList(enrollments);
  } catch (err) {
    console.error('Failed to load enrollments:', err);
    // Show demo data for preview
    const demoEnrollments = getDemoEnrollments();
    document.getElementById('course-count').textContent = demoEnrollments.length;
    document.getElementById('stat-courses').textContent = demoEnrollments.length;
    renderContinueLearning(demoEnrollments);
    renderCoursesList(demoEnrollments);
  }
}

function getDemoEnrollments() {
  return [
    {
      id: '1',
      courseId: 'executive-presence',
      courseName: 'Executive Presence Masterclass',
      progress: 65,
      totalLessons: 24,
      completedLessons: 16,
      status: 'active',
      modules: [
        { title: 'Introduction to Executive Presence', duration: '32 min', completed: true },
        { title: 'The Power of First Impressions', duration: '45 min', completed: true },
        { title: 'Commanding the Room', duration: '42 min', completed: false, current: true },
        { title: 'Voice, Tone & Communication', duration: '38 min', completed: false },
      ]
    },
    {
      id: '2',
      courseId: 'emotional-intelligence',
      courseName: 'Emotional Intelligence for Leaders',
      progress: 30,
      totalLessons: 16,
      completedLessons: 5,
      status: 'active',
      modules: [
        { title: 'What is Emotional Intelligence?', duration: '28 min', completed: true },
        { title: 'Self-Awareness Practices', duration: '35 min', completed: false, current: true },
        { title: 'Managing Emotional Triggers', duration: '40 min', completed: false },
      ]
    }
  ];
}

function renderContinueLearning(enrollments) {
  const container = document.getElementById('continue-learning-list');
  if (!enrollments.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:40px 20px;color:var(--text-muted)">
        <i class="fas fa-play-circle" style="font-size:2.5rem;color:var(--gold-pale);display:block;margin-bottom:12px"></i>
        <div style="font-weight:700;color:var(--primary);margin-bottom:8px">No courses yet</div>
        <div style="font-size:.88rem;margin-bottom:20px">Browse our programs and begin your elevation.</div>
        <a href="book.html" class="btn btn-primary" style="font-size:.85rem;padding:11px 24px">Browse Programs</a>
      </div>`;
    return;
  }

  container.innerHTML = enrollments.map(e => `
    <div class="enrolled-course-card">
      <div class="enrolled-thumb"></div>
      <div class="enrolled-body">
        <h4>${e.courseName}</h4>
        <p>${e.completedLessons} of ${e.totalLessons} lessons completed</p>
        <div class="progress-bar-wrap">
          <div class="progress-bar" style="width:${e.progress}%"></div>
        </div>
        <div class="progress-label">${e.progress}% Complete</div>
        <div style="margin-top:14px">
          <button onclick="showTab('courses')" class="btn btn-primary" style="font-size:.8rem;padding:9px 20px">
            <i class="fas fa-play"></i> Continue
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderCoursesList(enrollments) {
  const container = document.getElementById('courses-list');
  if (!enrollments.length) {
    container.innerHTML = `<p style="color:var(--text-muted)">You haven't enrolled in any courses yet. <a href="book.html" style="color:var(--gold);font-weight:600">Browse Programs →</a></p>`;
    return;
  }

  container.innerHTML = enrollments.map(e => `
    <div style="background:var(--white);border-radius:var(--radius);border:1px solid var(--border);overflow:hidden;margin-bottom:24px;box-shadow:var(--shadow-xs)">
      <div style="display:grid;grid-template-columns:220px 1fr;min-height:180px">
        <div style="background:linear-gradient(135deg,var(--primary),var(--primary-light));display:flex;align-items:center;justify-content:center;padding:24px">
          <div style="text-align:center;color:white">
            <i class="fas fa-play-circle" style="font-size:2.5rem;margin-bottom:8px;display:block;opacity:.7"></i>
            <div style="font-size:2rem;font-weight:700;font-family:var(--font-display)">${e.progress}%</div>
            <div style="font-size:.72rem;opacity:.7;text-transform:uppercase;letter-spacing:.1em">Complete</div>
          </div>
        </div>
        <div style="padding:28px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px">
            <h3 style="color:var(--primary);font-size:1.25rem">${e.courseName}</h3>
            <span class="status-badge status-active">Active</span>
          </div>
          <div class="progress-bar-wrap" style="margin-bottom:8px">
            <div class="progress-bar" style="width:${e.progress}%"></div>
          </div>
          <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:20px">${e.completedLessons} / ${e.totalLessons} lessons · ${e.progress}% complete</div>
          
          <div style="font-size:.82rem;font-weight:700;color:var(--text);margin-bottom:10px;text-transform:uppercase;letter-spacing:.08em">Modules</div>
          <div class="module-list">
            ${(e.modules || []).map((m, i) => `
              <div class="lesson-row" onclick="openLesson('${e.courseId}', ${i})">
                <div class="lesson-num ${m.completed ? 'done' : m.current ? 'current' : ''}">
                  ${m.completed ? '<i class="fas fa-check"></i>' : m.current ? '<i class="fas fa-play"></i>' : i + 1}
                </div>
                <div class="lesson-title">${m.title}</div>
                <div class="lesson-duration">${m.duration}</div>
                ${!m.completed && !m.current ? '<div class="lesson-lock"><i class="fas fa-lock"></i></div>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ── Load Stats ─────────────────────────────────────────── */
async function loadStats() {
  try {
    const res = await authFetch('/api/student/stats');
    if (!res) return;
    const data = await res.json();
    document.getElementById('stat-lessons').textContent = data.completedLessons || '0';
    document.getElementById('stat-hours').textContent   = (data.totalHours || '0') + 'h';
    document.getElementById('stat-lessons-change').innerHTML = `<i class="fas fa-arrow-up"></i> ${data.weeklyGrowth || 0}% this week`;
  } catch {
    document.getElementById('stat-lessons').textContent = '16';
    document.getElementById('stat-hours').textContent   = '12h';
    document.getElementById('stat-lessons-change').innerHTML = `<i class="fas fa-arrow-up"></i> 2 this week`;
  }
}

/* ── Render Events ──────────────────────────────────────── */
function renderEvents() {
  const events = [
    { day: '15', month: 'Jul', title: 'Masterclass Tour — Nairobi', description: 'An immersive full-day executive presence experience.', location: 'Serena Hotel, Nairobi', type: 'in-person' },
    { day: '28', month: 'Jul', title: 'Cohort 5 Kick-Off Call', description: 'Welcome to the Elevate Program! Meet your cohort.', location: 'Online (Zoom)', type: 'online' },
    { day: '10', month: 'Aug', title: 'Reset Mastermind', description: 'Build brilliance without burnout — limited to 20 seats.', location: 'Nairobi (In-person)', type: 'in-person' },
  ];

  const container = document.getElementById('events-list');
  if (!container) return;
  container.innerHTML = events.map(e => `
    <div class="event-card">
      <div class="event-thumb">
        <div class="event-date-badge">
          <span class="day">${e.day}</span>
          <span class="month">${e.month}</span>
        </div>
      </div>
      <div class="event-body">
        <h4>${e.title}</h4>
        <p>${e.description}</p>
        <div class="event-location">
          <i class="fas fa-${e.type === 'online' ? 'video' : 'map-marker-alt'}"></i> ${e.location}
        </div>
        <button class="btn btn-primary" style="margin-top:16px;font-size:.82rem;padding:10px 20px">
          <i class="fas fa-calendar-check"></i> Register
        </button>
      </div>
    </div>
  `).join('');
}

/* ── Open Lesson (Video) ────────────────────────────────── */
function openLesson(courseId, lessonIndex) {
  const overlay = document.getElementById('video-overlay-main');
  if (overlay) {
    overlay.style.display = 'none';
    showTab('overview');
  }
  showTab('overview');
}
window.openLesson = openLesson;

/* ── Profile Form ───────────────────────────────────────── */
function loadProfileForm(user) {
  if (!user) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  set('profileFirst',      user.firstName);
  set('profileLast',       user.lastName);
  set('profileEmail',      user.email);
  set('profilePhone',      user.phone);
  set('profileProfession', user.profession);
}

async function saveProfile() {
  const data = {
    firstName:  document.getElementById('profileFirst').value.trim(),
    lastName:   document.getElementById('profileLast').value.trim(),
    phone:      document.getElementById('profilePhone').value.trim(),
    profession: document.getElementById('profileProfession').value.trim(),
  };
  try {
    const res = await authFetch('/api/student/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (res?.ok) {
      const updated = await res.json();
      localStorage.setItem('cl_user', JSON.stringify({ ...getUser(), ...data }));
      showAlert('profile-alert', 'success', '✓ Profile updated successfully!');
    } else {
      showAlert('profile-alert', 'error', 'Failed to update profile. Please try again.');
    }
  } catch {
    showAlert('profile-alert', 'error', 'Connection error. Please try again.');
  }
}
window.saveProfile = saveProfile;
