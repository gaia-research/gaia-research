/* ── js/main.js ── */
document.addEventListener('DOMContentLoaded', () => {
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
