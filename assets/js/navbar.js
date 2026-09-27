// Loads navbar.html into the #navbar placeholder, then wires up the toggle menu.
(function () {
  var mount = document.getElementById('navbar');
  if (!mount) return;

  fetch('/navbar.html')
    .then(function (res) { return res.text(); })
    .then(function (html) {
      mount.innerHTML = html;
      init();
    })
    .catch(function (err) {
      console.error('Could not load navbar.html — run the site from a local server.', err);
    });

  function init() {
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;

    function setOpen(open) {
      toggle.classList.toggle('is-open', open);
      menu.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.setAttribute('aria-hidden', String(!open));

      // pause inertial scrolling while the fullscreen menu covers the page
      if (window.lenis) {
        if (open) window.lenis.stop();
        else window.lenis.start();
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(!menu.classList.contains('is-open'));
    });

    // close after choosing a link so the page behind is visible again
    Array.prototype.forEach.call(menu.querySelectorAll('a'), function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }
})();
