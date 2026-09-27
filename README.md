# Keeran R — Portfolio Website

Personal portfolio site for Keeran R (full-stack developer & web designer, Tamil Nadu, India). Static HTML/CSS/JS — no framework, no build step.

## Getting started

```bash
npm install
npm run dev
```

This starts a local static server at **http://localhost:3000**. A local server is required (not just double-clicking `index.html`) because the navbar, footer and floating action button are loaded at runtime via `fetch('/navbar.html')`, `fetch('/footer.html')`, `fetch('/fab.html')`, which browsers block on `file://` pages.

`npm start` runs the same server, for a non-"dev" alias.

## Project structure

```
index.html              Home page
contact/index.html      Contact page
blog/                   Blog index + posts
work/                   Work / projects page
navbar.html, footer.html, fab.html   Fragments injected into every page by JS
assets/css/             style.css (shared) + per-page stylesheets
assets/js/              One file per concern (navbar, footer, reveal-on-scroll, etc.)
assets/images/, assets/videos/   Media
```

Pages are plain HTML and link to each other with root-relative paths (`/contact/`, `/assets/css/style.css`, …), so they need to be served from the project root — which `npm run dev` does.

## Contact forms → WhatsApp

Both contact forms — the short one on the home page (`#contact`) and the full one on `/contact` — are wired up in **`assets/js/contact-whatsapp.js`**. On submit, it:

1. Reads the name, email, phone and message fields.
2. Builds a pre-filled WhatsApp message and opens `https://wa.me/<number>?text=...` in a new tab, so WhatsApp opens with the message already typed in and ready to send.
3. If the form has a real `action` URL configured (the `/contact` page currently posts to a lead-capture endpoint), that submission still fires quietly in the background via `navigator.sendBeacon`, so existing lead tracking keeps working alongside the WhatsApp handoff. The home page form has no `action` configured, so it skips this step.

**Heads-up on "automatic":** a plain website can't silently push a message into WhatsApp on someone's behalf — there's no public API for that without WhatsApp Business API credentials running on a server. What's implemented here is the standard, zero-setup approach freelancer/portfolio sites use: the message is pre-filled and WhatsApp is opened for the visitor, who only needs to tap **Send**. If genuine server-side auto-sending (no tap required) is needed, that requires a WhatsApp Business API account (e.g. via Meta or Twilio) and a small backend — happy to help wire that up if you get access to it.

To change the destination number, edit `WHATSAPP_NUMBER` at the top of `assets/js/contact-whatsapp.js` (currently `919789714637`, i.e. +91 97897 14637 — the same number already used in the header CTA and the contact page's WhatsApp link).

## Notes

- No bundler/framework is used on purpose — every page is self-contained HTML that pulls in shared CSS/JS.
- `assets/videos/` is large (project preview clips on the Work page); keep that in mind if you add more.
