// Loads footer.html into the #footer placeholder, then wires up its interactive bits.
(function () {
  var mount = document.getElementById('footer');
  if (!mount) return;

  fetch('/footer.html')
    .then(function (res) { return res.text(); })
    .then(function (html) {
      mount.innerHTML = html;
      init();
    })
    .catch(function (err) {
      console.error('Could not load footer.html — run the site from a local server.', err);
    });

  function init() {
    if (window.revealScan) window.revealScan(mount);
    initEmailCopy();
    initScrollButton();
    initEyes();
  }

  function initEmailCopy() {
    var emailBtns = document.querySelectorAll('.qftr__bar-email');

    emailBtns.forEach(function (emailBtn) {
      emailBtn.addEventListener('click', function () {
        var email = emailBtn.getAttribute('data-email');

        var fallbackCopy = function () {
          var input = document.createElement('input');
          input.value = email;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).catch(fallbackCopy);
        } else {
          fallbackCopy();
        }

        emailBtn.classList.add('is-copied');
        clearTimeout(emailBtn._copiedTimer);
        emailBtn._copiedTimer = setTimeout(function () {
          emailBtn.classList.remove('is-copied');
        }, 1600);
      });
    });
  }

  function initScrollButton() {
    var scrollBtn = document.getElementById('qftrScrollBtn');
    if (!scrollBtn) return;

    scrollBtn.addEventListener('click', function () {
      if (window.lenis) {
        window.lenis.scrollTo(0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  function initEyes() {
    var eyes = Array.prototype.slice.call(document.querySelectorAll('[data-eye]'));
    if (!eyes.length) return;

    function pupilFor(eye) {
      return eye.querySelector('[data-pupil]');
    }

    function look(clientX, clientY) {
      eyes.forEach(function (eye) {
        var pupil = pupilFor(eye);
        if (!pupil) return;

        var rect = eye.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = clientX - cx;
        var dy = clientY - cy;
        var angle = Math.atan2(dy, dx);

        var maxX = (rect.width - pupil.offsetWidth) / 2 - 4;
        var maxY = (rect.height - pupil.offsetHeight) / 2 - 4;
        var reach = Math.min(1, Math.hypot(dx, dy) / 260);

        var px = Math.cos(angle) * maxX * reach;
        var py = Math.sin(angle) * maxY * reach;

        pupil.style.transform = 'translate(' + px + 'px, ' + py + 'px)';
      });
    }

    var hasFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

    if (hasFinePointer) {
      document.addEventListener('mousemove', function (e) {
        look(e.clientX, e.clientY);
      });
    } else {
      // touch devices: gentle idle left-right glance
      var t = 0;
      setInterval(function () {
        t += 0.05;
        var eye = eyes[0];
        var rect = eye.getBoundingClientRect();
        var cx = rect.left + rect.width / 2 + Math.sin(t) * 400;
        var cy = rect.top + rect.height / 2;
        look(cx, cy);
      }, 60);

      document.addEventListener('touchmove', function (e) {
        var touch = e.touches[0];
        if (touch) look(touch.clientX, touch.clientY);
      }, { passive: true });
    }
  }
})();
