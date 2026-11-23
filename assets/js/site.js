/* Fade sections in as they scroll into view, using the stylesheet's
   .reveal / .in-view rules. Skipped for reduced motion and old browsers,
   and it does nothing unless the stylesheet can reveal content. */
(function(){
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Make sure the stylesheet can show a revealed element before hiding anything
  // (guards against a stale or missing stylesheet).
  var probe = document.createElement('div');
  probe.className = 'reveal in-view';
  probe.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px';
  document.body.appendChild(probe);
  var ok = parseFloat(getComputedStyle(probe).opacity) > 0.5;
  probe.parentNode.removeChild(probe);
  if (!ok) return;

  var small = window.matchMedia && window.matchMedia('(max-width: 760px)').matches;
  var targets = [];
  var sections = document.querySelectorAll('main > section');
  for (var i = 1; i < sections.length; i++) {   // skip the page header
    var box = sections[i].querySelector('.container') || sections[i];
    Array.prototype.forEach.call(box.children, function(el){
      var cs = getComputedStyle(el);
      if (cs.display === 'none') return;
      var isGrid = el.tagName !== 'FORM' && (cs.display === 'grid' || cs.display === 'flex') && el.children.length >= 3;
      if (isGrid) {
        Array.prototype.forEach.call(el.children, function(child, n){
          if (!small) child.style.transitionDelay = Math.min(n, 3) * 60 + 'ms';
          targets.push(child);
        });
      } else {
        targets.push(el);
      }
    });
  }
  if (!targets.length) return;

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { rootMargin: small ? '0px 0px 15% 0px' : '0px 0px 8% 0px' });

  targets.forEach(function(el){ el.classList.add('reveal'); io.observe(el); });

})();

/* Savings calculator: 30% recruiter fee vs typical Crafted cost (about 85% less). */
(function(){
  var range = document.getElementById('calc-salary');
  if (!range) return;
  var hires = document.getElementById('calc-hires');
  var fmt = function(n){ return '$' + Math.round(n).toLocaleString('en-US'); };
  var tracked = false;
  function update(){
    var n = Math.min(50, Math.max(1, parseInt(hires.value, 10) || 1));
    var fee = range.value * 0.30 * n;
    var crafted = fee * 0.15;
    document.getElementById('calc-salary-out').textContent = fmt(range.value);
    document.getElementById('calc-recruiter').textContent = fmt(fee);
    document.getElementById('calc-crafted').textContent = fmt(crafted);
    document.getElementById('calc-save').textContent = fmt(fee - crafted);
  }
  function used(){ if (!tracked && window.gtag) { gtag('event', 'calculator_used'); tracked = true; } update(); }
  range.addEventListener('input', used);
  hires.addEventListener('input', used);
  hires.addEventListener('blur', function(){ hires.value = Math.min(50, Math.max(1, parseInt(hires.value, 10) || 1)); update(); });
  Array.prototype.forEach.call(document.querySelectorAll('.calc-step'), function(b){
    b.addEventListener('click', function(){ hires.value = Math.min(50, Math.max(1, (parseInt(hires.value, 10) || 1) + parseInt(b.dataset.step, 10))); used(); });
  });
  var cta = document.querySelector('.calc-cta');
  if (cta) cta.addEventListener('click', function(){ if (window.gtag) gtag('event', 'calculator_cta_click'); });
  update();
})();

/* Reviews carousel: pages of 3 (desktop), 2 (tablet), 1 (phone). Auto-advances; pauses on hover. */
(function(){
  var track = document.querySelector('.rv-track'); if (!track) return;
  var cards = track.children, dotsWrap = document.querySelector('.rv-dots'), page = 0, timer = null;
  function per(){ return window.innerWidth < 641 ? 1 : window.innerWidth < 900 ? 2 : 3; }
  function pages(){ return Math.ceil(cards.length / per()); }
  function draw(){
    var n = pages(); page = Math.min(page, n - 1);
    var card = cards[page * per()];
    track.style.transform = 'translateX(' + (-(card ? card.offsetLeft : 0)) + 'px)';
    if (dotsWrap.children.length !== n) {
      dotsWrap.innerHTML = '';
      for (var d = 0; d < n; d++) (function(i){
        var b = document.createElement('button'); b.type = 'button'; b.className = 'rv-dot';
        b.setAttribute('aria-label', 'Show reviews page ' + (i + 1));
        b.addEventListener('click', function(){ page = i; draw(); restart(); });
        dotsWrap.appendChild(b);
      })(d);
    }
    Array.prototype.forEach.call(dotsWrap.children, function(b, i){ b.classList.toggle('is-active', i === page); });
  }
  function go(step){ var n = pages(); page = (page + step + n) % n; draw(); }
  function restart(){
    if (timer) clearInterval(timer);
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer = setInterval(function(){ go(1); }, 8000);
  }
  Array.prototype.forEach.call(document.querySelectorAll('.rv-arrow'), function(a){
    a.addEventListener('click', function(){ go(parseInt(a.dataset.dir, 10)); restart(); });
  });
  var sec = track.closest('section');
  sec.addEventListener('mouseenter', function(){ if (timer) clearInterval(timer); });
  sec.addEventListener('mouseleave', restart);
  window.addEventListener('resize', draw);
  draw(); restart();
})();

