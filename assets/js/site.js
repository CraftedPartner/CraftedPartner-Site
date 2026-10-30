/* Fade sections in as they scroll into view. Skipped for reduced motion
   and old browsers, so content is always visible without it. */
(function(){
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px' });

  targets.forEach(function(el){ el.classList.add('reveal'); io.observe(el); });
})();
