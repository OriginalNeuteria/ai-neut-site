/* Scroll progress for the closed-test voyage.
   Passive listeners only. No snap, no wheel capture, no drag. */
(function () {
  var root = document.getElementById("voyage");
  if (!root) return;
  var reduceQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var narrowQ = window.matchMedia("(max-width: 800px)");
  var run = document.getElementById("voyage-run");
  var still = root.querySelector(".voyage-still");
  var lines = Array.prototype.slice.call(root.querySelectorAll(".line"));
  var jumps = Array.prototype.slice.call(root.querySelectorAll(".voyage-jumps a"));
  var plates = {
    cal: root.querySelector('.voyage-plates [data-plate="cal"]'),
    jou: root.querySelector('.voyage-plates [data-plate="jou"]'),
    note: root.querySelector('.voyage-plates [data-plate="note"]')
  };
  if (!run || !lines.length) return;

  var centers = [0.05, 0.27, 0.56, 0.78];
  /* Photos never overlap. Each one fades out to the terrace before the next fades in. */
  var keys = [
    { p: 0, s: 1, ox: 50, oy: 48, cal: 0, jou: 0, note: 0, light: 0.05 },
    { p: 0.12, s: 1.03, ox: 48, oy: 52, cal: 0, jou: 0, note: 0, light: 0.12 },
    { p: 0.2, s: 1.06, ox: 44, oy: 56, cal: 1, jou: 0, note: 0, light: 0.28 },
    { p: 0.34, s: 1.08, ox: 44, oy: 56, cal: 1, jou: 0, note: 0, light: 0.28 },
    { p: 0.42, s: 1.05, ox: 48, oy: 52, cal: 0, jou: 0, note: 0, light: 0.12 },
    { p: 0.5, s: 1.08, ox: 46, oy: 56, cal: 0, jou: 1, note: 0, light: 0.28 },
    { p: 0.62, s: 1.08, ox: 46, oy: 56, cal: 0, jou: 1, note: 0, light: 0.28 },
    { p: 0.7, s: 1.04, ox: 50, oy: 52, cal: 0, jou: 0, note: 0, light: 0.12 },
    { p: 0.76, s: 1.03, ox: 50, oy: 50, cal: 0, jou: 0, note: 1, light: 0.16 },
    { p: 0.86, s: 1.01, ox: 50, oy: 48, cal: 0, jou: 0, note: 0, light: 0.08 },
    { p: 1, s: 1, ox: 50, oy: 48, cal: 0, jou: 0, note: 0, light: 0.05 }
  ];
  var live = false;
  var idx = -1;
  var ticking = false;
  var motionBtn = document.getElementById("voyage-motion");
  var motionOff = false;
  try { motionOff = sessionStorage.getItem("voyage-motion") === "off"; } catch (e) {}

  function smooth(t) { return t * t * (3 - 2 * t); }
  function wants() {
    return !reduceQ.matches && !narrowQ.matches && !motionOff && (window.innerHeight || 0) >= 560;
  }
  function paintMotion() {
    if (!motionBtn) return;
    var reduced = reduceQ.matches;
    var narrow = narrowQ.matches;
    motionBtn.disabled = reduced || narrow;
    motionBtn.textContent = reduced ? "Motion: Off (reduced motion)" : (narrow || motionOff ? "Motion: Off" : "Motion: On");
    motionBtn.setAttribute("aria-pressed", reduced || narrow || motionOff ? "false" : "true");
  }
  function frameAt(p) {
    var i = 0;
    while (i < keys.length - 2 && p > keys[i + 1].p) i++;
    var a = keys[i], b = keys[i + 1];
    var t = smooth(Math.min(1, Math.max(0, (p - a.p) / (b.p - a.p || 1))));
    function m(k) { return a[k] + (b[k] - a[k]) * t; }
    return { s: m("s"), ox: m("ox"), oy: m("oy"), cal: m("cal"), jou: m("jou"), note: m("note"), light: m("light") };
  }
  function measure() {
    var vh = window.innerHeight || 1;
    var span = run.offsetHeight - vh;
    var top = run.getBoundingClientRect().top;
    if (span <= 1) return 0;
    return Math.min(1, Math.max(0, -top / span));
  }
  function nearest(p) {
    var best = 0, dist = 1;
    for (var i = 0; i < centers.length; i++) {
      var d = Math.abs(p - centers[i]);
      if (d < dist) { dist = d; best = i; }
    }
    return best;
  }
  function render() {
    ticking = false;
    if (!live) return;
    var p = measure();
    var cam = frameAt(p);
    root.style.setProperty("--p", p.toFixed(4));
    root.style.setProperty("--scale", cam.s.toFixed(4));
    root.style.setProperty("--ox", cam.ox.toFixed(2) + "%");
    root.style.setProperty("--oy", cam.oy.toFixed(2) + "%");
    root.style.setProperty("--light", cam.light.toFixed(3));
    root.style.setProperty("--cal", cam.cal.toFixed(3));
    root.style.setProperty("--jou", cam.jou.toFixed(3));
    root.style.setProperty("--note", cam.note.toFixed(3));
    if (plates.note) plates.note.style.pointerEvents = cam.note > 0.45 ? "auto" : "none";
    var iNow = nearest(p);
    for (var n = 0; n < lines.length; n++) {
      var dist = Math.abs(p - centers[n]) / 0.16;
      var o = dist >= 1 ? 0 : smooth(1 - dist);
      lines[n].style.opacity = o.toFixed(3);
      lines[n].style.transform = "translate3d(0," + ((centers[n] - p) * 42).toFixed(1) + "px,0)";
    }
    if (iNow !== idx) {
      idx = iNow;
      for (var j = 0; j < jumps.length; j++) {
        jumps[j].setAttribute("aria-current", j === iNow ? "step" : "false");
      }
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
    root.classList.add("is-live");
    if (still) still.hidden = true;
    idx = -1;
    render();
  }
  function disable() {
    live = false;
    root.classList.remove("is-live");
    if (still) still.hidden = false;
    idx = -1;
    jumps.forEach(function (a) { a.setAttribute("aria-current", "false"); });
  }
  function sync() {
    paintMotion();
    if (wants()) enable();
    else disable();
  }
  if (motionBtn) {
    motionBtn.addEventListener("click", function () {
      if (reduceQ.matches) return;
      motionOff = !motionOff;
      try { sessionStorage.setItem("voyage-motion", motionOff ? "off" : "on"); } catch (e) {}
      sync();
      if (motionOff) window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY - 12, behavior: "auto" });
    });
  }

  jumps.forEach(function (a, i) {
    a.addEventListener("click", function (event) {
      if (!live) return;
      event.preventDefault();
      var vh = window.innerHeight || 1;
      var span = Math.max(0, run.offsetHeight - vh);
      var top = run.getBoundingClientRect().top + window.scrollY + span * centers[i];
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  if (typeof reduceQ.addEventListener === "function") reduceQ.addEventListener("change", sync);
  if (typeof narrowQ.addEventListener === "function") narrowQ.addEventListener("change", sync);
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", function () { sync(); request(); }, { passive: true });
  sync();
})();
