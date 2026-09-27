// Scroll-entrance reveals: elements marked with [data-reveal] rise/slide in
// the first time they enter the viewport. Once the transition finishes the
// attribute is stripped so the element returns to its normal stylesheet
// state (keeps hover transforms working afterwards).
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function strip(el) {
    el.classList.remove('is-revealed');
    el.removeAttribute('data-reveal');
  }

  function reveal(el) {
    el.classList.add('is-revealed');

    var cleaned = false;
    function clean() {
      if (cleaned) return;
      cleaned = true;
      strip(el);
    }

    el.addEventListener('transitionend', function handler(e) {
      // transform is the longest-running property; wait for it so stripping
      // the attribute doesn't cut the motion short
      if (e.target !== el || e.propertyName !== 'transform') return;
      el.removeEventListener('transitionend', handler);
      clean();
    });
    setTimeout(clean, 2600); // safety net if transitionend never fires
  }

  var observer = null;
  if (!reduce && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
          reveal(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  }

  function scan(root) {
    var els = (root || document).querySelectorAll('[data-reveal]');
    Array.prototype.forEach.call(els, function (el) {
      if (observer) observer.observe(el);
      else strip(el); // no IO support or reduced motion: show immediately
    });
  }

  // navbar/footer are injected after load; their scripts re-scan their mount
  window.revealScan = scan;
  scan(document);
})();
