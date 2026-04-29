/* ============================================================
   COACH LINDA — main.js
   Navigation, Animations, Utility Functions
   ============================================================ */

const API_BASE = 'https://coach-linda-backend.onrender.com'; // Update after Render deploy

/* ── Nav Template ───────────────────────────────────────── */
function injectNav(activePage = '') {
  const pages = [
    { href: 'index.html',     label: 'Home' },
    { href: 'about.html',     label: 'About Linda' },
    { href: 'services.html',  label: 'Services' },
    { href: 'journey.html',   label: 'Your Journey' },
    { href: 'trainings.html', label: 'Trainings' },
    { href: 'events.html',    label: 'Events' },
  ];

  const navLinks = pages.map(p => `
    <li class="nav-item">
      <a href="${p.href}" class="nav-link ${activePage === p.href ? 'active' : ''}">${p.label}</a>
    </li>
  `).join('');

  const mobileLinks = pages.map(p => `
    <a href="${p.href}" class="mobile-nav-link">${p.label}</a>
  `).join('');

  const token = localStorage.getItem('cl_token');
  const user  = JSON.parse(localStorage.getItem('cl_user') || 'null');

  const authDesktop = token
    ? `<a href="dashboard.html" class="btn btn-ghost" style="color:rgba(255,255,255,.85)">My Dashboard</a>
       <button onclick="logout()" class="btn btn-outline btn-outline--white" style="padding:10px 20px;font-size:.85rem">Log Out</button>`
    : `<a href="login.html" class="btn btn-ghost" style="color:rgba(255,255,255,.85)">Log In</a>
       <a href="book.html" class="btn btn-primary">Book Now</a>`;

  const authMobile = token
    ? `<a href="dashboard.html" class="btn btn-primary">My Dashboard</a>
       <button onclick="logout()" class="btn btn-outline btn-outline--white">Log Out</button>`
    : `<a href="login.html" class="btn btn-outline btn-outline--white">Log In</a>
       <a href="book.html" class="btn btn-primary">Book Now</a>`;

  const navHTML = `
<nav class="navbar" id="mainNav">
  <div class="nav-inner">
    <a href="index.html" class="nav-logo">
      <span class="nav-logo-name">Coach Linda</span>
      <span class="nav-logo-tag">Leadership · Coaching · Transformation</span>
    </a>
    <ul class="nav-menu">
      ${navLinks}
      <li class="nav-item has-dropdown">
        <a href="community.html" class="nav-link ${activePage === 'community.html' ? 'active' : ''}">Community ▾</a>
        <div class="dropdown-menu">
          <a href="community.html#empowered-women" class="dropdown-item">🌸 Empowered Women</a>
          <a href="community.html#founding-members" class="dropdown-item">💎 Founding Members</a>
        </div>
      </li>
    </ul>
    <div class="nav-actions">${authDesktop}</div>
    <button class="hamburger" id="hamburger" aria-label="Open menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
<div class="mobile-menu" id="mobileMenu">
  ${mobileLinks}
  <a href="community.html" class="mobile-nav-link">Community</a>
  <div class="mobile-sub">
    <a href="community.html#empowered-women" class="mobile-nav-link">🌸 Empowered Women</a>
    <a href="community.html#founding-members" class="mobile-nav-link">💎 Founding Members</a>
  </div>
  <div class="mobile-actions">${authMobile}</div>
</div>
<a href="https://wa.me/254701685839?text=Hi%20Coach%20Linda%2C%20I'm%20interested%20in%20your%20programs!" 
   class="wa-float" target="_blank" rel="noopener" title="Chat on WhatsApp">
  <i class="fab fa-whatsapp"></i>
</a>`;

  const placeholder = document.getElementById('nav-placeholder');
  if (placeholder) placeholder.outerHTML = navHTML;
  else document.body.insertAdjacentHTML('afterbegin', navHTML);

  initNav();
}

