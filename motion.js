/* Sαréal618 site-wide motion. Vanilla JS, no build step. */
(function () {
  "use strict";
  var root = document.documentElement;
  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduce = mq.matches;
  root.classList.add(reduce ? "reduce" : "motion");
  var hasIO = "IntersectionObserver" in window;
  var vh = window.innerHeight;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ss(e0, e1, x) { var t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); }
  // progress of el through the viewport: 0 = top edge enters at bottom, 1 = bottom edge leaves at top
  function prog(r) { return clamp((vh - r.top) / (vh + r.height), 0, 1); }

  /* ---------- 0. Word-by-word masked headlines ---------- */
  document.querySelectorAll(".words").forEach(function (h) {
    var k = 0, frag = document.createDocumentFragment();
    Array.prototype.slice.call(h.childNodes).forEach(function (nd) {
      if (nd.nodeType === 3) {
        nd.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
          var w = document.createElement("span"), inner = document.createElement("span");
          w.className = "w"; inner.textContent = part; w.style.setProperty("--i", k++); w.appendChild(inner); frag.appendChild(w);
        });
      } else {
        var w2 = document.createElement("span"), in2 = document.createElement("span");
        w2.className = "w"; w2.style.setProperty("--i", k++); in2.appendChild(nd.cloneNode(true)); w2.appendChild(in2); frag.appendChild(w2);
      }
    });
    h.textContent = ""; h.appendChild(frag);
  });

  /* ---------- 1. Reveals ---------- */
  var REVEAL = [
    "main h1", "section > h1", ".hero h1", ".hero-copy > *", ".hero > div > p",
    "section > h2", "section > p", ".section-lede", ".eyebrow",
    ".grid > .card", ".grid > div", ".reel-band > *", ".rail > .vcard",
    "section > .card", ".split > *", ".page-media",
    ".legal > h2", ".legal > h3", ".legal > p", ".legal > ul", ".legal > ol",
    ".legal > .card", ".legal > .crisis", ".legal > .note", ".legal > table",
    "article > h2", "article > p", "article > ol", "article > ul", "footer"
  ].join(",");
  var seen = new Set();
  document.querySelectorAll(REVEAL).forEach(function (el) {
    if (seen.has(el) || el.closest(".scrolly,.stage,.newt-layer")) return;
    seen.add(el);
    el.classList.add("rv");
    if (el.closest(".legal") || el.tagName === "FOOTER") el.classList.add("soft");
    var p = el.parentElement, i = 0;
    if (p) for (var c = p.firstElementChild; c && c !== el; c = c.nextElementSibling) if (c.classList.contains("rv")) i++;
    el.style.setProperty("--d", Math.min(i, 5) * 80 + "ms");
  });
  document.querySelectorAll(".words,.blurin,.tw").forEach(function (el) { seen.add(el); });
  if (!reduce && hasIO) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.01 });
    seen.forEach(function (el) { rio.observe(el); });
  } else seen.forEach(function (el) { el.classList.add("in"); });

  /* ---------- 2. Lazy videos: load + play only while in view ---------- */
  function load(v) {
    if (v.dataset.loaded) return;
    v.dataset.loaded = "1";
    var w = v.dataset.webm, m = v.dataset.src;
    if (w) { var s1 = document.createElement("source"); s1.src = w; s1.type = "video/webm"; v.appendChild(s1); }
    if (m) { var s2 = document.createElement("source"); s2.src = m; s2.type = "video/mp4"; v.appendChild(s2); }
    v.muted = true; v.load();
  }
  function play(v) { load(v); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  var vids = Array.prototype.slice.call(document.querySelectorAll("video.lv"));
  vids.forEach(function (v) { v.muted = true; v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); });
  if (!reduce && hasIO) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && e.intersectionRatio >= 0.35) play(v); else if (!v.paused) v.pause();
      });
    }, { threshold: [0, 0.35, 0.6] });
    vids.forEach(function (v) { vio.observe(v); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) vids.forEach(function (v) { if (!v.paused) v.pause(); });
    });
  }

  /* ---------- 3. Scroll engine: newts, chips, scrolly ---------- */
  var newts = Array.prototype.slice.call(document.querySelectorAll(".newt"));
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip[data-at]"));
  var scrollies = Array.prototype.slice.call(document.querySelectorAll(".scrolly"));
  var floaties = Array.prototype.slice.call(document.querySelectorAll(".floaty"));
  scrollies.forEach(function (sc) {
    sc.querySelectorAll(".feat-list li").forEach(function (li, j, all) {
      li.addEventListener("click", function () {
        var top = sc.getBoundingClientRect().top + window.scrollY, span = sc.offsetHeight - vh;
        window.scrollTo({ top: top + span * (j + 0.5) / all.length, behavior: reduce ? "auto" : "smooth" });
      });
    });
  });
  var PATHS = {
    // walk across: in from one side, across, out the other
    ltr: function (p, W, w) { return { x: -w + (W + w) * ss(0.08, 0.92, p) - w * 0.15, y: Math.sin(p * 40) * 3, r: Math.sin(p * 40) * 2.5, o: ss(0.08, 0.2, p) * (1 - ss(0.8, 0.92, p)) }; },
    rtl: function (p, W, w) { return { x: W - (W + w) * ss(0.08, 0.92, p) + w * 0.15, y: Math.sin(p * 40) * 3, r: -Math.sin(p * 40) * 2.5, o: ss(0.08, 0.2, p) * (1 - ss(0.8, 0.92, p)) }; },
    // rise up into the frame from below, pause, sink away
    rise: function (p, W, w, h) { var up = ss(0.15, 0.42, p) * (1 - ss(0.62, 0.9, p)); return { x: 0, y: h * 1.05 * (1 - up), r: (1 - up) * 6, o: ss(0.12, 0.3, p) * (1 - ss(0.75, 0.9, p)) }; },
    // peek in from the side and slip back out
    peekl: function (p, W, w) { var k = ss(0.15, 0.4, p) * (1 - ss(0.6, 0.88, p)); return { x: -w * (1 - k * 0.85), y: 0, r: (1 - k) * -8, o: ss(0.1, 0.25, p) * (1 - ss(0.8, 0.92, p)) }; },
    peekr: function (p, W, w) { var k = ss(0.15, 0.4, p) * (1 - ss(0.6, 0.88, p)); return { x: w * (1 - k * 0.85), y: 0, r: (1 - k) * 8, o: ss(0.1, 0.25, p) * (1 - ss(0.8, 0.92, p)) }; },
    // gentle parallax float: fades in, drifts up, fades away
    drift: function (p, W, w, h) { return { x: Math.sin(p * 6) * 10, y: (0.5 - p) * h * 0.9, r: Math.sin(p * 5) * 4, o: ss(0.05, 0.25, p) * (1 - ss(0.7, 0.95, p)) }; }
  };
  var ticking = false;
  function frame() {
    ticking = false;
    var i, el, r;
    for (i = 0; i < newts.length; i++) {
      el = newts[i];
      var zone = el.parentElement; r = zone.getBoundingClientRect();
      if (!el.closest('.scrolly') && r.bottom < -200 || r.top > vh + 200) { if (el._o !== 0) { el.style.opacity = 0; el._o = 0; } continue; }
      var a = parseFloat(el.dataset.a || 0), b = parseFloat(el.dataset.b || 1), base = prog(r);
      var pin = el.closest(".scrolly");
      if (pin) { var pr = pin.getBoundingClientRect(); base = clamp(-pr.top / (pr.height - vh), 0, 1); r = { width: zone.getBoundingClientRect().width, height: r.height }; }
      var p = clamp((base - a) / (b - a), 0, 1);
      var w = el.offsetWidth || 120, hgt = el.offsetHeight || 90;
      var f = (PATHS[el.dataset.path] || PATHS.drift)(p, r.width, w, hgt);
      var flip = el.dataset.flip ? " scaleX(-1)" : "";
      el.style.transform = "translate3d(" + f.x.toFixed(1) + "px," + f.y.toFixed(1) + "px,0) rotate(" + f.r.toFixed(2) + "deg)" + flip;
      el.style.opacity = f.o.toFixed(3); el._o = f.o;
    }
    for (i = 0; i < chips.length; i++) {
      el = chips[i]; var host = el.closest(".vcard,.card-media,.page-media") || el.parentElement;
      r = host.getBoundingClientRect(); var q = prog(r);
      var on = q >= parseFloat(el.dataset.at) && q <= parseFloat(el.dataset.out || 0.97);
      if (on !== el._on) { el.classList.toggle("on", on); el._on = on; }
    }
    for (i = 0; i < scrollies.length; i++) {
      var sc = scrollies[i]; r = sc.getBoundingClientRect();
      var span = r.height - vh; var sp = clamp(-r.top / span, 0, 0.9999);
      var items = sc.querySelectorAll(".feat-list li"), n = items.length, idx = Math.floor(sp * n);
      var inView = r.top < vh && r.bottom > 0;
      sc.style.setProperty("--p", sp.toFixed(4));
      if (sc._idx !== idx || sc._vis !== inView) {
        sc._idx = idx; sc._vis = inView;
        items.forEach(function (s, j) { s.classList.toggle("on", j === idx); s.setAttribute("aria-current", j === idx ? "step" : "false"); });
        sc.querySelectorAll(".scr-slide").forEach(function (sl, j) {
          sl.classList.toggle("on", j === idx);
          var v = sl.querySelector("video");
          if (v) { if (j === idx && inView) play(v); else if (!v.paused) v.pause(); }
        });
      }
    }
    for (i = 0; i < floaties.length; i++) {
      el = floaties[i]; r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      var off = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.depth || 0.2);
      el.style.transform = "translate3d(0," + off.toFixed(1) + "px,0)";
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  if (!reduce) {
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", function () { vh = window.innerHeight; req(); });
    req();
  } else {
    scrollies.forEach(function (sc) { sc.querySelectorAll(".feat-list li").forEach(function (s) { s.classList.add("on"); }); });
  }

  /* ---------- 4. Hero stage: crossfade slides + thumbnail strip ---------- */
  document.querySelectorAll(".stage").forEach(function (stage) {
    var slides = stage.querySelectorAll(".slide"), thumbs = stage.querySelectorAll(".thumbs button");
    var bg = document.querySelector(".stage-hero .bg");
    var cur = -1, timer = null, visible = true, DUR = 8000;
    function show(n) {
      n = (n + slides.length) % slides.length;
      if (n === cur) return;
      slides.forEach(function (s, j) {
        s.classList.toggle("on", j === n);
        var v = s.querySelector("video");
        if (v) { if (j === n && !reduce && visible) { try { v.currentTime = 0; } catch (e) {} play(v); } else if (!v.paused) v.pause(); }
      });
      thumbs.forEach(function (t, j) { t.classList.toggle("on", j === n); t.setAttribute("aria-pressed", j === n); });
      if (bg && slides[n].dataset.bg) bg.style.backgroundImage = "url(" + slides[n].dataset.bg + ")";
      var t0 = thumbs[n]; if (t0) { var bar = t0.querySelector(".bar"); if (bar) { bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = ""; } }
      cur = n; arm();
    }
    function arm() { clearTimeout(timer); if (!reduce && visible) timer = setTimeout(function () { show(cur + 1); }, DUR); }
    thumbs.forEach(function (t, j) { t.addEventListener("click", function () { show(j); }); });
    stage.style.setProperty("--dur", DUR / 1000 + "s");
    if (hasIO) new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting; stage.classList.toggle("paused", !visible);
      var v = slides[cur] && slides[cur].querySelector("video");
      if (!visible) { clearTimeout(timer); if (v) v.pause(); } else { if (v && !reduce) play(v); arm(); }
    }, { threshold: 0.25 }).observe(stage);
    show(0);
  });

  /* ---------- 5. Peeking carousels with soft arrows ---------- */
  document.querySelectorAll(".rail-wrap").forEach(function (w) {
    var rail = w.querySelector(".rail"), prev = w.querySelector(".prev"), next = w.querySelector(".next");
    function step() { var c = rail.querySelector(".vcard"); return c ? c.offsetWidth + 18 : 300; }
    function upd() { if (prev) prev.disabled = rail.scrollLeft < 8; if (next) next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 8; }
    if (prev) prev.addEventListener("click", function () { rail.scrollBy({ left: -step(), behavior: reduce ? "auto" : "smooth" }); });
    if (next) next.addEventListener("click", function () { rail.scrollBy({ left: step(), behavior: reduce ? "auto" : "smooth" }); });
    rail.addEventListener("scroll", upd, { passive: true }); upd();
  });

  /* ---------- 6. Stacking colour sheets: stick so the whole sheet stays readable ---------- */
  var sheets = Array.prototype.slice.call(document.querySelectorAll(".sheet"));
  function sizeSheets() {
    var navH = (document.querySelector("nav") || { offsetHeight: 0 }).offsetHeight;
    sheets.forEach(function (sh, j) { sh.style.setProperty("--top", Math.min(navH + j * 14, vh - sh.offsetHeight) + "px"); });
  }
  if (sheets.length) { sizeSheets(); window.addEventListener("resize", sizeSheets); window.addEventListener("load", sizeSheets); }


  /* ---------- 8. Newt lens: rises in, focus pulls sharp, ring turns and the shot pans with scroll.
     A fine pointer over #terrace-view also looks through the glass: the oversized shot pans
     toward where you point, and the tick ring turns a little with that look. Leaving eases
     back to the scroll framing. Coarse pointers and reduced motion stay on the scroll path. ---------- */
  var lenses = Array.prototype.slice.call(document.querySelectorAll(".lens"));
  if (!reduce && lenses.length) {
    var lt = false;
    var lookEl = document.querySelector("#terrace-view .lens");
    var canLook = !!(lookEl && window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    // Glass is inset 16.5%, so its radius is 33.5% of the lens box.
    var GLASS_R = 0.335;
    // translate % is of the 120% shot. Stay inside the 10% overhang (~8.3% of the shot).
    var LOOK_X = 7.2, LOOK_Y = 6.4, LOOK_LIM = 7.6;
    var look = canLook ? { on: false, hold: false, nx: 0, ny: 0, px: 0, py: 0, rot: 0, spx: 0, spy: 0, srot: 0, raf: 0, last: 0, leftAt: 0 } : null;

    function lensShot(L) {
      var r = L.getBoundingClientRect();
      var p = prog(r), small = L.classList.contains("sm");
      return {
        off: r.bottom < -50 || r.top > vh + 50,
        rise: (1 - ss(0.02, 0.32, p)) * (small ? 30 : 70),
        rot: p * 140 - 70,
        px: (0.5 - p) * 9,
        py: (0.5 - p) * 5,
        blur: (1 - ss(0.12, 0.38, p)) * 7
      };
    }
    function writePan(px, py, rot) {
      lookEl.style.setProperty("--px", px.toFixed(2) + "%");
      lookEl.style.setProperty("--py", py.toFixed(2) + "%");
      lookEl.style.setProperty("--rot", rot.toFixed(2) + "deg");
    }
    function lookAim() {
      if (!look.on) return { px: look.spx, py: look.spy, rot: look.srot };
      // Pointer toward a side reveals that side of the terrace. Center keeps the scroll framing.
      return {
        px: clamp(look.spx - look.nx * LOOK_X, -LOOK_LIM, LOOK_LIM),
        py: clamp(look.spy - look.ny * LOOK_Y, -LOOK_LIM, LOOK_LIM),
        rot: look.srot - look.nx * 12 + look.ny * 3
      };
    }
    function lookFrame(now) {
      look.raf = 0;
      if (!look.last) look.last = now;
      var dt = Math.min(34, now - look.last);
      look.last = now;
      if (look.on) look.leftAt = 0;
      else if (!look.leftAt) look.leftAt = now;
      var aim = lookAim();
      // Short follow while the pointer is on the glass; a calm ease home after it leaves.
      var tau = look.on ? 48 : 220;
      var k = 1 - Math.exp(-dt / tau);
      look.px += (aim.px - look.px) * k;
      look.py += (aim.py - look.py) * k;
      look.rot += (aim.rot - look.rot) * k;
      var home = !look.on && (
        (Math.abs(aim.px - look.px) < 0.08 && Math.abs(aim.py - look.py) < 0.08 && Math.abs(aim.rot - look.rot) < 0.15)
        || (look.leftAt && now - look.leftAt > 760)
      );
      if (home) {
        look.hold = false;
        look.last = 0;
        look.leftAt = 0;
        lookEl.classList.remove("look-live");
        writePan(look.spx, look.spy, look.srot);
        return;
      }
      writePan(look.px, look.py, look.rot);
      look.raf = requestAnimationFrame(lookFrame);
    }
    function aimFromEvent(e) {
      if (!look || e.pointerType === "touch") return;
      var r = lookEl.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var dx = (e.clientX - r.left) / r.width - 0.5;
      var dy = (e.clientY - r.top) / r.height - 0.5;
      if (dx * dx + dy * dy > 0.25) {
        if (look.on) leaveLook();
        return;
      }
      look.nx = clamp(dx / GLASS_R, -1, 1);
      look.ny = clamp(dy / GLASS_R, -1, 1);
      look.on = true;
      if (!look.hold) {
        look.px = parseFloat(lookEl.style.getPropertyValue("--px"));
        look.py = parseFloat(lookEl.style.getPropertyValue("--py"));
        look.rot = parseFloat(lookEl.style.getPropertyValue("--rot"));
        if (isNaN(look.px)) look.px = look.spx;
        if (isNaN(look.py)) look.py = look.spy;
        if (isNaN(look.rot)) look.rot = look.srot;
        look.hold = true;
        look.last = 0;
        lookEl.classList.add("look-live");
      }
      if (!look.raf) look.raf = requestAnimationFrame(lookFrame);
    }
    function leaveLook(e) {
      if (!look || (e && e.pointerType === "touch")) return;
      if (!look.on && !look.hold) return;
      look.on = false;
      if (!look.raf) look.raf = requestAnimationFrame(lookFrame);
    }
    function lensFrame() {
      lt = false;
      lenses.forEach(function (L) {
        var s = lensShot(L);
        if (s.off) return;
        L.style.setProperty("--rise", s.rise.toFixed(1) + "px");
        L.style.setProperty("--blur", s.blur.toFixed(2) + "px");
        if (look && L === lookEl) { look.spx = s.px; look.spy = s.py; look.srot = s.rot; }
        if (!(look && L === lookEl && look.hold)) {
          L.style.setProperty("--rot", s.rot.toFixed(1) + "deg");
          L.style.setProperty("--px", s.px.toFixed(2) + "%");
          L.style.setProperty("--py", s.py.toFixed(2) + "%");
        }
      });
    }
    function lreq() { if (!lt) { lt = true; requestAnimationFrame(lensFrame); } }
    window.addEventListener("scroll", lreq, { passive: true });
    window.addEventListener("resize", lreq);
    lreq();
    if (look) {
      lookEl.addEventListener("pointerenter", aimFromEvent);
      lookEl.addEventListener("pointermove", aimFromEvent);
      lookEl.addEventListener("pointerleave", leaveLook);
      lookEl.addEventListener("pointercancel", leaveLook);
    }
  }
})();
