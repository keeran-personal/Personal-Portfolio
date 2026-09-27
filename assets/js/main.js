// Hero slider: 4 slides with anime.js-driven photo flip + letter transitions.
// The hero is exactly one viewport tall — it adds no extra scroll distance.
// While the hero sits at the top of the page, wheel / touch / key input is
// captured and each gesture advances exactly one slide; a lock during the
// transition means fast scrolling can never skip a slide. Scrolling down on
// the last slide (or up on the first) releases the page to scroll normally.
(function () {
  var hero = document.getElementById('hero');
  var role = document.getElementById('heroRole');
  var flip = document.getElementById('heroFlip');
  var photo = document.getElementById('heroPhoto');
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero__dot'));

  var slides = [
    { key: 's1', role: 'FRONTEND DEV',      src: 'assets/images/Entrepreneur.png' },
    { key: 's2', role: 'FREELANCE',            src: 'assets/images/Mentor.png' },
    { key: 's3', role: 'BACKEND DEVELOPER',   src: 'assets/images/ContentCreator.png'},
    { key: 's4', role: 'WEB DEVELOPER',     src: 'assets/images/developer.png'}
  ];

  var current = 0;
  var animating = false;
  var pendingIndex = null; // navigation requested while a transition was playing

  // preload photos; swap to the fallback if a slide's image doesn't exist yet
  slides.forEach(function (slide) {
    var img = new Image();
    img.onerror = function () {
      if (slide.fallback) slide.src = slide.fallback;
    };
    img.src = slide.src;
  });

  // if the visible photo fails (slide image not added yet), show the fallback
  photo.addEventListener('error', function () {
    var slide = slides[current];
    if (slide.fallback && photo.src.indexOf(slide.fallback) === -1) {
      photo.src = slide.fallback;
    }
  });

  function splitRoleIntoLetters(text) {
    role.innerHTML = '';
    text.split('').forEach(function (ch) {
      var span = document.createElement('span');
      span.className = 'role-letter';
      var fill = document.createElement('span');
      fill.className = 'role-letter-fill';
      fill.textContent = ch === ' ' ? ' ' : ch;
      span.appendChild(fill);
      role.appendChild(span);
    });
    return Array.prototype.slice.call(role.children);
  }

  function setSlideClass(index) {
    slides.forEach(function (slide) {
      hero.classList.remove('hero--' + slide.key);
    });
    hero.classList.add('hero--' + slides[index].key);
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === index);
    });
  }

  function setRole(index) {
    role.className = 'hero__bgtext-line hero__bgtext-line--role role--' + slides[index].key;
    return splitRoleIntoLetters(slides[index].role);
  }

  function jumpTo(index) {
    current = index;
    setSlideClass(index);
    setRole(index);
    photo.src = slides[index].src;
  }

  // gestures can let the page drift a few px before the hero takes over;
  // square it back up so the hero stays perfectly pinned to the viewport
  function settleToTop() {
    if (window.scrollY < 1) return;
    if (window.lenis) window.lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goTo(index) {
    if (animating) return;
    var next = Math.min(slides.length - 1, Math.max(0, index));
    if (next === current) return;
    animating = true;
    settleToTop();

    var oldLetters = Array.prototype.slice.call(role.children);

    // backgrounds, photo position, icon positions and name margin all
    // transition via CSS as soon as the slide class flips
    setSlideClass(next);

    // old word tumbles out letter by letter
    anime({
      targets: oldLetters,
      translateY: [0, -90],
      rotateX: [0, 90],
      opacity: [1, 0],
      duration: 420,
      easing: 'easeInCubic',
      delay: anime.stagger(16)
    });

    // photo flips away, swaps face, flips back in
    anime({
      targets: flip,
      rotateY: [0, 90],
      duration: 480,
      easing: 'easeInCubic',
      complete: function () {
        photo.src = slides[next].src;

        anime({
          targets: flip,
          rotateY: [-90, 0],
          duration: 650,
          easing: 'easeOutCubic'
        });

        // new word tumbles in
        var newLetters = setRole(next);
        anime({
          targets: newLetters,
          translateY: [90, 0],
          rotateX: [-90, 0],
          opacity: [0, 1],
          duration: 620,
          easing: 'easeOutCubic',
          delay: anime.stagger(22),
          complete: function () {
            animating = false;
            // a dot / menu navigation may have arrived mid-transition
            if (pendingIndex !== null) {
              var queued = pendingIndex;
              pendingIndex = null;
              goTo(queued);
            }
          }
        });
      }
    });

    current = next;
  }

  // ---------- gesture capture: one gesture = one slide ----------

  // the hero owns the input only while it is pinned at the top of the
  // viewport and the fullscreen menu isn't covering the page
  function heroEngaged() {
    if (document.body.classList.contains('menu-open')) return false;
    var rect = hero.getBoundingClientRect();
    return rect.top > -10 && rect.top < 10;
  }

  function atEdge(dir) {
    return dir > 0 ? current === slides.length - 1 : current === 0;
  }

  var lastWheelTime = 0;
  var lastWheelDelta = 0;

  function onWheel(e) {
    var now = performance.now();
    var absDelta = Math.abs(e.deltaY);
    // a "new gesture" is a pause since the last event, a reversal in
    // direction, a delta that grew (the user pushed again), or a strong
    // deliberate tick. Anything else is the decaying inertia tail of a
    // trackpad flick and must not fire a second slide — this is what stops
    // fast scrolls from skipping slides. Direction reversal must always
    // count as new, otherwise flicking up right after scrolling down (or
    // vice versa) gets swallowed as "inertia" of the old gesture: the event
    // still gets preventDefault'd but no slide change fires, so the scroll
    // just dies at that point.
    var reversed = lastWheelDelta !== 0 && (e.deltaY > 0) !== (lastWheelDelta > 0);
    var isNewGesture =
      reversed ||
      now - lastWheelTime > 180 ||
      absDelta > Math.abs(lastWheelDelta) + 1 ||
      absDelta >= 60;
    lastWheelTime = now;
    lastWheelDelta = e.deltaY;

    if (!e.deltaY || !heroEngaged()) return;

    var dir = e.deltaY > 0 ? 1 : -1;
    // on the last slide scrolling down (or first scrolling up) the page is
    // released immediately — no held/extra scroll before the next section
    if (atEdge(dir) && !animating) return;

    e.preventDefault();
    e.stopPropagation(); // keep Lenis from smooth-scrolling underneath

    if (animating || !isNewGesture) return;
    goTo(current + dir);
  }
  window.addEventListener('wheel', onWheel, { passive: false, capture: true });

  var touchStartY = null;
  var touchDir = 0;
  var touchConsumed = false;

  window.addEventListener('touchstart', function (e) {
    touchStartY = e.touches[0].clientY;
    touchDir = 0;
    touchConsumed = false;
  }, { passive: true, capture: true });

  window.addEventListener('touchmove', function (e) {
    if (touchStartY === null || !heroEngaged()) return;
    var dy = touchStartY - e.touches[0].clientY; // > 0 = swiping up = next slide
    if (!touchDir) {
      if (Math.abs(dy) < 2) return; // direction not clear yet
      touchDir = dy > 0 ? 1 : -1;
    }
    if (atEdge(touchDir) && !animating) return; // release to normal scrolling

    if (e.cancelable) e.preventDefault();
    e.stopPropagation();

    if (touchConsumed || animating) return;
    if (Math.abs(dy) > 24) {
      touchConsumed = true;
      goTo(current + touchDir);
    }
  }, { passive: false, capture: true });

  window.addEventListener('touchend', function () {
    touchStartY = null;
  }, { passive: true, capture: true });

  window.addEventListener('keydown', function (e) {
    if (!heroEngaged()) return;
    var target = e.target;
    if (target && (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable)) return;

    var dir = 0;
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) dir = 1;
    else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) dir = -1;
    if (!dir) return;

    if (atEdge(dir) && !animating) return;
    e.preventDefault();
    if (!animating) goTo(current + dir);
  });

  // ---------- direct navigation: dots, menu links, deep links ----------

  function openSlide(index) {
    settleToTop();
    if (animating) pendingIndex = index;
    else goTo(index);
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      openSlide(i);
    });
  });

  // deep-link straight to a slide with #slide-2 … #slide-4 — navbar menu
  // links use these hashes too
  window.addEventListener('hashchange', function () {
    var m = location.hash.match(/^#slide-([1-4])$/);
    if (m) openSlide(parseInt(m[1], 10) - 1);
  });

  var match = location.hash.match(/^#slide-([1-4])$/);
  if (match) {
    var index = parseInt(match[1], 10) - 1;
    hero.classList.add('hero--no-anim');
    jumpTo(index);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hero.classList.remove('hero--no-anim');
      });
    });
  } else {
    jumpTo(0);
  }
})();
