// Site-wide inertial smooth scrolling via Lenis. Native wheel scrolling moves
// in coarse ~100px steps, which makes scroll-driven effects (social horizontal
// track, reveals) feel choppy; Lenis interpolates the scroll position every
// frame so everything tied to scroll glides instead of stepping. The hero
// captures wheel events itself while pinned (main.js) and stops them from
// reaching Lenis so the page holds still during slide transitions.
(function () {
  if (typeof Lenis === 'undefined') return; // CDN unavailable: native scroll still works

  var lenis = new Lenis({
    lerp: 0.09,
    smoothWheel: true
  });
  window.lenis = lenis;

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // smooth-scroll in-page anchor links that point at real elements
  // (hash-only links like #slide-2 have no element; main.js handles those)
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var hash = link.getAttribute('href');
    if (hash.length < 2) return;
    var target = document.getElementById(hash.slice(1));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target);
  });
})();
