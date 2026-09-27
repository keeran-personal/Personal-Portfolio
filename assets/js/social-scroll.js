(function () {
  var section = document.getElementById('social');
  var viewport = document.getElementById('socialViewport');
  var track = document.getElementById('socialTrack');
  if (!section || !viewport || !track) return;

  var maxTranslate = 0;
  var ticking = false;

  function measure() {
    maxTranslate = Math.max(0, track.scrollWidth - viewport.clientWidth);
    section.style.height = maxTranslate > 0 ? (window.innerHeight + maxTranslate) + 'px' : '';
  }

  function update() {
    if (maxTranslate <= 0) {
      track.style.transform = '';
      return;
    }
    var rect = section.getBoundingClientRect();
    var scrolled = -rect.top;
    var progress = Math.min(1, Math.max(0, scrolled / maxTranslate));

    track.style.transform = 'translateX(' + (-progress * maxTranslate) + 'px)';
  }

  function requestTick() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(function () {
        update();
        ticking = false;
      });
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', function () {
    measure();
    requestTick();
  });

  measure();
  requestTick();
})();
