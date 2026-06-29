/* ── js/animations.js ── */
document.addEventListener('DOMContentLoaded', () => {
  // Setup IntersectionObserver for fade-in slide reveals
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0) {
    const observerOptions = {
      root: null, // use viewport
      rootMargin: '0px 0px -5% 0px', // trigger slightly before entering viewport fully
      threshold: 0.05 // 5% visible
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once animated, no need to watch again
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  } else {
    // Fallback if no reveal elements found or intersection observer not supported
    revealElements.forEach(el => {
      el.classList.add('active');
    });
  }
});
