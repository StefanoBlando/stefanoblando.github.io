export function getMagneticOffset({ x, y, width, height }) {
  const normalize = (value, size) => Math.max(-3, Math.min(3, ((value / size) - 0.5) * 6));
  return { x: normalize(x, width), y: normalize(y, height) };
}

function initializePortfolioInteractions() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) document.documentElement.classList.add('portfolio-motion');

  document.querySelectorAll('[data-pointer-glow]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
      card.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
    }, { passive: true });
  });

  if (!reduced) {
    document.querySelectorAll('[data-magnetic]').forEach((button) => {
      button.addEventListener('pointermove', (event) => {
        const bounds = button.getBoundingClientRect();
        const offset = getMagneticOffset({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
          width: bounds.width,
          height: bounds.height,
        });
        button.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
      }, { passive: true });
      button.addEventListener('pointerleave', () => { button.style.transform = ''; });
    });
  }

  const revealItems = document.querySelectorAll('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('portfolio-reveal--visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('portfolio-reveal--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    revealItems.forEach((item) => observer.observe(item));
  }

  const header = document.getElementById('site-header');
  const updateHeader = () => header?.classList.toggle('portfolio-header--scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if ('IntersectionObserver' in window) {
    const sections = document.querySelectorAll('section');
    const navLinks = Array.from(document.querySelectorAll('#site-header a'));

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        
        const id = (entry.target.id || '').toLowerCase();
        const className = (entry.target.className || '').toLowerCase();
        
        const activeLink = navLinks.find((link) => {
          const href = (link.getAttribute('href') || '').toLowerCase();
          if (!href) return false;

          // 1. Research section
          if ((id === 'research' || className.includes('research-list') || className.includes('research-pillars')) && href.includes('research')) {
            return true;
          }

          // 2. Projects section
          if ((id === 'work' || id === 'projects' || className.includes('featured-cases') || className.includes('featured-projects')) && (href.includes('projects') || href.includes('work'))) {
            return true;
          }

          // 3. Publications section
          if ((id === 'featured-publications' || id === 'publications') && href.includes('publications')) {
            return true;
          }

          // 4. Experience section
          if ((id.includes('experience') || id.includes('education') || className.includes('experience') || className.includes('education') || className.includes('wg-resume-experience')) && href.includes('experience')) {
            return true;
          }

          // 5. Contact section
          if ((id === 'contact' || className.includes('portfolio-contact')) && href.includes('contact')) {
            return true;
          }

          return false;
        });

        if (activeLink) {
          navLinks.forEach((link) => {
            link.removeAttribute('aria-current');
            link.classList.remove('active');
          });
          activeLink.setAttribute('aria-current', 'location');
          activeLink.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -40%', threshold: 0 });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  const pillarRows = document.querySelectorAll('.research-list__row');
  pillarRows.forEach((row) => {
    const trigger = row.querySelector('.research-list__trigger');
    const drawer = row.querySelector('.research-list__drawer');
    if (!trigger || !drawer) return;

    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', !isExpanded);
      drawer.setAttribute('aria-hidden', isExpanded);
      row.classList.toggle('is-expanded', !isExpanded);
    });
  });

  // Animated Copy to Clipboard micro-interaction
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const text = btn.getAttribute('data-copy');
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        btn.classList.add('is-copied');

        const label = btn.querySelector('.portfolio-copy-btn__label, .portfolio-copy-btn__text');
        if (label && !label.dataset.origText) {
          label.dataset.origText = label.textContent;
          label.textContent = 'Copied!';
        }

        setTimeout(() => {
          btn.classList.remove('is-copied');
          if (label && label.dataset.origText) {
            label.textContent = label.dataset.origText;
            delete label.dataset.origText;
          }
        }, 2000);
      } catch (err) {
        console.warn('Clipboard write failed:', err);
      }
    });
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePortfolioInteractions, { once: true });
  } else {
    initializePortfolioInteractions();
  }
}
