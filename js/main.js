/* ── js/main.js ── */
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close mobile nav when clicking a link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // Interactive Console Tabs
  const consoleTabs = document.querySelectorAll('.console-tab');
  const consolePanes = document.querySelectorAll('.console-pane');

  if (consoleTabs && consolePanes) {
    consoleTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');

        // Reset active state for all tabs
        consoleTabs.forEach(t => t.classList.remove('active'));
        // Set active for clicked tab
        tab.classList.add('active');

        // Toggle active pane
        consolePanes.forEach(pane => {
          if (pane.getAttribute('id') === `pane-${targetTab}`) {
            pane.classList.add('active');
          } else {
            pane.classList.remove('active');
          }
        });
      });
    });
  }
});
