// ===== CERTIFICATE MODAL =====
function openCertModal(imgSrc, title) {
    var modal      = document.getElementById('certModal');
    var modalImg   = document.getElementById('certModalImg');
    var modalTitle = document.getElementById('certModalTitle');
    var dlBtn      = document.getElementById('certModalDownload');
    if (!modal || !modalImg || !modalTitle || !dlBtn) return;

    // Derive the correct file extension from the actual src path
    var ext = (imgSrc || '').split('.').pop().split('?')[0] || 'jpg';
    var safeName = (title || 'Certificate').replace(/\s+/g, '_') + '.' + ext;

    modalImg.src           = imgSrc || '';
    modalImg.style.display = imgSrc ? 'block' : 'none';
    modalTitle.textContent = title  || 'Certificate';
    dlBtn.href             = imgSrc || '#';
    dlBtn.setAttribute('download', safeName);

    // Reset inner animation so it replays on every open
    var inner = modal.querySelector('.cert-modal-inner');
    if (inner) {
        inner.style.animation = 'none';
        void inner.offsetHeight;
        inner.style.animation  = '';
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeCertModal() {
    var modal    = document.getElementById('certModal');
    var modalImg = document.getElementById('certModalImg');
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (modalImg) { modalImg.src = ''; modalImg.style.display = ''; }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeCertModal();
});

// ===== CUSTOM MAGNETIC CURSOR =====
(function initCursor() {
    const dot   = document.createElement('div');
    const ring  = document.createElement('div');
    const trail = document.createElement('div');

    dot.id   = 'cursor-dot';
    ring.id  = 'cursor-ring';
    trail.id = 'cursor-trail';

    const style = document.createElement('style');
    style.textContent = `
        /* ---- cursor base ---- */
        *, *::before, *::after { cursor: none !important; }

        #cursor-dot {
            position: fixed; top: 0; left: 0; z-index: 99999;
            width: 8px; height: 8px; border-radius: 50%;
            background: #e6006d;
            pointer-events: none;
            transform: translate(-50%, -50%);
            transition: background 0.2s, transform 0.1s;
            box-shadow: 0 0 12px rgba(230,0,109,0.7);
        }

        #cursor-ring {
            position: fixed; top: 0; left: 0; z-index: 99998;
            width: 36px; height: 36px; border-radius: 50%;
            border: 2px solid rgba(230,0,109,0.55);
            pointer-events: none;
            transform: translate(-50%, -50%);
            transition: width 0.35s cubic-bezier(.16,1,.3,1),
                        height 0.35s cubic-bezier(.16,1,.3,1),
                        border-color 0.3s,
                        background 0.3s,
                        opacity 0.3s;
            backdrop-filter: invert(5%);
        }

        #cursor-trail {
            position: fixed; top: 0; left: 0; z-index: 99997;
            width: 60px; height: 60px; border-radius: 50%;
            background: radial-gradient(circle, rgba(230,0,109,0.07) 0%, transparent 70%);
            pointer-events: none;
            transform: translate(-50%, -50%);
            transition: left 0.55s cubic-bezier(.16,1,.3,1),
                        top  0.55s cubic-bezier(.16,1,.3,1);
        }

        /* hover states */
        body.cursor-hover #cursor-ring {
            width: 58px; height: 58px;
            border-color: rgba(99,13,178,0.5);
            background: rgba(230,0,109,0.06);
        }
        body.cursor-click #cursor-dot {
            transform: translate(-50%, -50%) scale(1.8);
            background: #630db2;
        }
        body.cursor-text #cursor-ring {
            width: 4px; height: 42px; border-radius: 2px;
            border-color: #e6006d;
        }

        /* hide on touch */
        @media (hover: none) {
            #cursor-dot, #cursor-ring, #cursor-trail { display: none !important; }
            *, *::before, *::after { cursor: auto !important; }
        }
    `;
    document.head.appendChild(style);
    document.body.append(dot, ring, trail);

    let mx = -100, my = -100, rx = -100, ry = -100;

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.left   = mx + 'px';
        dot.style.top    = my + 'px';
        trail.style.left = mx + 'px';
        trail.style.top  = my + 'px';
    });

    // smooth ring follow
    (function loopRing() {
        rx += (mx - rx) * 0.14;
        ry += (my - ry) * 0.14;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        requestAnimationFrame(loopRing);
    })();

    // hover / click states
    const hoverTargets = 'a, button, .btn, .servicesItem, .portfolio-box, .bg-icon, .about-btn button, .button, #progress, .fillter-buttons .button, .cert-box, .cert-view-btn, .overlay-btn, .pf-live-btn, .contact-card, .cert-modal-close, .map-directions-btn';
    document.querySelectorAll(hoverTargets).forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
    document.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-text'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-text'));
    });
    document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
    document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));
})();


