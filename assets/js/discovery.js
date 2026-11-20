/* Recruiting discovery: steps, autosave, and one clean submission to Formspree. */
(function(){
  var form = document.getElementById('dq-form'); if (!form) return;
  var steps = Array.prototype.slice.call(form.querySelectorAll('.dq-step'));
  var back = document.getElementById('dq-back'), next = document.getElementById('dq-next'), submit = document.getElementById('dq-submit');
  var bar = document.getElementById('dq-bar'), saved = document.getElementById('dq-saved'), err = document.getElementById('dq-err');
  var KEY = 'crafted_discovery_v1', cur = 0, t;

  function store(){ try { var d = {}; Array.prototype.forEach.call(form.elements, function(el){
      if (!el.name || el.name === '_gotcha') return;
      if (el.type === 'radio' || el.type === 'checkbox') { if (el.checked) (d[el.name] = d[el.name] || []).push(el.value); }
      else if (el.value) d[el.name] = el.value; });
      localStorage.setItem(KEY, JSON.stringify({ d: d, s: cur })); saved.textContent = 'Saved'; clearTimeout(t); t = setTimeout(function(){ saved.textContent = ''; }, 1500);
    } catch (e) {} }
  function restore(){ try { var o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (!o) return;
      Array.prototype.forEach.call(form.elements, function(el){ var v = o.d[el.name]; if (v == null) return;
        if (el.type === 'radio' || el.type === 'checkbox') el.checked = v.indexOf(el.value) > -1; else el.value = v; });
      show(Math.min(o.s || 0, steps.length - 1));
    } catch (e) {} }
  function show(i){
    steps.forEach(function(s, n){ s.hidden = n !== i; });
    cur = i; back.hidden = i === 0; next.hidden = i === steps.length - 1; submit.hidden = i !== steps.length - 1;
    bar.style.width = ((i + 1) / steps.length * 100) + '%'; err.hidden = true;
  }
  function valid(i){
    var bad = null;
    steps[i].querySelectorAll('[required]').forEach(function(el){ if (!bad && !el.checkValidity()) bad = el; });
    if (bad) { err.textContent = 'Please fill in: ' + bad.closest('.dq').querySelector('.dq-l').textContent.replace(/^\d+/, '').trim(); err.hidden = false; bad.focus(); return false; }
    return true;
  }
  function top(){ var y = form.getBoundingClientRect().top + window.scrollY - 110; window.scrollTo({ top: y, behavior: 'smooth' }); }

  next.addEventListener('click', function(){ if (!valid(cur)) return; show(cur + 1); store(); top(); });
  back.addEventListener('click', function(){ show(cur - 1); store(); top(); });
  form.addEventListener('input', store); form.addEventListener('change', store);
  form.querySelectorAll('.dq-other-t').forEach(function(tx){ tx.addEventListener('input', function(){ var b = tx.parentNode.querySelector('input:not(.dq-other-t)'); if (tx.value) b.checked = true; }); });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    for (var i = 0; i < steps.length; i++) {
      var miss = Array.prototype.some.call(steps[i].querySelectorAll('[required]'), function(el){ return !el.checkValidity(); });
      if (miss) { show(i); valid(i); top(); return; }
    }
    var out = {}, val = function(n){ var el = form.elements[n]; return el && el.value ? el.value.trim() : ''; };
    form.querySelectorAll('[data-key]').forEach(function(el){
      var key = el.getAttribute('data-key'), v = '';
      if (el.classList.contains('dq-opts')) {
        var picks = []; el.querySelectorAll('input[type=radio]:checked, input[type=checkbox]:checked').forEach(function(c){
          picks.push(c.value === 'Other' ? 'Other: ' + (val(c.name + '_other') || '(not specified)') : c.value); });
        v = picks.join(', ');
      } else v = (el.value || '').trim();
      out[key] = v || '—';
    });
    var company = val('q3') || 'Company', title = val('q6') || 'Role';
    out._subject = 'Recruiting Discovery: ' + company + ' – ' + title;
    out._replyto = val('q4'); out.email = val('q4'); out._gotcha = form.elements._gotcha.value;
    submit.disabled = true; submit.textContent = 'Sending…';
    fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(out) })
      .then(function(r){ if (!r.ok) return r.json().catch(function(){ return {}; }).then(function(d){ throw new Error(d && d.errors ? d.errors.map(function(x){ return x.message; }).join(', ') : 'Error ' + r.status); });
        try { localStorage.removeItem(KEY); } catch (x) {}
        if (window.gtag) gtag('event', 'discovery_submitted');
        document.querySelector('.dq-progress').remove();
        var ty = document.createElement('div'); ty.className = 'thank-you';
        ty.innerHTML = '<h3>Got it.</h3><p>Thanks for the detail. We&rsquo;ll review it and reach out within a business day with next steps.</p>';
        form.replaceWith(ty); top(); })
      .catch(function(x){ submit.disabled = false; submit.innerHTML = 'Send to Crafted &rarr;';
        err.innerHTML = 'Something went wrong (' + x.message + '). Your answers are saved. Try again, or email <a href="mailto:contact@craftedconsultingusa.com">contact@craftedconsultingusa.com</a>.'; err.hidden = false; });
  });
  show(0); restore();
})();
