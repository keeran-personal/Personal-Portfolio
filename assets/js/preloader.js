// Preloader: progress is a function of elapsed time (eases toward 90 while
// assets load, ramps to 100 once window load fires), so it advances correctly
// even when rAF is throttled (background tabs); a low-rate interval guarantees
// completion, rAF just makes the counter smooth. Ends with the curtain exit.
(function () {
  var pre = document.getElementById('preloader');
  if (!pre) return;

  var root = document.documentElement;
  root.classList.add('pl-lock');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var count = document.getElementById('preloaderCount');
  var bar = document.getElementById('preloaderBar');

  var start = performance.now();
  var loadedAt = 0;
  var loadedFrom = 0;
  var finished = false;
  var MIN_TIME = reduce ? 300 : 1900;
  var RAMP = reduce ? 150 : 450;

  function markLoaded() {
    if (!loadedAt) {
      loadedAt = performance.now();
      loadedFrom = creepProgress(loadedAt - start);
    }
  }
  window.addEventListener('load', markLoaded);
  // safety net: never trap the visitor if a slow asset hangs the load event
  setTimeout(markLoaded, 8000);

  // pre-load creep: eases toward 90 and stalls there until load fires
  function creepProgress(elapsed) {
    return 90 * (1 - Math.exp(-elapsed / 1100));
  }

  function update() {
    if (finished) return;
    var now = performance.now();
    var progress;
    if (loadedAt) {
      progress = Math.min(100, loadedFrom + (100 - loadedFrom) * ((now - loadedAt) / RAMP));
    } else {
      progress = creepProgress(now - start);
    }
    if (count) count.textContent = Math.floor(progress);
    if (bar) bar.style.transform = 'scaleX(' + progress / 100 + ')';
    if (progress >= 100 && now - start >= MIN_TIME) finish();
  }

  var fallback = setInterval(update, 200);
  (function raf() {
    if (finished) return;
    update();
    requestAnimationFrame(raf);
  })();

  function finish() {
    finished = true;
    clearInterval(fallback);
    if (count) count.textContent = '100';
    pre.classList.add('preloader--done');
    root.classList.remove('pl-lock');
    setTimeout(function () {
      pre.style.display = 'none';
      document.dispatchEvent(new CustomEvent('preloader:done'));
    }, reduce ? 400 : 1450);
  }
})();