/* Gut check: count taps, warm up the CTA at 2+, and carry picks into the homepage contact form. */
(function(){
  var boxes = document.querySelectorAll('.fit-cb'); if (!boxes.length) return;
  var count = document.getElementById('fit-count'), msg = document.getElementById('fit-msg'), foot = document.querySelector('.fit-foot'), cta = document.getElementById('fit-cta');
  var base = ' \u00b7 If two or more hit home, you\u2019re exactly who we built this for.';
  function picked(){ return Array.prototype.filter.call(boxes, function(b){ return b.checked; }).map(function(b){ return b.value; }); }
  function update(){
    var n = picked().length;
    count.textContent = n + ' of ' + boxes.length;
    msg.lastChild.nodeValue = n >= 2 ? ' \u00b7 Sounds like we should talk.' : base;
    foot.classList.toggle('is-hot', n >= 2);
  }
  Array.prototype.forEach.call(boxes, function(b){ b.addEventListener('change', update); });
  cta.addEventListener('click', function(){
    var p = picked(), box = document.getElementById('cf-message');
    if (p.length && box && !box.value) box.value = 'From the gut check:\n- ' + p.join('\n- ');
    if (window.gtag) gtag('event', 'gutcheck_cta', { checked: p.length });
  });
  update();
})();

// Phone link clicks (counted as leads in Google Ads)
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('a[href^="tel:"]');
  if (!a || !window.gtag) return;
  var where = a.getAttribute('data-phone') || (a.closest('.m-bar') ? 'mobile-bar' : a.closest('footer') ? 'footer' : a.closest('.nav-drawer') ? 'mobile-menu' : 'page');
  gtag('event', 'phone_click', { location: where });
});

// Booking: Calendly opens in a popup on the page, so we can tell when a call is
// actually scheduled. Clicks send calendly_click (kept for history) and book_call_click;
// a finished booking sends book_call. If Calendly's script hasn't loaded, the link
// opens in a new tab as before.
(function(){
  var ready = false, loading = false, lastWhere = 'unknown';
  function load(){
    if (loading) return; loading = true;
    var css = document.createElement('link'); css.rel = 'stylesheet';
    css.href = 'https://assets.calendly.com/assets/external/widget.css';
    document.head.appendChild(css);
    var js = document.createElement('script'); js.async = true;
    js.src = 'https://assets.calendly.com/assets/external/widget.js';
    js.onload = function(){ ready = !!(window.Calendly && Calendly.initPopupWidget); };
    document.head.appendChild(js);
  }
  // Load once the page is idle, or as soon as someone heads for a booking link.
  if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 4000 }); else setTimeout(load, 2500);
  ['pointerover', 'touchstart', 'focusin'].forEach(function(t){
    document.addEventListener(t, function(e){ if (e.target.closest && e.target.closest('a[data-cal]')) load(); }, { passive: true });
  });

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-cal]');
    if (!a) return;
    lastWhere = a.getAttribute('data-cal') || 'unknown';
    if (window.gtag) {
      gtag('event', 'calendly_click', { location: lastWhere });
      gtag('event', 'book_call_click', { location: lastWhere });
    }
    if (!ready || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    var url = a.href + (a.href.indexOf('?') < 0 ? '?' : '&') + 'utm_source=website&utm_content=' + encodeURIComponent(lastWhere);
    Calendly.initPopupWidget({ url: url });
  });

  var booked = false;
  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://calendly.com' || !e.data || typeof e.data.event !== 'string') return;
    if (e.data.event === 'calendly.event_scheduled' && !booked) {
      booked = true;
      if (window.gtag) gtag('event', 'book_call', { location: lastWhere });
    }
  });
})();

// Team device flag: ?team=1 stops this device from counting in Analytics; ?team=0 undoes it.
(function(){
  var q = location.search, msg = null;
  if (/[?&]team=1\b/.test(q)) msg = 'This device is now marked as Crafted team. Your visits won’t count in Analytics.';
  if (/[?&]team=0\b/.test(q)) msg = 'Team mark removed. This device counts in Analytics again.';
  if (!msg) return;
  var d = document.createElement('div');
  d.setAttribute('role', 'status');
  d.style.cssText = 'position:fixed;left:50%;top:84px;transform:translateX(-50%);z-index:60;max-width:90vw;padding:12px 18px;border-radius:10px;background:#2E3530;color:#fff;font:600 15px/1.4 Archivo,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.3);border:1px solid #F2C345';
  d.textContent = msg;
  document.body.appendChild(d);
  setTimeout(function(){ d.remove(); }, 6000);
})();

// Contact form: gray the team size picker until a choice is made
(function(){
  var sel = document.getElementById('cf-size'); if (!sel) return;
  function f(){ sel.classList.toggle('is-empty', !sel.value); }
  sel.addEventListener('change', f); f();
})();
