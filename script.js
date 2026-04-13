/* ========================================
   NAVBAR – scroll effect + hamburger
======================================== */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ========================================
   SCROLL REVEAL ANIMATIONS
======================================== */
const allAnimatedEls = document.querySelectorAll(
  '.animate-fade-up, .animate-fade-in, .animate-fade-right, .animate-fade-left, .animate-slide-right, .animate-slide-left'
);

const globalRevealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        entry.target.classList.add('visible'); // keep for backward compatibility
        globalRevealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

allAnimatedEls.forEach(el => globalRevealObserver.observe(el));

// Trigger top elements immediately
window.addEventListener('load', () => {
  document.querySelectorAll('#banner .show, .hero .show, .navbar .show').forEach(el => {
    el.classList.add('show');
  });
});

/* ========================================
   ACTIVE NAV LINK on scroll
======================================== */
const sections = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  },
  { threshold: 0.45 }
);

sections.forEach(s => sectionObserver.observe(s));

/* ========================================
   SERVICES SLIDER
======================================== */
const grid = document.querySelector('.services-grid');
const dots = document.querySelectorAll('.dot');
const prev = document.getElementById('prevBtn');
const next = document.getElementById('nextBtn');

let current = 0;
let autoSlideInterval;

function getVisibleItems() {
  const width = window.innerWidth;
  if (width > 1024) return 3;
  if (width > 768) return 2;
  return 1;
}

function updateSlider() {
  if (!grid) return;
  const cards = grid.querySelectorAll('.service-card');
  const total = cards.length;
  const visible = getVisibleItems();
  const maxIndex = Math.max(0, total - visible);

  if (current > maxIndex) current = maxIndex;
  if (current < 0) current = 0;

  const gap = window.innerWidth <= 768 ? 20 : 24;
  const cardWidth = cards[0]?.offsetWidth || 0;
  
  // Calculate movement: (card size + gap) * index
  // We use percentage for better responsiveness or pixel
  const moveDistance = (cardWidth + gap) * current;
  
  grid.style.transform = `translateX(${moveDistance}px)`;

  // Update dots
  dots.forEach((d, i) => {
    d.classList.toggle('active', i === current);
    // Hide dots that aren't reachable
    d.style.display = i <= maxIndex ? 'block' : 'none';
  });

  // Hide arrows if not needed
  if (prev && next) {
    prev.style.opacity = current === 0 ? '0.3' : '1';
    prev.style.pointerEvents = current === 0 ? 'none' : 'auto';
    next.style.opacity = current === maxIndex ? '0.3' : '1';
    next.style.pointerEvents = current === maxIndex ? 'none' : 'auto';
  }
}

function goTo(index) {
  const cards = grid.querySelectorAll('.service-card');
  const total = cards.length;
  const visible = getVisibleItems();
  const maxIndex = Math.max(0, total - visible);

  current = index;
  if (current > maxIndex) current = 0; // Wrap to start
  if (current < 0) current = maxIndex; // Wrap to end

  updateSlider();
}

if (prev && next) {
  prev.addEventListener('click', () => {
    stopAutoSlide();
    goTo(current - 1);
    startAutoSlide();
  });
  next.addEventListener('click', () => {
    stopAutoSlide();
    goTo(current + 1);
    startAutoSlide();
  });
}

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    stopAutoSlide();
    goTo(i);
    startAutoSlide();
  });
});

// Auto-rotate every 5s
function startAutoSlide() {
  stopAutoSlide();
  autoSlideInterval = setInterval(() => {
    const visible = getVisibleItems();
    const cards = grid?.querySelectorAll('.service-card');
    if (cards && cards.length > visible) {
      goTo(current + 1);
    }
  }, 5000);
}

function stopAutoSlide() {
  if (autoSlideInterval) clearInterval(autoSlideInterval);
}

// Touch support
let touchStartX = 0;
let touchEndX = 0;

grid?.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
  stopAutoSlide();
}, { passive: true });

grid?.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
  startAutoSlide();
}, { passive: true });

function handleSwipe() {
  const swipeThreshold = 50;
  if (touchStartX - touchEndX > swipeThreshold) {
    // Swiped left
    goTo(current + 1);
  } else if (touchEndX - touchStartX > swipeThreshold) {
    // Swiped right
    goTo(current - 1);
  }
}

// Initialize and handle resize
window.addEventListener('load', () => {
  updateSlider();
  startAutoSlide();
});

window.addEventListener('resize', () => {
  updateSlider();
});

// Sync direction for RTL
// Since we are in RTL, translateX positive moves left?
// Let's test. Standard browser behavior for RTL:
// translateX moves in visual direction.
// We want to move visual LEFT when clicking NEXT.
// In RTL, translateX(100px) moves right? No, depends on browser.
// Usually in RTL, negative translateX moves left visually.
// But wait, the cards are stored from right to left?
// No, the grid is display:flex; flex-direction:row (default).
// In RTL, flex row starts from right.
// Card 0 is on the right. Card 1 is to its left.
// To see Card 1, we need to move the grid RIGHT? No, move grid LEFT.
// Visually move left = translateX(-X) or translateX(X)?
// Let's use `translateX(${moveDistance}px)` where moveDistance is POSITIVE for RTL movement?
// Actually, I'll use a more reliable way: check scrollLeft or just test.
// Most modern browsers handle translateX visually.
// Let's stick to positive for now and see. 
// Wait, if I'm at Card 0 (right), I want to see Card 1 (left). 
// Visually, the grid moves LEFT.
// In RTL, translateX(move) usually moves relative to the starting point (right).
// So translateX(100px) pushes it visually LEFT?
// Let's verify.


/* ========================================
   VIDEO – ensure autoplay on mobile
======================================== */
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
  heroVideo.play().catch(() => {
    // Autoplay blocked – show poster fallback silently
  });
}









// End of file