// ===== BUTTON RIPPLE EFFECT =====
(function initRipple() {
    const style = document.createElement('style');
    style.textContent = `
        .btn, .about-btn button, .button, .cvContent a {
            overflow: hidden;
            position: relative;
        }
        .ripple-wave {
            position: absolute;
            border-radius: 50%;
            background: rgba(255,255,255,0.38);
            transform: scale(0);
            animation: rippleAnim 0.6s linear;
            pointer-events: none;
        }
        @keyframes rippleAnim {
            to { transform: scale(4); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    function attachRipple(el) {
        el.addEventListener('click', function(e) {
            const rect = el.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const r = document.createElement('span');
            r.className = 'ripple-wave';
            r.style.cssText = `
                width:${size}px; height:${size}px;
                left:${e.clientX - rect.left - size/2}px;
                top:${e.clientY - rect.top - size/2}px;
            `;
            el.appendChild(r);
            setTimeout(() => r.remove(), 620);
        });
    }

    document.querySelectorAll('.btn, .about-btn button, .button, .cvContent a, .cert-view-btn, .pf-live-btn, .overlay-btn, .map-directions-btn').forEach(attachRipple);
})();


// ===== PARTICLE DEPTH BACKGROUND =====
(function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'depth-canvas';
    const cs = canvas.style;
    cs.position = 'fixed'; cs.inset = '0';
    cs.width = '100%'; cs.height = '100%';
    cs.zIndex = '0'; cs.pointerEvents = 'none';
    cs.opacity = '0.45';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    const colors = ['rgba(230,0,109,', 'rgba(99,13,178,', 'rgba(160,8,156,'];
    const COUNT = 55;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < COUNT; i++) {
        const depth = 0.2 + Math.random() * 0.8;   // 0.2 = far, 1 = close
        particles.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: depth * 3.5,
            dx: (Math.random() - 0.5) * depth * 0.5,
            dy: (Math.random() - 0.5) * depth * 0.4,
            depth,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 0.08 + depth * 0.25,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.015 + Math.random() * 0.02
        });
    }

    let mouseX = W / 2, mouseY = H / 2;
    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

    function draw() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
            // subtle parallax toward mouse
            const px = p.x + (mouseX - W/2) * p.depth * 0.012;
            const py = p.y + (mouseY - H/2) * p.depth * 0.012;

            p.pulse += p.pulseSpeed;
            const glowR = p.r + Math.sin(p.pulse) * p.r * 0.6;
            const a = p.alpha + Math.sin(p.pulse) * 0.05;

            const grad = ctx.createRadialGradient(px, py, 0, px, py, glowR * 6);
            grad.addColorStop(0, p.color + (a * 1.4) + ')');
            grad.addColorStop(1, p.color + '0)');
            ctx.beginPath();
            ctx.arc(px, py, glowR * 6, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            // connect nearby same-depth particles with faint lines
            particles.forEach(q => {
                if (q === p || Math.abs(q.depth - p.depth) > 0.2) return;
                const qx = q.x + (mouseX - W/2) * q.depth * 0.012;
                const qy = q.y + (mouseY - H/2) * q.depth * 0.012;
                const dist = Math.hypot(px - qx, py - qy);
                if (dist < 130) {
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(qx, qy);
                    ctx.strokeStyle = p.color + (0.06 * (1 - dist / 130)) + ')';
                    ctx.lineWidth = p.depth;
                    ctx.stroke();
                }
            });

            // move
            p.x += p.dx;
            p.y += p.dy;
            if (p.x < -20) p.x = W + 20;
            if (p.x > W + 20) p.x = -20;
            if (p.y < -20) p.y = H + 20;
            if (p.y > H + 20) p.y = -20;
        });
        requestAnimationFrame(draw);
    }
    draw();
})();


// ===== HAMBURGER MENU =====
let menuIcon = document.querySelector(".menu-icon");
let navlist  = document.querySelector(".navlist");

menuIcon.addEventListener("click", () => {
    menuIcon.classList.toggle("active");
    navlist.classList.toggle("active");
    document.body.classList.toggle("open");
});

navlist.addEventListener("click", () => {
    navlist.classList.remove("active");
    menuIcon.classList.remove("active");
    document.body.classList.remove("open");
});


// ===== ROTATE TEXT =====
let text = document.querySelector(".text p");
if (text) {
    text.innerHTML = text.innerHTML.split("").map((char, i) =>
        `<b style="transform:rotate(${i * 6.3}deg)">${char}</b>`
    ).join("");
}


// ===== ABOUT SECTION TAB BUTTONS =====
const buttons  = document.querySelectorAll('.about-btn button');
const contents = document.querySelectorAll('.content');

buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
        contents.forEach(content => {
            content.style.opacity = '0';
            content.style.transform = 'translateY(8px)';
            setTimeout(() => content.style.display = 'none', 180);
        });
        setTimeout(() => {
            contents[index].style.display = 'block';
            requestAnimationFrame(() => {
                contents[index].style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                contents[index].style.opacity = '1';
                contents[index].style.transform = 'translateY(0)';
            });
        }, 200);
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

// init inline styles for smooth tab swap
contents.forEach((c, i) => {
    if (i !== 0) c.style.display = 'none';
    c.style.opacity = '1';
    c.style.transform = 'translateY(0)';
    c.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
});


// ===== PORTFOLIO FILTER =====
if (typeof mixitup !== 'undefined') {
    var mixer = mixitup('.portfolio-gallery', {
        selectors: { target: '.portfolio-box' },
        animation: { duration: 500 }
    });
}


// ===== SWIPER =====
if (typeof Swiper !== 'undefined') {
    var swiper = new Swiper(".mySwiper", {
        slidesPerView: 1,
        spaceBetween: 30,
        pagination: { el: ".swiper-pagination", clickable: true },
        autoplay: { delay: 3000, disableOnInteraction: false },
        breakpoints: {
            576: { slidesPerView: 2, spaceBetween: 10 },
            1200: { slidesPerView: 3, spaceBetween: 20 }
        }
    });
}


// ===== SKILLS PROGRESS BAR =====
const first_skill  = document.querySelector(".skill:first-child");
const sk_counters  = document.querySelectorAll(".counter span");
const progress_bars = document.querySelectorAll(".skills svg circle");
let skillsPlayed   = false;

window.addEventListener("scroll", () => { if (!skillsPlayed) skillsCounter(); });

function hasReached(el) {
    let topPosition = el.getBoundingClientRect().top;
    return window.innerHeight >= topPosition + el.offsetHeight;
}

function updateCount(num, maxNum) {
    let currentNum = +num.innerText;
    if (currentNum < maxNum) {
        num.innerText = currentNum + 1;
        setTimeout(() => updateCount(num, maxNum), 12);
    }
}

function skillsCounter() {
    if (!first_skill || !hasReached(first_skill)) return;
    skillsPlayed = true;

    sk_counters.forEach((counter, i) => {
        let target = +counter.dataset.target;
        let strokeValue = 465 - 465 * (target / 100);
        if (progress_bars[i]) {
            progress_bars[i].style.setProperty("--target", strokeValue);
        }
        setTimeout(() => updateCount(counter, target), 400);
    });
    progress_bars.forEach(p => p.style.animation = "progress 2s ease-in-out forwards");
}


// ===== SCROLL PROGRESS BUTTON =====
let scrollProgress = document.getElementById("progress");

let calcScrollValue = () => {
    if (!scrollProgress) return;
    let pos        = document.documentElement.scrollTop;
    let calcHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let scrollValue = Math.round((pos * 100) / calcHeight);
    scrollProgress.style.display = pos > 100 ? "grid" : "none";
    scrollProgress.style.background = `conic-gradient(#fff ${scrollValue}%, #e6006d ${scrollValue}%)`;
};

if (scrollProgress) {
    scrollProgress.addEventListener("click", () => {
        document.documentElement.scrollTop = 0;
    });
}
window.onscroll = calcScrollValue;
window.onload   = calcScrollValue;


// ===== ACTIVE NAV MENU ON SCROLL =====
let menuLi  = document.querySelectorAll("header ul li a");
let section = document.querySelectorAll('section');

function activeMenu() {
    let len = section.length;
    while (--len && window.scrollY + 97 < section[len].offsetTop) {}
    menuLi.forEach(sec => sec.classList.remove("active"));
    if (menuLi[len]) menuLi[len].classList.add("active");
}
activeMenu();
window.addEventListener("scroll", activeMenu);


// ===== HEADER SCROLL DEPTH SHADOW =====
(function headerShadow() {
    const header = document.querySelector('header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            header.style.boxShadow = '0 8px 32px rgba(230,0,109,0.1), 0 2px 8px rgba(0,0,0,0.05)';
        } else {
            header.style.boxShadow = '';
        }
    });
})();


