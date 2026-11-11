/* Scroll progress for the tester story.
   Listens passively. Does not capture wheel, touch, or keys,
   and does not snap. Reduced motion and short viewports stay stacked. */
(function () {
  var section = document.getElementById("testers");
  if (!section || !section.classList.contains("tester-walk")) return;

  var reduceQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var run = section.querySelector(".tw-run");
  var scenes = Array.prototype.slice.call(section.querySelectorAll(".tw-scene"));
  var jumps = Array.prototype.slice.call(section.querySelectorAll(".tw-jumps a"));
  if (!run || !scenes.length) return;

  var n = scenes.length;
  var idx = -1;
  var live = false;
  var ticking = false;

  function shortViewport() {
    return (window.innerHeight || 0) < 520;
  }

  function wantsLive() {
    return !reduceQ.matches && !shortViewport();
  }

  function measure() {
    var vh = window.innerHeight || 1;
    var span = run.offsetHeight - vh;
    var top = run.getBoundingClientRect().top;
    if (span <= 1) return 0;
    return Math.min(1, Math.max(0, -top / span));
  }

  function paint(i) {
    for (var j = 0; j < n; j++) {
      var on = j === i;
      scenes[j].classList.toggle("is-on", on);
      scenes[j].classList.toggle("is-past", j < i);
      scenes[j].classList.toggle("is-next", j > i);
      if (on) scenes[j].setAttribute("aria-current", "step");
      else scenes[j].removeAttribute("aria-current");
      if (jumps[j]) jumps[j].setAttribute("aria-current", on ? "step" : "false");
    }
  }

  function render() {
    ticking = false;
    if (!live) return;
    var p = measure();
    var x = p * n;
    var i = Math.min(n - 1, Math.floor(x));
    var local = x - i;
    if (p >= 0.999) {
      i = n - 1;
      local = 1;
    }
    run.style.setProperty("--p", p.toFixed(4));
    run.style.setProperty("--local", local.toFixed(4));
    if (i !== idx) {
      idx = i;
      paint(i);
    }
  }

  function request() {
    if (!live || ticking) return;
    ticking = true;
    requestAnimationFrame(render);
  }

  function enable() {
    if (live) return;
    live = true;
    section.classList.add("is-live");
    idx = -1;
    render();
  }

  function disable() {
    if (!live && !section.classList.contains("is-live")) return;
    live = false;
    idx = -1;
    section.classList.remove("is-live");
    run.style.removeProperty("--p");
    run.style.removeProperty("--local");
    scenes.forEach(function (scene) {
      scene.classList.remove("is-on", "is-past", "is-next");
      scene.removeAttribute("aria-current");
    });
    jumps.forEach(function (a) { a.setAttribute("aria-current", "false"); });
  }

  function sync() {
    if (wantsLive()) enable();
    else disable();
  }

  jumps.forEach(function (a, i) {
    a.addEventListener("click", function (event) {
      if (!section.classList.contains("is-live") || shortViewport() || reduceQ.matches) return;
      event.preventDefault();
      var vh = window.innerHeight || 1;
      var span = Math.max(0, run.offsetHeight - vh);
      var top = run.getBoundingClientRect().top + window.scrollY + span * ((i + 0.42) / n);
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  if (typeof reduceQ.addEventListener === "function") {
    reduceQ.addEventListener("change", sync);
  }
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", function () {
    sync();
    request();
  }, { passive: true });

  sync();

  var hash = location.hash;
  var hashIndex = -1;
  scenes.forEach(function (scene, i) {
    if ("#" + scene.id === hash) hashIndex = i;
  });
  if (hashIndex >= 0 && live) {
    var vh = window.innerHeight || 1;
    var span = Math.max(0, run.offsetHeight - vh);
    var top = run.getBoundingClientRect().top + window.scrollY + span * ((hashIndex + 0.42) / n);
    window.scrollTo({ top: top, behavior: "auto" });
    idx = -1;
    render();
  }
})();
