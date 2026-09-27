// Tech-stack ticker: clones each row so the CSS scroll animation (translateX
// -50%) loops seamlessly, then hides the clone from assistive tech.
(function () {
  var tracks = document.querySelectorAll('.about__ticker-track');
  Array.prototype.forEach.call(tracks, function (track) {
    var row = track.querySelector('.about__ticker-row');
    if (!row) return;
    var clone = row.cloneNode(true);
    clone.classList.add('about__ticker-row--clone');
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
})();