// ===== SCROLL REVEAL =====
if (typeof ScrollReveal !== 'undefined') {
    ScrollReveal({
        distance: "60px",
        duration: 1600,
        delay: 100,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        reset: false
    });

    ScrollReveal().reveal('.hero-info, .main-text, .proposal, .heading',   { origin: "top" });
    ScrollReveal().reveal('.about-img, .fillter-buttons, .contact-info',   { origin: "left" });
    ScrollReveal().reveal('.about-content, .skills',                       { origin: "right" });
    ScrollReveal().reveal('.allServices, .portfolio-gallery, .blog-box, footer, .img-hero', {
        origin: "bottom", interval: 100
    });
    ScrollReveal().reveal('.servicesItem', { origin: "bottom", interval: 120 });
    ScrollReveal().reveal('.skill',        { origin: "bottom", interval: 80  });
    ScrollReveal().reveal('.text-box',     { origin: "right",  interval: 100 });

    // New sections
    ScrollReveal().reveal('.cert-box',     { origin: "bottom", interval: 150, distance: "50px" });
    ScrollReveal().reveal('.contact-card', { origin: "left",   interval: 80  });
    ScrollReveal().reveal('.contact-map',  { origin: "right",  delay: 200    });
}


// ===== SECTION ENTRANCE DEPTH FADE =====
// Adds depth z-scale on scroll entrance for every section
(function sectionDepth() {
    const style = document.createElement('style');
    style.textContent = `
        section {
            transition: filter 0.6s ease, opacity 0.6s ease;
        }
        section.depth-hidden {
            opacity: 0;
            filter: blur(4px) brightness(0.95);
        }
        section.depth-visible {
            opacity: 1;
            filter: none;
        }
    `;
    document.head.appendChild(style);

    const sections = document.querySelectorAll('section');
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.remove('depth-hidden');
                e.target.classList.add('depth-visible');
            }
        });
    }, { threshold: 0.08 });

    sections.forEach(s => {
        s.classList.add('depth-hidden');
        io.observe(s);
    });
})();


