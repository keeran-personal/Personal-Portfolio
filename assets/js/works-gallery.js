// Horizontal work gallery (landonorris.com style), same mechanism as
// social-scroll.js: the section is given extra height equal to the track's
// horizontal overflow, the inner viewport pins via position:sticky, and the
// track translates left in lockstep with the scrolled distance — so vertical
// scroll reads as horizontal travel. Lenis (smooth-scroll.js) interpolates
// the scroll position, which keeps the glide smooth.
(function () {
  var section = document.getElementById('worksGallery');
  var track = document.getElementById('worksGalleryTrack');
  if (!section || !track) return;

  var maxTranslate = 0;
  var ticking = false;

  function measure() {
    maxTranslate = Math.max(0, track.scrollWidth - window.innerWidth);
    section.style.height = maxTranslate > 0 ? (window.innerHeight + maxTranslate) + 'px' : '';
  }

  function update() {
    if (maxTranslate <= 0) {
      track.style.transform = '';
      return;
    }
    var scrolled = -section.getBoundingClientRect().top;
    var progress = Math.min(1, Math.max(0, scrolled / maxTranslate));

    track.style.transform = 'translate3d(' + (-progress * maxTranslate) + 'px, 0, 0)';
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

  // re-measure once images arrive: their widths set the track's true length
  window.addEventListener('load', function () {
    measure();
    requestTick();
  });

  measure();
  requestTick();
})();
