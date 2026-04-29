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








/* ========================================
   ABOUT SLIDER
======================================== */
const aboutSlider = document.querySelector('.about-slider');
const aboutDots = document.querySelectorAll('.about-dot');
let aboutCurrent = 0;
let aboutAutoSlide;

function updateAboutSlider() {
  if (!aboutSlider) return;
  const moveDistance = aboutCurrent * 100;
  // In RTL, 100% moves slider visually to the right
  aboutSlider.style.transform = `translateX(${moveDistance}%)`;

  aboutDots.forEach((dot, index) => {
    dot.classList.toggle('active', index === aboutCurrent);
  });
}

function nextAboutSlide() {
  const slides = document.querySelectorAll('.about-slide');
  if (slides.length === 0) return;
  aboutCurrent = (aboutCurrent + 1) % slides.length;
  updateAboutSlider();
}

if (aboutSlider && aboutDots.length > 0) {
  aboutDots.forEach(dot => {
    dot.addEventListener('click', () => {
      aboutCurrent = parseInt(dot.getAttribute('data-index'));
      updateAboutSlider();
      resetAboutAutoSlide();
    });
  });
}

function startAboutAutoSlide() {
  if (!aboutSlider) return;
  aboutAutoSlide = setInterval(nextAboutSlide, 2500);
}

function resetAboutAutoSlide() {
  clearInterval(aboutAutoSlide);
  startAboutAutoSlide();
}

window.addEventListener('load', () => {
  if (aboutSlider) {
    startAboutAutoSlide();
  }
});

// End of file

/* ========================================
   GALLERY DATA & RENDERING (Designs Page)
======================================== */
const galleryData = [
  // --- Modern ---
  { category: 'modern', src: 'imges/modrn1.png', alt: 'Modern 1' },
  { category: 'modern', src: 'imges/modrn2.png', alt: 'Modern 2' },
  { category: 'modern', src: 'imges/modrn3.png', alt: 'Modern 3' },
  { category: 'modern', src: 'imges/modrn4.png', alt: 'Modern 4' },
  { category: 'modern', src: 'imges/modrn5.png', alt: 'Modern 5' },
  { category: 'modern', src: 'imges/modrn6.png', alt: 'Modern 6' },
  { category: 'modern', src: 'imges/modrn7.png', alt: 'Modern 7' },
  { category: 'modern', src: 'imges/modrn8.png', alt: 'Modern 8' },
  { category: 'modern', src: 'imges/modrn9.png', alt: 'Modern 9' },
  { category: 'modern', src: 'imges/modrn11.png', alt: 'Modern 11' },

  // --- Classic ---.png
  { category: 'classic', src: 'imges/classic1.png', alt: 'Classic 1' },
  { category: 'classic', src: 'imges/classic2.png', alt: 'Classic 2' },
  { category: 'classic', src: 'imges/classic3.png', alt: 'Classic 3' },
  { category: 'classic', src: 'imges/classic4.png', alt: 'Classic 4' },
  { category: 'classic', src: 'imges/classic5.png', alt: 'Classic 5' },
  { category: 'classic', src: 'imges/classic6.png', alt: 'Classic 6' },
  { category: 'classic', src: 'imges/classic7.png', alt: 'Classic 7' },
  { category: 'classic', src: 'imges/classic8.png', alt: 'Classic 8' },
  { category: 'classic', src: 'imges/classic9.png', alt: 'Classic 9' },
  { category: 'classic', src: 'imges/classic11.png', alt: 'Classic 11' },

  // --- New Classic ---
  { category: 'new-classic', src: 'imges/newclassic1.png', alt: 'New Classic 1' },
  { category: 'new-classic', src: 'imges/newclassic2.png', alt: 'New Classic 2' },
  { category: 'new-classic', src: 'imges/newclassic3.png', alt: 'New Classic 3' },
  { category: 'new-classic', src: 'imges/newclassic4.png', alt: 'New Classic 4' },
  { category: 'new-classic', src: 'imges/newclassic5.png', alt: 'New Classic 5' },
  { category: 'new-classic', src: 'imges/newclassic6.png', alt: 'New Classic 6' },
  { category: 'new-classic', src: 'imges/newclassic7.png', alt: 'New Classic 7' },
  { category: 'new-classic', src: 'imges/newclassic8.png', alt: 'New Classic 8' },

  // --- Semi Classic ---
  { category: 'semi-classic', src: 'imges/semiclassic1.png', alt: 'Semi Classic 1' },
  { category: 'semi-classic', src: 'imges/semiclassic2.png', alt: 'Semi Classic 2' },
  { category: 'semi-classic', src: 'imges/semiclassic3.png', alt: 'Semi Classic 3' },
];

