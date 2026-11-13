/* Mansoor Mehmood — Portfolio interactions (vanilla, no dependencies) */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Email (assembled at runtime to deter scrapers) ---------- */
  var EMAIL = ['mansoormehmood65', 'gmail.com'].join('@');
  $$('.js-mail').forEach(function (a) {
    a.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Hello Mansoor');
  });
  $$('.js-mail-text').forEach(function (el) { el.textContent = EMAIL; });

  /* ---------- Toast ---------- */
  var toast = $('.toast'), toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }

  var copyBtn = $('.copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var done = function () { showToast('Email copied to clipboard'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(EMAIL).then(done, function () { fallbackCopy(); done(); });
      } else { fallbackCopy(); done(); }
    });
  }
  function fallbackCopy() {
    var t = document.createElement('textarea');
    t.value = EMAIL; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(t);
  }

  /* ---------- Theme toggle ---------- */
  var themeBtn = $('.theme-toggle');
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('mm-theme', t); } catch (e) {}
    if (themeBtn) themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  if (themeBtn) {
    themeBtn.setAttribute('aria-label', root.getAttribute('data-theme') === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    themeBtn.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---------- Nav: scrolled state + progress bar ---------- */
  var nav = $('.nav'), bar = $('.progress'), ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    nav.classList.toggle('is-scrolled', y > 20);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.setProperty('--p', h > 0 ? Math.min(y / h, 1) : 0);
    updateHighlight();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('.menu-btn'), menu = $('#mobile-menu');
  function closeMenu() {
    document.body.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      var open = !document.body.classList.contains('menu-open');
      if (!open) return closeMenu();
      document.body.classList.add('menu-open');
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.setAttribute('aria-label', 'Close menu');
      menu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1080) closeMenu(); });
  }

  /* ---------- Active nav link ---------- */
  var links = $$('.nav-links a');
  var sections = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealables = $$('[data-reveal], .tile-problems');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Counters ---------- */
  var counters = $$('[data-count]');
  function runCounter(el) {
    var end = parseInt(el.getAttribute('data-count'), 10), start = null, dur = 1600;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(end * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reduceMotion) {
    counters.forEach(function (el) { el.textContent = '0'; });
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCounter(en.target); co.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------- Scroll-lit statement (word by word) ---------- */
  var statement = $('[data-highlight]'), words = [];
  if (statement && !reduceMotion) {
    var text = statement.textContent.trim().replace(/\s+/g, ' ');
    statement.textContent = '';
    text.split(' ').forEach(function (w, i, arr) {
      var s = document.createElement('span');
      s.className = 'dim';
      s.textContent = w;
      statement.appendChild(s);
      if (i < arr.length - 1) statement.appendChild(document.createTextNode(' '));
      words.push(s);
    });
  }
  function updateHighlight() {
    if (!words.length) return;
    var r = statement.getBoundingClientRect(), vh = window.innerHeight;
    var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
    var lit = Math.round(Math.max(0, Math.min(1, p)) * words.length);
    for (var i = 0; i < words.length; i++) {
      var on = i < lit;
      if (words[i]._on !== on) { words[i].classList.toggle('dim', !on); words[i]._on = on; }
    }
  }

  /* ---------- Marquee: duplicate content for a seamless loop ---------- */
  var track = $('.marquee-track');
  if (track && track.children.length === 1) {
    var clone = track.children[0].cloneNode(true);
    track.appendChild(clone);
  }

  /* ---------- Hero spotlight + portrait tilt ---------- */
  var hero = $('.hero'), portrait = $('.portrait');
  if (hero && finePointer && !reduceMotion) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--x', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--y', (e.clientY - r.top) + 'px');
      if (portrait) {
        var pr = portrait.getBoundingClientRect();
        var dx = (e.clientX - (pr.left + pr.width / 2)) / window.innerWidth;
        var dy = (e.clientY - (pr.top + pr.height / 2)) / window.innerHeight;
        portrait.style.setProperty('--ry', (dx * 10).toFixed(2) + 'deg');
        portrait.style.setProperty('--rx', (-dy * 10).toFixed(2) + 'deg');
      }
    });
    hero.addEventListener('pointerleave', function () {
      if (portrait) { portrait.style.setProperty('--rx', '0deg'); portrait.style.setProperty('--ry', '0deg'); }
    });
  }

  /* ---------- Card glow follows pointer ---------- */
  if (finePointer) {
    $$('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18;
        var y = (e.clientY - r.top - r.height / 2) * 0.28;
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- Process tabs ---------- */
  var tabs = $$('.tab'), pill = $('.tab-pill');
  function movePill(tab) {
    if (!pill || !tab) return;
    pill.style.width = tab.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + (tab.offsetLeft - 5) + 'px)';
  }
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) {
        panel.hidden = !on;
        if (on) {
          $$('.step', panel).forEach(function (s, i) {
            s.classList.remove('in');
            s.style.opacity = reduceMotion ? '' : '0';
            s.style.transform = reduceMotion ? '' : 'translateY(16px)';
            s.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1)';
            s.style.transitionDelay = (i * 0.07) + 's';
            requestAnimationFrame(function () {
              requestAnimationFrame(function () { s.style.opacity = '1'; s.style.transform = 'none'; s.classList.add('in'); });
            });
          });
        }
      }
    });
    movePill(tab);
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectTab(t); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        n.focus(); selectTab(n);
      }
    });
  });
  function initPill() { movePill($('.tab[aria-selected="true"]')); }
  window.addEventListener('resize', initPill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(initPill);
  initPill();

  /* ---------- Experience accordion ---------- */
  $$('.role-head').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  /* ---------- Local time in Islamabad ---------- */
  var clock = $('.local-time');
  function tick() {
    if (!clock) return;
    try {
      clock.textContent = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Karachi'
      }).format(new Date()) + ' PKT';
    } catch (e) { clock.textContent = 'GMT+5'; }
  }
  tick(); setInterval(tick, 30000);

  /* ---------- Footer year ---------- */
  var yr = $('.year'); if (yr) yr.textContent = new Date().getFullYear();

  onScroll();
})();