// ===== 3D DEPTH TILT — SERVICE CARDS =====
document.querySelectorAll('.servicesItem').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform   = `translateY(-10px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) scale(1.02)`;
        card.style.boxShadow   = `${x * -18}px ${y * -18}px 40px rgba(230,0,109,0.22), 0 20px 60px rgba(99,13,178,0.14)`;
        card.style.transition  = 'transform 0.1s ease, box-shadow 0.1s ease';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform  = '';
        card.style.boxShadow  = '';
        card.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease';
    });
});


// ===== 3D DEPTH TILT — PORTFOLIO CARDS =====
document.querySelectorAll('.portfolio-box').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform  = `translateY(-10px) scale(1.02) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
        card.style.boxShadow  = `${x * -14}px ${y * -14}px 30px rgba(230,0,109,0.18)`;
        card.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform  = '';
        card.style.boxShadow  = '';
        card.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
    });
});


// ===== SOCIAL ICON BOUNCE + GLOW ON HOVER =====
(function socialHover() {
    const style = document.createElement('style');
    style.textContent = `
        .bg-icon {
            transition: transform 0.3s cubic-bezier(.16,1,.3,1), box-shadow 0.3s ease !important;
        }
        .bg-icon:hover {
            transform: translateY(-6px) scale(1.12) !important;
            box-shadow: 0 8px 28px rgba(230,0,109,0.35) !important;
        }
        .bg-icon:active {
            transform: translateY(-2px) scale(1.04) !important;
        }
    `;
    document.head.appendChild(style);
})();


// ===== NAV LINK MAGNETIC HOVER =====
document.querySelectorAll('.navlist li a').forEach(link => {
    link.addEventListener('mousemove', e => {
        const rect = link.getBoundingClientRect();
        const dx = (e.clientX - rect.left - rect.width  / 2) * 0.3;
        const dy = (e.clientY - rect.top  - rect.height / 2) * 0.3;
        link.style.transform  = `translate(${dx}px, ${dy}px)`;
        link.style.transition = 'transform 0.1s ease';
    });
    link.addEventListener('mouseleave', () => {
        link.style.transform  = '';
        link.style.transition = 'transform 0.4s cubic-bezier(.16,1,.3,1)';
    });
});


// ===== GLOWING TEXT-BOX HOVER =====
(function textBoxHover() {
    const style = document.createElement('style');
    style.textContent = `
        .text-box {
            transition: transform 0.3s cubic-bezier(.16,1,.3,1),
                        box-shadow 0.3s ease,
                        border-color 0.3s ease !important;
        }
        .text-box:hover {
            transform: translateX(6px) translateY(-3px) !important;
            box-shadow: -4px 4px 24px rgba(230,0,109,0.18),
                         0 8px 32px rgba(99,13,178,0.1) !important;
        }
    `;
    document.head.appendChild(style);
})();


// ===== HERO IMAGE PARALLAX ON SCROLL =====
(function heroParallax() {
    const hero = document.querySelector('.img-hero');
    if (!hero) return;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        hero.style.transform = `translateY(${y * 0.08}px)`;
    });
})();


// ===== SMOOTH COUNT-UP FOR NUMBERS (if any stat numbers exist) =====
(function countUpStats() {
    const style = document.createElement('style');
    style.textContent = `
        .stat-number {
            display: inline-block;
            font-variant-numeric: tabular-nums;
        }
    `;
    document.head.appendChild(style);
})();


// ===== TYPING CURSOR BLINK FIX =====
document.addEventListener('visibilitychange', () => {
    const el = document.querySelector('.typing-text');
    if (el && !document.hidden) {
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = '';
    }
});


// ===== CONTACT FORM VALIDATION + WHATSAPP SEND =====
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contactform");
    if (!form) return;

    // Live input floating label + valid state
    form.querySelectorAll('input, textarea').forEach(field => {
        field.addEventListener('input', () => {
            if (field.value.trim()) {
                field.classList.add('has-value');
                field.classList.remove('field-error');
            } else {
                field.classList.remove('has-value');
            }
        });
        field.addEventListener('focus', () => field.classList.add('field-focus'));
        field.addEventListener('blur',  () => field.classList.remove('field-focus'));
    });

    // Inline field styles
    const fStyle = document.createElement('style');
    fStyle.textContent = `
        #contactform input,
        #contactform textarea {
            transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
        }
        #contactform input.field-focus,
        #contactform textarea.field-focus {
            border-color: #e6006d !important;
            box-shadow: 0 0 0 3px rgba(230,0,109,0.12) !important;
            transform: translateY(-1px);
        }
        #contactform input.field-error,
        #contactform textarea.field-error {
            border-color: #e6006d !important;
            box-shadow: 0 0 0 3px rgba(230,0,109,0.18), 0 0 12px rgba(230,0,109,0.15) !important;
            animation: shakeField 0.4s ease;
        }
        @keyframes shakeField {
            0%,100% { transform: translateX(0); }
            20%     { transform: translateX(-6px); }
            40%     { transform: translateX(6px); }
            60%     { transform: translateX(-4px); }
            80%     { transform: translateX(4px); }
        }
        #contactform input.field-valid,
        #contactform textarea.field-valid {
            border-color: #1D9E75 !important;
            box-shadow: 0 0 0 2px rgba(29,158,117,0.12) !important;
        }
    `;
    document.head.appendChild(fStyle);

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const firstName = document.getElementById("firstName");
        const lastName  = document.getElementById("lastName");
        const email     = document.getElementById("email");
        const subject   = document.getElementById("subject");
        const message   = document.getElementById("message");

        const fields = [firstName, lastName, email, subject, message];
        let valid = true;

        // reset
        fields.forEach(f => { f.classList.remove('field-error', 'field-valid'); });

        // validate each
        fields.forEach(f => {
            if (!f.value.trim()) {
                f.classList.add('field-error');
                valid = false;
            }
        });

        if (!valid) {
            showFormAlert("Please fill all fields", "error");
            return;
        }

        const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,}$/;
        if (!email.value.trim().match(emailPattern)) {
            email.classList.add('field-error');
            showFormAlert("Enter a valid email address", "error");
            return;
        }

        // mark all valid
        fields.forEach(f => { f.classList.add('field-valid'); });

        const phoneNumber   = "919789714637";
        const wMsg = `Hello,%0AName: ${firstName.value.trim()} ${lastName.value.trim()}%0AEmail: ${email.value.trim()}%0ASubject: ${subject.value.trim()}%0AMessage: ${message.value.trim()}`;
        const url  = `https://wa.me/${phoneNumber}?text=${wMsg}`;
        window.open(url, "_blank");

        showFormAlert("Opening WhatsApp... ✓", "success");
        setTimeout(() => form.reset(), 1800);
    });
});

