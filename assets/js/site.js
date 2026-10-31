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
          child.style.transitionDelay = Math.min(n, 5) * 80 + 'ms';
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
  }, { rootMargin: '0px' });

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
