// Scroll reveals + count-up stats. All motion respects prefers-reduced-motion.
(function () {
  document.documentElement.classList.add("js");

  // Theme toggle (light default; preference persisted best-effort)
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") document.documentElement.setAttribute("data-theme", "dark");
  } catch (e) {}
  document.querySelectorAll(".theme-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      if (dark) document.documentElement.removeAttribute("data-theme");
      else document.documentElement.setAttribute("data-theme", "dark");
      try { localStorage.setItem("theme", dark ? "light" : "dark"); } catch (e) {}
    });
  });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal on scroll
  const revealed = document.querySelectorAll(".reveal");
  if (!reduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          e.target.style.transitionDelay = Math.min(i * 60, 240) + "ms";
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealed.forEach((el) => io.observe(el));
  } else {
    revealed.forEach((el) => el.classList.add("in"));
  }

  // Count-up stats
  const stats = document.querySelectorAll("[data-count]");
  function animate(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const dur = 1200;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.textContent = prefix + val.toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (!reduced && "IntersectionObserver" in window && stats.length) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { animate(e.target); io2.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    stats.forEach((el) => io2.observe(el));
  } else {
    stats.forEach((el) => {
      el.textContent = (el.dataset.prefix || "") + parseFloat(el.dataset.count).toLocaleString() + (el.dataset.suffix || "");
    });
  }
})();

// Copy-email affordance
document.querySelectorAll('[data-copy]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var value = btn.getAttribute('data-copy');
    var original = btn.textContent;
    function done(ok) {
      btn.textContent = ok ? 'Copied \u2713' : value;
      setTimeout(function () { btn.textContent = original; }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function () { done(true); }, function () { done(false); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = value; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(true); } catch (e) { done(false); }
      document.body.removeChild(ta);
    }
  });
});