// ===== FORM ALERT TOAST =====
function showFormAlert(msg, type) {
    let existing = document.querySelector('.form-alert');
    if (existing) existing.remove();

    let alertEl = document.createElement('div');
    alertEl.className = 'form-alert';
    alertEl.textContent = msg;
    alertEl.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${type === 'error' ? 'linear-gradient(135deg,#e6006d,#630db2)' : 'linear-gradient(135deg,#1D9E75,#0d7a5a)'};
        color: #fff;
        padding: 13px 22px;
        border-radius: 12px;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 0.9rem;
        font-weight: 600;
        z-index: 9999;
        box-shadow: 0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1);
        animation: toastIn 0.35s cubic-bezier(.16,1,.3,1) forwards;
        max-width: 280px;
        line-height: 1.4;
    `;

    if (!document.getElementById('alert-style')) {
        let s = document.createElement('style');
        s.id = 'alert-style';
        s.textContent = `
            @keyframes toastIn {
                from { opacity:0; transform: translateX(80px) scale(0.92); }
                to   { opacity:1; transform: translateX(0)    scale(1);    }
            }
            @keyframes toastOut {
                from { opacity:1; transform: translateX(0)    scale(1);    }
                to   { opacity:0; transform: translateX(80px) scale(0.92); }
            }
        `;
        document.head.appendChild(s);
    }

    document.body.appendChild(alertEl);
    setTimeout(() => {
        alertEl.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => alertEl.remove(), 320);
    }, 3500);
}

// ===== CERTIFICATE MODAL — wired at top of file =====


// ===== 3D TILT — CERTIFICATE BOXES =====
document.querySelectorAll('.cert-box').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        const inner = card.querySelector('.cert-inner');
        if (inner) {
            inner.style.transform  = `translateY(-8px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg) scale(1.02)`;
            inner.style.boxShadow  = `${x * -20}px ${y * -20}px 50px rgba(230,0,109,0.2), 0 24px 64px rgba(99,13,178,0.14)`;
            inner.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
        }
    });
    card.addEventListener('mouseleave', () => {
        const inner = card.querySelector('.cert-inner');
        if (inner) {
            inner.style.transform  = '';
            inner.style.boxShadow  = '';
            inner.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease';
        }
    });
});


// ===== CONTACT INPUT FLOATING LABEL (has-value tracker) =====
(function floatingLabels() {
    document.querySelectorAll('#contactform input, #contactform textarea').forEach(field => {
        const checkValue = () => {
            if (field.value.trim()) {
                field.classList.add('has-value');
            } else {
                field.classList.remove('has-value');
            }
        };
        field.addEventListener('input', checkValue);
        field.addEventListener('blur', checkValue);
        checkValue(); // init on load
    });
})();


// ===== CONTACT CARD RIPPLE =====
(function contactCardRipple() {
    document.querySelectorAll('.contact-card').forEach(card => {
        card.addEventListener('click', function(e) {
            const rect = card.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const r = document.createElement('span');
            r.style.cssText = `
                position:absolute; border-radius:50%;
                background:rgba(230,0,109,0.15);
                width:${size}px; height:${size}px;
                left:${e.clientX - rect.left - size/2}px;
                top:${e.clientY - rect.top - size/2}px;
                transform:scale(0); animation:rippleAnim 0.5s linear;
                pointer-events:none;
            `;
            card.style.position = 'relative';
            card.style.overflow = 'hidden';
            card.appendChild(r);
            setTimeout(() => r.remove(), 520);
        });
    });
})();


// Portfolio filter already initialized above

// ===== CERT MODAL — backdrop + X button close =====
(function wireCertModalClose() {
    var modal = document.getElementById('certModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeCertModal();
        });
    }
    var xBtn = document.getElementById('certModalClose');
    if (xBtn) xBtn.addEventListener('click', closeCertModal);
})();