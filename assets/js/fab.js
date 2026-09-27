// Loads fab.html into the #fab placeholder, then wires up the floating buttons.
(function () {
  var mount = document.getElementById('fab');
  if (!mount) return;

  fetch('/fab.html')
    .then(function (res) { return res.text(); })
    .then(function (html) {
      mount.innerHTML = html;
      init();
    })
    .catch(function (err) {
      console.error('Could not load fab.html — run the site from a local server.', err);
    });

  function init() {
    var top = document.getElementById('fabTop');
    var whatsapp = document.querySelector('.fab--whatsapp');
    if (!top && !whatsapp) return;

    function toggleVisibility() {
      var visible = window.scrollY > 500;
      if (top) top.classList.toggle('is-visible', visible);
      if (whatsapp) whatsapp.classList.toggle('is-visible', visible);
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true });
    toggleVisibility();

    if (top) {
      top.addEventListener('click', function () {
        if (window.lenis) window.lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }
})();
