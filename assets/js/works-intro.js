// Work-intro pinned panel (lenis.dev style), two beats on ONE stuck screen.
// The section is much taller than the viewport and its panel is
// position:sticky, so the panel holds still while the user scrolls through
// the extra height. Everything below maps that scroll progress (0..1) to the
// choreography; Lenis (smooth-scroll.js) interpolates the scroll position,
// which is what makes it glide.
//
// Beat 1 (progress 0 → ~0.55): the giant lines shear horizontally — positive
// data-works-speed drifts right→left, negative the other way — sitting in
// their natural CSS position at the beat's midpoint, then fade out.
//
// Beat 2 (progress ~0.5 → 1): "ENTER THE WORK" settles in centered, holds,
// then scales up enormously with the transform-origin planted in the stem of
// the "T" — the viewer flies into the letter. The glyphs are the same cream
// as the page background, so once the stem fills the viewport the section
// unpins into the next cream section with no visible seam. A cream veil
// fades in over the last stretch as insurance so no dark slivers survive at
// the corners regardless of glyph metrics.
(function () {
  var section = document.getElementById('works');
  var shear = document.getElementById('worksShear');
  var zoom = document.getElementById('worksZoomTitle');
  var letter = document.getElementById('worksZoomLetter');
  if (!section || !shear || !zoom || !letter) return;
  var lines = shear.querySelectorAll('[data-works-speed]');
  var veil = section.querySelector('.works-intro__veil');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var TRAVEL = 38;        // vw each shear line moves per unit of speed
  var SHEAR_END = 0.55;   // progress at which the lines finish their travel
  var SHEAR_FADE = 0.44;  // lines fade out between here and SHEAR_END
  var ZOOM_IN = 0.5;      // zoom title fades/settles in from here...
  var ZOOM_HOLD = 0.62;   // ...holds centered until here, then the zoom runs
  var MAX_SCALE = 70;     // enough for the T's stem to swallow the viewport
  var VEIL_START = 0.88; // cream takes over early so the dark-brown flash stays brief

  var ticking = false;

  function clamp01(v) { return Math.min(1, Math.max(0, v)); }

  // aim the zoom at the middle of the T's stem (title is the offsetParent)
  function setOrigin() {
    var x = letter.offsetLeft + letter.offsetWidth / 2;
    var y = letter.offsetTop + letter.offsetHeight * 0.55;
    zoom.style.transformOrigin = x + 'px ' + y + 'px';
  }

  function update() {
    var i;
    if (reduceMotion.matches) {
      for (i = 0; i < lines.length; i++) lines[i].style.transform = '';
      shear.style.opacity = '';
      shear.style.visibility = '';
      zoom.style.transform = '';
      zoom.style.opacity = '';
      if (veil) veil.style.opacity = 0;
      return;
    }
    var range = section.offsetHeight - window.innerHeight;
    if (range <= 0) return;
    var progress = clamp01(-section.getBoundingClientRect().top / range);

    // ---- beat 1: shear ----
    var shift = (clamp01(progress / SHEAR_END) - 0.5) * 2; // -1 → 0 → 1
    for (i = 0; i < lines.length; i++) {
      var speed = parseFloat(lines[i].getAttribute('data-works-speed')) || 0;
      lines[i].style.transform = 'translate3d(' + (-shift * speed * TRAVEL) + 'vw, 0, 0)';
    }
    var shearOpacity = 1 - clamp01((progress - SHEAR_FADE) / (SHEAR_END - SHEAR_FADE));
    shear.style.opacity = shearOpacity;
    shear.style.visibility = shearOpacity <= 0 ? 'hidden' : '';

    // ---- beat 2: zoom ----
    var settle = clamp01((progress - ZOOM_IN) / (ZOOM_HOLD - ZOOM_IN));
    var t = clamp01((progress - ZOOM_HOLD) / (1 - ZOOM_HOLD));
    var scale = (0.92 + 0.08 * settle) * (1 + Math.pow(t, 2.4) * (MAX_SCALE - 1));
    zoom.style.opacity = settle;
    zoom.style.transform = 'scale(' + scale + ')';

    if (veil) veil.style.opacity = clamp01((progress - VEIL_START) / (1 - VEIL_START));
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
    setOrigin();
    requestTick();
  });

  // glyph metrics shift once the Anton webfont arrives — re-aim then
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      setOrigin();
      requestTick();
    });
  }

  setOrigin();
  update();
})();
