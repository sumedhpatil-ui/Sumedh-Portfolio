// ============================================
// TYPED STATUS LINE (hero editor signature)
// ============================================
const statuses = ["learning React", "open to internships", "always shipping"];
let statusIndex = 0;
let charIndex = 0;
let deleting = false;
const typedEl = document.getElementById('typedStatus');

function typeLoop() {
  if (!typedEl) return;
  const current = statuses[statusIndex];

  if (!deleting) {
    typedEl.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1400);
      return;
    }
  } else {
    typedEl.textContent = current.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      deleting = false;
      statusIndex = (statusIndex + 1) % statuses.length;
    }
  }
  setTimeout(typeLoop, deleting ? 35 : 65);
}
typeLoop();

// ============================================
// MOBILE NAV TOGGLE
// ============================================
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ============================================
// CONTACT FORM — sends to the live backend API
// ============================================
// Replace this with your deployed Render backend URL.
// Example: 'https://sumedh-portfolio-api.onrender.com/api/contact'
const API_URL = 'https://sumedh-portfolio.onrender.com/api/contact';

const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    status.textContent = '⚠ please fill in all fields.';
    status.style.color = '#F78166';
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'sending...';
  status.textContent = '';

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Something went wrong.');
    }

    status.textContent = `✓ thanks, ${name} — your message has been sent.`;
    status.style.color = '#3FB950';
    form.reset();
  } catch (err) {
    status.textContent = `⚠ ${err.message || 'could not send message, please try again.'}`;
    status.style.color = '#F78166';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'send message';
  }
});
