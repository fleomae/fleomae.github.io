(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Nav: solid on scroll, hide on scroll down, mobile toggle */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");
  var lastY = 0;
  function onScroll() {
    var y = window.scrollY;
    if (!nav) return;
    nav.classList.toggle("is-scrolled", y > 24);
    if (!nav.classList.contains("is-open")) {
      nav.classList.toggle("is-hidden", y > lastY && y > 400);
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Reveal on scroll */
  var targets = document.querySelectorAll(".reveal, .reveal-line");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    var vh = window.innerHeight;
    targets.forEach(function (t) {
      var r = t.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) t.classList.add("is-in");
      else io.observe(t);
    });
  } else {
    targets.forEach(function (t) { t.classList.add("is-in"); });
  }

  /* Light parallax */
  var para = document.querySelectorAll("[data-parallax]");
  if (para.length && !reduce) {
    var ticking = false;
    function update() {
      var vh = window.innerHeight;
      para.forEach(function (el) {
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.1;
        var offset = (r.top + r.height / 2 - vh / 2) * speed;
        var base = el.getAttribute("data-base") || "";
        el.style.transform = base + " translate3d(0," + offset.toFixed(1) + "px,0)";
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* Work list: image follows cursor */
  var preview = document.querySelector(".hover-preview");
  if (preview && window.matchMedia("(hover: hover)").matches) {
    var img = preview.querySelector("img");
    var x = 0, y = 0, cx = 0, cy = 0, running = false;
    function loop() {
      cx += (x - cx) * 0.16;
      cy += (y - cy) * 0.16;
      preview.style.left = cx + "px";
      preview.style.top = cy + "px";
      if (Math.abs(x - cx) > 0.3 || Math.abs(y - cy) > 0.3) requestAnimationFrame(loop);
      else running = false;
    }
    document.querySelectorAll(".work-row a").forEach(function (a) {
      a.addEventListener("mouseenter", function (e) {
        if (!a.getAttribute("data-img")) return;
        img.src = a.getAttribute("data-img");
        x = cx = e.clientX; y = cy = e.clientY;
        preview.classList.add("is-on");
      });
      a.addEventListener("mousemove", function (e) {
        x = e.clientX; y = e.clientY;
        if (!running) { running = true; requestAnimationFrame(loop); }
      });
      a.addEventListener("mouseleave", function () { preview.classList.remove("is-on"); });
    });
  }

  /* Fit giant type to the width of its container, whatever font loads */
  var fits = document.querySelectorAll("[data-fit]");
  function fit() {
    fits.forEach(function (el) {
      var box = el.parentElement;
      var cs = getComputedStyle(box);
      var avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (el.classList.contains("footer__giant")) avail = box.clientWidth * 0.96;
      el.style.fontSize = "100px";
      var range = document.createRange();
      range.selectNodeContents(el);
      var w = range.getBoundingClientRect().width;
      if (w > 0) el.style.fontSize = Math.min(100 * (avail * parseFloat(el.getAttribute("data-fit"))) / w, 600) + "px";
    });
  }
  if (fits.length) {
    fit();
    window.addEventListener("resize", fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }

  /* Hide images that fail to load instead of showing a broken icon */
  function markMissing(img) {
    var box = img.closest("figure, .product__img, .cs-cover");
    if (box) box.classList.add("img-missing");
  }
  document.querySelectorAll("img").forEach(function (img) {
    function fail() {
      var fb = img.getAttribute("data-fallback");
      if (fb && img.src.indexOf(fb) === -1) { img.src = fb; return; }
      markMissing(img);
    }
    if (img.complete && img.getAttribute("src") && img.naturalWidth === 0) fail();
    img.addEventListener("error", fail);
  });

  /* Footer year */

  /* YouTube facade: local thumbnail, falls back if missing; plays inline on the live site */
  document.querySelectorAll("a[data-yt]").forEach(function (a) {
    var img = a.querySelector("img");
    if (img) img.addEventListener("error", function () {
      var fb = img.getAttribute("data-fallback");
      if (fb && img.src.indexOf(fb) === -1) img.src = fb;
    });
    a.addEventListener("click", function (e) {
      if (window.self !== window.top) return; // inside a preview frame: open YouTube instead
      e.preventDefault();
      if (a.classList.contains("is-playing")) return;
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + a.getAttribute("data-yt") + "?autoplay=1&rel=0";
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.title = "Video";
      a.appendChild(f);
      a.classList.add("is-playing");
    });
  });


  /* Exvia-style hero: sharp focus window over a blurred portrait */
  var xh = document.querySelector("[data-xhero]");
  if (xh) {
    var imgs = xh.querySelectorAll(".xhero__img");
    var sharp = xh.querySelector(".xhero__img--sharp");
    if (nav) nav.classList.add("on-dark", "nav-intro");
    function layout() {
      var W = xh.clientWidth, H = xh.clientHeight, iw = sharp.naturalWidth, ih = sharp.naturalHeight;
      if (!iw) return;
      var fx = parseFloat(sharp.getAttribute("data-fx")), fy = parseFloat(sharp.getAttribute("data-fy"));
      var ty = 0.44;
      var s = Math.max(W / iw, H / ih, (ty * H) / (fy * ih), ((1 - ty) * H) / ((1 - fy) * ih),
                       (W / 2) / (fx * iw), (W / 2) / ((1 - fx) * iw));
      if (W < 700) s *= 1.15;
      var w = iw * s, h = ih * s, left = W / 2 - fx * w, top = ty * H - fy * h;
      imgs.forEach(function (im) {
        im.style.width = w + "px"; im.style.height = h + "px";
        im.style.left = left + "px"; im.style.top = top + "px"; im.style.objectFit = "fill";
      });
      var head = 0.18 * iw * s;
      var bw = Math.max(Math.min(Math.max(W * 0.2, 190), 320), head * 1.1);
      if (W < 700) bw = Math.min(W * 0.56, bw);
      var bh = bw * 1.36, cx = W / 2, cy = ty * H;
      xh.style.setProperty("--ly", cy + "px");
      xh.style.setProperty("--wl", (cx - bw / 2) + "px");
      xh.style.setProperty("--wr", (W - cx - bw / 2) + "px");
      xh.style.setProperty("--wb", (cy + bh / 2) + "px");
      box = { W: W, H: H, bw: bw, bh: bh, hx: cx, hy: cy };
      return [cy - bh / 2, W - (cx + bw / 2), H - (cy + bh / 2), cx - bw / 2];
    }
    var box = null;
    /* after the intro, the focus window follows the cursor (mouse/trackpad only) */
    var tx = 0, ty2 = 0, px = 0, py = 0, following = false, raf = 0;
    function setWin(x, y) {
      var b = box, hw = b.bw / 2, hh = b.bh / 2;
      x = Math.max(hw, Math.min(b.W - hw, x)); y = Math.max(hh, Math.min(b.H - hh, y));
      xh.style.setProperty("--ct", (y - hh) + "px"); xh.style.setProperty("--cb", (b.H - y - hh) + "px");
      xh.style.setProperty("--cl", (x - hw) + "px"); xh.style.setProperty("--cr", (b.W - x - hw) + "px");
    }
    function tick() {
      px += (tx - px) * 0.12; py += (ty2 - py) * 0.12;
      setWin(px, py);
      if (Math.abs(tx - px) > 0.3 || Math.abs(ty2 - py) > 0.3) raf = requestAnimationFrame(tick); else raf = 0;
    }
    function aim(x, y) { tx = x; ty2 = y; if (!raf) raf = requestAnimationFrame(tick); }
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce) {
      xh.addEventListener("mousemove", function (e) {
        if (!xh.classList.contains("is-ready") || !box) return;
        var r = xh.getBoundingClientRect();
        if (!following) { following = true; px = box.hx; py = box.hy; xh.classList.add("is-follow"); }
        aim(e.clientX - r.left, e.clientY - r.top);
      });
      xh.addEventListener("mouseleave", function () { if (following && box) aim(box.hx, box.hy); });
    }
    function focus() {
      var r = layout(); if (!r) return;
      ["--ct", "--cr", "--cb", "--cl"].forEach(function (k, i) { xh.style.setProperty(k, r[i] + "px"); });
    }
    function start() {
      layout();
      var W = xh.clientWidth, H = xh.clientHeight, m = Math.min(W, H) * 0.04;
      ["--ct", "--cr", "--cb", "--cl"].forEach(function (k) { xh.style.setProperty(k, m + "px"); });
      requestAnimationFrame(function () {
        xh.classList.add("is-set");
        setTimeout(function () {
          focus(); xh.classList.add("is-focused"); if (typeof fit === "function") fit();
          setTimeout(function () { xh.classList.add("is-ready"); }, reduce ? 0 : 1700);
        }, reduce ? 0 : 450);
      });
    }
    if (sharp.complete && sharp.naturalWidth) start(); else sharp.addEventListener("load", start);
    window.addEventListener("resize", function () {
      if (!xh.classList.contains("is-focused")) return;
      following = false; xh.classList.remove("is-follow"); focus();
    });
    function onDark() { if (nav) nav.classList.toggle("on-dark", window.scrollY < xh.offsetHeight - 80); }
    window.addEventListener("scroll", onDark, { passive: true });
  }
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