/* ── Footer Template ────────────────────────────────────── */
function injectFooter() {
  const footerHTML = `
<footer class="footer">
  <div class="footer-grid">
    <div>
      <div class="footer-brand-name">Coach Linda</div>
      <span class="footer-brand-tag">Leadership · Coaching · Transformation</span>
      <p class="footer-desc">Empowering ambitious professionals and visionary leaders to step into their fullest potential — with clarity, confidence, and intention.</p>
      <div class="footer-socials">
        <a href="#" class="social-icon" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
        <a href="#" class="social-icon" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
        <a href="#" class="social-icon" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
        <a href="https://wa.me/254701685839" class="social-icon" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
        <a href="#" class="social-icon" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
      </div>
    </div>
    <div>
      <div class="footer-col-title">Quick Links</div>
      <a href="index.html"     class="footer-link">Home</a>
      <a href="about.html"     class="footer-link">About Coach Linda</a>
      <a href="services.html"  class="footer-link">Services</a>
      <a href="journey.html"   class="footer-link">Your Journey</a>
      <a href="trainings.html" class="footer-link">Trainings</a>
      <a href="events.html"    class="footer-link">Events</a>
      <a href="community.html" class="footer-link">Community</a>
    </div>
    <div>
      <div class="footer-col-title">Programs</div>
      <a href="trainings.html#leadership" class="footer-link">Leadership Mastery</a>
      <a href="trainings.html#executive"  class="footer-link">Executive Presence</a>
      <a href="trainings.html#wellness"   class="footer-link">Leadership & Wellness</a>
      <a href="trainings.html#mastermind" class="footer-link">Reset Mastermind</a>
      <a href="events.html"               class="footer-link">Masterclass Tours</a>
      <a href="book.html"                 class="footer-link">Book a Session</a>
    </div>
    <div>
      <div class="footer-col-title">Contact Us</div>
      <div class="footer-contact-item">
        <i class="fas fa-envelope"></i>
        <span>hello@coachlinda.com</span>
      </div>
      <div class="footer-contact-item">
        <i class="fab fa-whatsapp"></i>
        <span>+254 700 000 000</span>
      </div>
      <div class="footer-contact-item">
        <i class="fas fa-map-marker-alt"></i>
        <span>Nairobi, Kenya<br>& Online Globally</span>
      </div>
      <a href="book.html" class="btn btn-primary" style="margin-top:20px;font-size:.85rem;padding:12px 24px">
        <i class="fas fa-calendar-check"></i> Book a Call
      </a>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© ${new Date().getFullYear()} Coach Linda. All rights reserved.</span>
    <span>Built with purpose & intention.</span>
    <span>
      <a href="#" style="color:rgba(255,255,255,.4);margin-right:16px">Privacy Policy</a>
      <a href="#" style="color:rgba(255,255,255,.4)">Terms of Service</a>
    </span>
  </div>
</footer>`;

  const placeholder = document.getElementById('footer-placeholder');
  if (placeholder) placeholder.outerHTML = footerHTML;
}

/* ── Navbar Scroll Behavior ─────────────────────────────── */
function initNav() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  // Solid on non-hero pages
  if (!document.querySelector('.hero')) nav.classList.add('solid');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Hamburger
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
  }
}

/* ── Scroll Reveal ──────────────────────────────────────── */
function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.revealDelay || 0;
        setTimeout(() => el.classList.add('revealed'), delay * 100);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
}

/* ── Counter Animation ──────────────────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();

      function update(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => obs.observe(el));
}

/* ── Auth Helpers ───────────────────────────────────────── */
function logout() {
  localStorage.removeItem('cl_token');
  localStorage.removeItem('cl_user');
  window.location.href = 'index.html';
}

function getToken() { return localStorage.getItem('cl_token'); }
function getUser()  { return JSON.parse(localStorage.getItem('cl_user') || 'null'); }

async function authFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (res.status === 401) { logout(); return null; }
  return res;
}

/* ── Alert Helper ───────────────────────────────────────── */
function showAlert(containerId, type, message) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.className = `alert alert-${type}`;
  el.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
  el.style.display = 'flex';
  if (type === 'success') setTimeout(() => el.style.display = 'none', 5000);
}

/* ── Google Pay Integration ─────────────────────────────── */
function initGooglePay(amount, courseId, courseName) {
  if (!window.google || !window.google.payments) return;

  const paymentRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [{
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['MASTERCARD', 'VISA'],
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: { gateway: 'stripe', gatewayMerchantId: 'YOUR_STRIPE_MERCHANT_ID' },
      },
    }],
    merchantInfo: { merchantId: 'YOUR_GOOGLE_PAY_MERCHANT_ID', merchantName: 'Coach Linda' },
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPriceLabel: courseName,
      totalPrice: String(amount),
      currencyCode: 'KES',
      countryCode: 'KE',
    },
  };

  const client = new google.payments.api.PaymentsClient({ environment: 'PRODUCTION' });
  return { client, paymentRequest };
}

/* ── Video Embed ────────────────────────────────────────── */
function initVideoEmbeds() {
  document.querySelectorAll('.video-overlay').forEach(overlay => {
    overlay.addEventListener('click', function() {
      const container = this.closest('.video-container');
      const iframe = container.querySelector('iframe');
      if (iframe) {
        const src = iframe.src;
        iframe.src = src.includes('?') ? src + '&autoplay=1' : src + '?autoplay=1';
      }
      this.style.display = 'none';
    });
  });
}

/* ── Testimonials Slider ────────────────────────────────── */
function initTestimonialsSlider() {
  const slider = document.querySelector('.testimonials-slider');
  if (!slider) return;
  // Simple auto-scroll behavior can be added here
}

/* ── Init ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initCounters();
  initVideoEmbeds();
  initTestimonialsSlider();
});

window.showAlert = showAlert;
window.logout    = logout;
window.getToken  = getToken;
window.getUser   = getUser;
window.authFetch = authFetch;
window.API_BASE  = API_BASE;
window.injectNav = injectNav;
window.injectFooter = injectFooter;
