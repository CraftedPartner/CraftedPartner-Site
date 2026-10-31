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

/* Savings calculator: 30% recruiter fee vs typical Crafted cost (about 80% less). */
(function(){
  var range = document.getElementById('calc-salary');
  if (!range) return;
  var hires = document.getElementById('calc-hires');
  var fmt = function(n){ return '$' + Math.round(n).toLocaleString('en-US'); };
  var tracked = false;
  function update(){
    var n = Math.min(50, Math.max(1, parseInt(hires.value, 10) || 1));
    var fee = range.value * 0.30 * n;
    var crafted = fee * 0.20;
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