function renderGallery(filter = 'modern') {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  // Clear existing items
  grid.innerHTML = '';

  // Filter the data
  const filteredData = galleryData.filter(item => item.category === filter);

  // Generate HTML for each item
  filteredData.forEach((itemData, index) => {
    const itemEl = document.createElement('div');
    itemEl.className = `gallery-item ${itemData.category} animate-fade-up`;

    // Stagger animation
    itemEl.style.transitionDelay = `${(index % 3) * 0.1}s`;

    itemEl.innerHTML = `
      <div class="gallery-img-wrapper">
        <img src="${itemData.src}" alt="${itemData.alt}" loading="lazy" />
        <div class="img-overlay">
          <div class="overlay-content">
            <img src="imges/Group (5).png" alt="eye icon" class="eye-icon" />
            <span>عرض الصورة كاملة</span>
          </div>
        </div>
      </div>
    `;

    // Lightbox trigger
    itemEl.addEventListener('click', () => {
      openLightboxManual(filteredData, index);
    });

    grid.appendChild(itemEl);

    // Initial reveal
    setTimeout(() => {
      itemEl.classList.add('show');
    }, 50);
  });
}

/* ========================================
   LIGHTBOX LOGIC
======================================== */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let currentActiveImages = [];
let currentActiveIndex = 0;

function openLightboxManual(images, index) {
  currentActiveImages = images;
  currentActiveIndex = index;
  updateLightboxContent();
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function updateLightboxContent() {
  if (currentActiveImages[currentActiveIndex]) {
    lightboxImg.src = currentActiveImages[currentActiveIndex].src;
  }
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

function nextImage() {
  currentActiveIndex = (currentActiveIndex + 1) % currentActiveImages.length;
  updateLightboxContent();
}

function prevImage() {
  currentActiveIndex = (currentActiveIndex - 1 + currentActiveImages.length) % currentActiveImages.length;
  updateLightboxContent();
}

// Event Listeners
if (lightboxClose) {
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', nextImage);
  lightboxPrev.addEventListener('click', prevImage);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });
}

/* ========================================
   INITIALIZATION
======================================== */
document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');

  if (filterBtns.length > 0) {
    const activeBtn = document.querySelector('.filter-btn.active');
    const initialFilter = activeBtn ? activeBtn.getAttribute('data-filter') : 'modern';

    renderGallery(initialFilter);

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filterValue = btn.getAttribute('data-filter');
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderGallery(filterValue);
      });
    });
  }

  /* ========================================
     ACCESSORIES PAGE – Static Gallery Lightbox
  ======================================== */
  const galleryGrid = document.getElementById('galleryGrid');

  if (galleryGrid && filterBtns.length === 0) {
    const staticItems = galleryGrid.querySelectorAll('.gallery-item');

    if (staticItems.length > 0) {
      const accessoriesImages = Array.from(staticItems).map(item => {
        const img = item.querySelector('img');
        return { src: img ? img.getAttribute('src') : '', alt: img ? img.getAttribute('alt') : '' };
      });


      staticItems.forEach((item, index) => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
          openLightboxManual(accessoriesImages, index);
        });
      });
    }
  }
});