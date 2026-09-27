// contact-whatsapp.js
//
// Wires up every contact form on the site (home page "#contact" + the
// dedicated /contact page) so that submitting the form builds a pre-filled
// WhatsApp message from the visitor's details and opens WhatsApp with it,
// ready to send.
//
// Note on "automatic": a browser page can't push a WhatsApp message on its
// own — WhatsApp has no public API for that without WhatsApp Business API
// credentials on a server. What this does is the standard, zero-setup
// alternative: it builds the wa.me link and opens it for the visitor, so
// WhatsApp opens with the message already typed in and only needs one tap
// to send.
//
// If a form has a real `action` URL configured (the /contact page currently
// posts to a lead-capture endpoint), that submission still happens quietly
// in the background via navigator.sendBeacon, so existing lead tracking
// keeps working alongside the WhatsApp handoff.

(function () {
  var WHATSAPP_NUMBER = '919789714637'; // Keeran's number, no "+" or spaces

  function buildMessage(fields) {
    var lines = [
      'Hi Keeran! I\'m ' + fields.name + ' and I\'d like to get in touch.',
      '',
      fields.message,
      '',
      'Email: ' + fields.email,
      'Phone: ' + fields.phone
    ];
    return lines.join('\n');
  }

  function setStatus(form, text, tone) {
    var status = form.querySelector('.contact__status');
    if (!status) return;
    status.textContent = text;
    status.dataset.tone = tone || 'info';
  }

  function sendLeadInBackground(form, data) {
    var action = form.getAttribute('action');
    if (!action) return; // homepage form has no endpoint configured yet

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(action, data);
      } else {
        fetch(action, { method: form.method || 'POST', body: data, mode: 'no-cors', keepalive: true }).catch(function () {});
      }
    } catch (err) {
      // Lead capture is a bonus on top of WhatsApp, never block on it.
    }
  }

  function handleSubmit(event) {
    var form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    if (!form.matches('.contact__form, .contactpage__form')) return;

    event.preventDefault();

    var data = new FormData(form);
    var fields = {
      name: (data.get('name') || '').toString().trim(),
      email: (data.get('custom_email') || '').toString().trim(),
      phone: (data.get('number') || '').toString().trim(),
      message: (data.get('remarks') || '').toString().trim()
    };

    sendLeadInBackground(form, data);

    var waUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(buildMessage(fields));

    setStatus(form, 'Opening WhatsApp with your message ready to send…', 'info');

    var newTab = window.open(waUrl, '_blank', 'noopener');

    if (!newTab) {
      // Popup blocked (rare, since this runs inside the submit click) —
      // fall back to sending WhatsApp the message in the same tab.
      window.location.href = waUrl;
      return;
    }

    setStatus(form, 'WhatsApp is open in a new tab — hit send there and I\'ll get it! 🎉', 'success');
    form.reset();
  }

  document.addEventListener('submit', handleSubmit);
})();
