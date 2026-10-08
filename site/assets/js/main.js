/* JokiBlox site behaviour: i18n, nav, countdown, motion demos, pricing. No dependencies. */
(function () {
  "use strict";
  var CFG = window.JOKIBLOX_CONFIG || {};
  var root = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var lang = function () { return root.getAttribute("data-lang") === "id" ? "id" : "en"; };
  var t = function (en, id) { return lang() === "id" ? id : en; };
  window.JB = { lang: lang, t: t };

  /* ---------------- language ---------------- */
  var titleEn = document.title;
  var titleIdMeta = $('meta[name="jb-title-id"]');
  function applyLang(l) {
    root.setAttribute("data-lang", l);
    root.lang = l;
    try { localStorage.setItem("jb-lang", l); } catch (e) {}
    document.title = l === "id" && titleIdMeta ? titleIdMeta.content : titleEn;
    $$("[data-ph-en]").forEach(function (el) { el.placeholder = el.getAttribute("data-ph-" + l) || ""; });
    $$("option[data-en]").forEach(function (o) { o.textContent = o.getAttribute("data-" + l); });
    $$(".lang-toggle button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === l)); });
    document.dispatchEvent(new CustomEvent("jb:lang", { detail: l }));
  }
  $$(".lang-toggle button").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.dataset.lang); });
  });
  applyLang(lang());

  // Legal pages duplicate anchors per language (#refunds / #refunds-id): jump to the visible one.
  function fixHash() {
    var h = location.hash.slice(1), el = h && document.getElementById(h);
    if (el && !el.offsetParent) {
      var alt = document.getElementById(h + "-id") || document.getElementById(h.replace(/-id$/, ""));
      if (alt && alt.offsetParent) alt.scrollIntoView();
    }
  }
  window.addEventListener("hashchange", fixHash);
  window.addEventListener("load", fixHash);

  /* ---------------- nav ---------------- */
  var menuBtn = $(".menu-btn"), links = $(".nav-links");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
  }
  var here = location.pathname.split("/").pop().replace(".html", "") || "index";
  $$(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    if (href.indexOf("#") !== -1) return;
    var p = href.split("/").pop().replace(".html", "") || "index";
    if (p === here) a.setAttribute("aria-current", "page");
  });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------------- loading feedback ---------------- */
  // Thin top bar: finishes when the page has loaded, starts again the moment an internal link is tapped.
  var bar = document.createElement("div");
  bar.className = "jb-bar";
  bar.innerHTML = '<span class="jb-runner" data-char="builder" data-act="walk"></span>';
  document.body.appendChild(bar);
  function barGo() { bar.className = "jb-bar"; void bar.offsetWidth; bar.className = "jb-bar go"; }
  function barDone() { bar.className = "jb-bar go done"; }
  if (document.readyState === "complete") barDone(); else { barGo(); window.addEventListener("load", barDone); }
  window.addEventListener("pageshow", function (e) { if (e.persisted) barDone(); });  // back/forward cache
  function internal(a) {
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return false;
    var u = new URL(a.href, location.href);
    return u.origin === location.origin && !(u.pathname === location.pathname && u.hash);
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0 && internal(a)) barGo();
  });
  // Browsers without speculation rules: prefetch a page as soon as its link is hovered or touched.
  if (!(HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules"))) {
    var fetched = {};
    var warm = function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!internal(a)) return;
      var href = a.href.split("#")[0];
      if (fetched[href] || href === location.href.split("#")[0]) return;
      fetched[href] = 1;
      var l = document.createElement("link"); l.rel = "prefetch"; l.href = href; document.head.appendChild(l);
    };
    document.addEventListener("pointerover", warm, { passive: true });
    document.addEventListener("touchstart", warm, { passive: true });
  }
  // Lazy images fade in instead of popping.
  $$('img[loading="lazy"]').forEach(function (img) {
    if (img.complete && img.naturalWidth) return;
    img.classList.add("lazy");
    var show = function () { img.classList.add("in"); };
    img.addEventListener("load", show, { once: true });
    img.addEventListener("error", show, { once: true });
  });

  /* ---------------- countdown ---------------- */
  var launch = new Date(CFG.LAUNCH_DATE || "2026-11-01T00:00:00+07:00").getTime();
  var cds = $$("[data-countdown]");
  function tick() {
    var d = Math.max(0, launch - Date.now());
    var parts = [Math.floor(d / 864e5), Math.floor(d / 36e5) % 24, Math.floor(d / 6e4) % 60, Math.floor(d / 1e3) % 60];
    cds.forEach(function (cd) {
      $$("b", cd).forEach(function (b, i) { b.textContent = String(parts[i]).padStart(2, "0"); });
    });
  }
  if (cds.length) { tick(); setInterval(tick, 1000); }

  /* ---------------- visibility helper ---------------- */
  function onVisible(el, fn, once) {
    if (!el) return;
    if (!("IntersectionObserver" in window)) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { fn(); if (once !== false) io.disconnect(); }
      });
    }, { threshold: 0.25 });
    io.observe(el);
  }
  // Reveal as soon as an element starts entering (not at 25%), so fast scrolling never shows empty space.
  if ("IntersectionObserver" in window) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); rio.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0 });
    $$(".reveal").forEach(function (el) { rio.observe(el); });
  } else $$(".reveal").forEach(function (el) { el.classList.add("in"); });

  // Header tucks away while scrolling down and comes back on scroll up (more room on phones).
  var hdr = $(".site-header"), lastY = window.scrollY, ticking = false;
  if (hdr) window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY, dy = y - lastY;
      if (Math.abs(dy) > 6) {
        hdr.classList.toggle("tuck", dy > 0 && y > 180 && !(links && links.classList.contains("open")));
        lastY = y;
      }
      ticking = false;
    });
  }, { passive: true });
  if (links) $$("a", links).forEach(function (a) {
    a.addEventListener("click", function () { links.classList.remove("open"); if (menuBtn) menuBtn.setAttribute("aria-expanded", "false"); });
  });

  // Source links open the collapsed sources list.
  $$('a[href="#sources"]').forEach(function (a) { a.addEventListener("click", function () { var d = $("#sources details"); if (d) d.open = true; }); });

  // Swipe rows on phones get position dots.
  $$(".usp-grid, .how-grid").forEach(function (row) {
    var cards = Array.prototype.slice.call(row.children), dots = document.createElement("div");
    dots.className = "swipe-dots";
    dots.innerHTML = cards.map(function (c, i) { return '<button type="button" aria-label="' + (i + 1) + '"></button>'; }).join("");
    row.after(dots);
    var btns = $$("button", dots);
    function mark() {
      var step = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 1;
      var i = Math.max(0, Math.min(cards.length - 1, Math.round(row.scrollLeft / (step || 1))));
      btns.forEach(function (b, k) { b.classList.toggle("on", k === i); });
    }
    btns.forEach(function (b, i) { b.addEventListener("click", function () { row.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: "smooth" }); }); });
    row.addEventListener("scroll", function () { requestAnimationFrame(mark); }, { passive: true });
    mark();
  });

  /* ---------------- clip slots (videos cut from the Studio recording) ---------------- */
  var CLIPS = CFG.CLIPS || {};
  var SHOW_SLOTS = /[?&]slots\b/.test(location.search);
  // A clip entry is {src, kind, speed, prompt, steps, done}, a plain path, or the name of another slot.
  JB.clipInfo = function (key) {
    var c = CLIPS[key], n = 0;
    while (typeof c === "string" && CLIPS[c] && n++ < 5) c = CLIPS[c];
    return typeof c === "string" ? { src: c } : c || null;
  };
  JB.clip = function (key) { var c = JB.clipInfo(key); return c ? c.src : null; };
  // Mounts a muted video that only plays while on screen. onEnd → called when a non-looping clip finishes.
  // mp4 (H.264) first, WebM copy as fallback for browsers without H.264
  function sources(src) {
    return '<source src="' + src + '" type="video/mp4">' + (/\.mp4$/.test(src) ? '<source src="' + src.replace(/\.mp4$/, ".webm") + '" type="video/webm">' : "");
  }
  JB.mountClip = function (box, src, loop, onEnd) {
    box.innerHTML = '<video class="clip-video" muted playsinline preload="none"' + (loop ? " loop" : "") + ">" + sources(src) + "</video>";
    var v = box.querySelector("video");
    if (onEnd) v.addEventListener("ended", onEnd);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) v.play().catch(function () {}); else v.pause(); }); }, { threshold: 0.2 }).observe(v);
    } else v.play().catch(function () {});
    return v;
  };
  JB.slotLabel = function (box, key) {
    if (!SHOW_SLOTS) return;
    var old = box.querySelector(":scope > .slot-tag");
    if (old) old.remove();
    var tag = document.createElement("span");
    tag.className = "slot-tag" + (JB.clip(key) ? " ok" : "");
    tag.textContent = "clip: " + key + (JB.clip(key) ? " ✓" : " · empty");
    box.appendChild(tag);
  };

  /* Prompt player: the cursor clicks the JokiBlox prompt, types it, sends it, then the Studio clip runs
     with the agent's steps and a running clock. Hero variant adds the JokiBlox side panel. */
  var pick = function (pair) { return pair ? pair[lang() === "id" ? 1 : 0] : ""; };
  function clock(s, long) {
    s = Math.max(0, Math.floor(s));
    var h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = String(s % 60).padStart(2, "0");
    return long || h ? h + ":" + String(m).padStart(2, "0") + ":" + x : m + ":" + x;
  }
  function stepsOf(c) {  // normalise to {t, real, text}
    return (c.steps || []).map(function (st) {
      return st.length === 4 ? { t: st[0], real: st[1], text: pick([st[2], st[3]]) } : { t: st[0], real: null, text: pick([st[1], st[2]]) };
    });
  }
  function tagText(c, sec) {
    var sp = c.speed && c.speed !== 1 ? " · " + c.speed + "×" : "";
    if (c.kind === "replay" || (c.replayUntil && (sec || 0) < c.replayUntil)) return t("Replay of the real build", "Replay dari build asli") + sp;
    if (c.kind === "concept") return t("Concept on real game assets", "Konsep di aset game asli");
    return t("Studio recording", "Rekaman Studio") + sp;
  }
  JB.player = function (box, c, opts) {
    var hero = box.getAttribute("data-slot") === "hero";
    var run = 0, visible = false, warmed = false, raf = 0;
    box.classList.add("has-clip");
    var screen = '<div class="pp-screen"><video class="pp-v" muted playsinline preload="none" poster="' + c.src.replace(/\.mp4$/, ".jpg") + '">' + sources(c.src) + "</video>" +
      '<span class="pp-tag"><i></i><span data-pp-tag></span></span>' +
      (hero ? "" : '<div class="pp-chip"><i class="pp-dot"></i><span class="pp-step"></span><b class="pp-time">0:00</b></div>') +
      '<div class="pp-done"><b>✓</b><span></span></div><span class="pp-load" aria-hidden="true"></span>' +
      (hero ? "" : '<div class="pp-bar"><span class="pp-logo">J</span><span class="pp-text"></span><span class="pp-send">↑</span></div>') + "</div>";
    box.innerHTML = hero
      ? '<div class="pp pp-hero"><div class="pp-title"><i></i><i></i><i></i><span>Place1 — Roblox Studio</span></div><div class="pp-body">' + screen +
        '<aside class="pp-side"><div class="pp-side-h"><span class="pp-logo">J</span>JokiBlox<small>' + t("connected", "terhubung") + '</small></div>' +
        '<div class="pp-feed"><p class="pp-me"></p><ol class="pp-steps"></ol></div>' +
        '<div class="pp-bar"><span class="pp-text"></span><span class="pp-send">↑</span></div>' +
        '<div class="pp-clock">' + t("Real session time", "Waktu nyata sesi") + ' <b class="pp-time">0:00:00</b></div></aside></div>' +
        '<span class="pp-cursor" aria-hidden="true"></span></div>'
      : '<div class="pp">' + screen + '<span class="pp-cursor" aria-hidden="true"></span></div>';
    var pp = $(".pp", box), v = $("video", box), text = $(".pp-text", box), send = $(".pp-send", box);
    var cursor = $(".pp-cursor", box), stepEl = $(".pp-step", box), timeEl = $(".pp-time", box);
    var list = $(".pp-steps", box), me = $(".pp-me", box), doneEl = $(".pp-done span", box);
    function setState(s) { pp.setAttribute("data-state", s); }
    function warmPoster() {  // keep the skeleton until the first frame image is ready, then fade it in
      var img = new Image(), ok = function () { pp.classList.add("ready"); };
      img.onload = ok; img.onerror = ok; img.src = c.src.replace(/\.mp4$/, ".jpg");
      if (img.complete) ok();
    }
    warmPoster();
    v.addEventListener("loadeddata", function () { pp.classList.add("ready"); });
    v.addEventListener("waiting", function () { pp.classList.add("buffering"); });
    ["playing", "pause", "ended", "error"].forEach(function (ev) { v.addEventListener(ev, function () { pp.classList.remove("buffering"); }); });
    function load(nc) {  // swap to another clip in the same player (hero scenario chips)
      c = nc;
      v.poster = c.src.replace(/\.mp4$/, ".jpg");
      v.innerHTML = sources(c.src);
      v.load();
      warmPoster();
    }
    if (opts) opts.swap = function (nc) { load(nc); if (visible) cycle(); };
    var steps = [];
    function paintText() {
      steps = stepsOf(c);
      $("[data-pp-tag]", box).textContent = tagText(c);
      doneEl.textContent = pick(c.done);
      if (list) list.innerHTML = steps.map(function (st) {
        return "<li>" + (st.real != null ? "<time>" + clock(st.real, true) + "</time>" : "") + "<span>" + st.text + "</span></li>";
      }).join("");
    }
    function realAt(sec) {  // interpolate the real session clock between known stamps
      var pts = steps.filter(function (s) { return s.real != null; }).map(function (s) { return [s.t, s.real]; });
      if (!pts.length) return sec * (c.speed || 1);
      pts.push([v.duration || pts[pts.length - 1][0] + 1, c.end || pts[pts.length - 1][1]]);
      for (var i = pts.length - 1; i >= 0; i--) {
        if (sec >= pts[i][0]) {
          var b = pts[Math.min(i + 1, pts.length - 1)], a = pts[i];
          return b[0] === a[0] ? a[1] : a[1] + (b[1] - a[1]) * (sec - a[0]) / (b[0] - a[0]);
        }
      }
      return pts[0][1];
    }
    function paintTime() {
      var sec = v.currentTime || 0, idx = 0;
      steps.forEach(function (st, i) { if (sec >= st.t) idx = i; });
      if (stepEl && steps[idx] && stepEl.textContent !== steps[idx].text) stepEl.textContent = steps[idx].text;
      if (list) $$("li", list).forEach(function (li, i) { li.className = i < idx ? "done" : i === idx ? "on" : ""; });
      timeEl.textContent = clock(realAt(sec), hero);
      if (c.replayUntil) { var tg = $("[data-pp-tag]", box), tx = tagText(c, sec); if (tg.textContent !== tx) tg.textContent = tx; }
    }
    function loop() { paintTime(); if (!v.paused) raf = requestAnimationFrame(loop); }
    v.addEventListener("play", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); });
    var nap = function (my, ms) { return new Promise(function (res, rej) { setTimeout(function () { my === run ? res() : rej("cancel"); }, ms); }); };
    function point(el) {  // move the fake cursor onto an element (coordinates relative to the player)
      var a = pp.getBoundingClientRect(), b = el.getBoundingClientRect();
      cursor.style.transform = "translate(" + (b.left - a.left + b.width * .6) + "px," + (b.top - a.top + b.height * .55) + "px)";
    }
    function click() { cursor.classList.remove("click"); void cursor.offsetWidth; cursor.classList.add("click"); }
    async function cycle() {
      var my = ++run;
      try {
        v.pause(); try { v.currentTime = 0; } catch (e) {}
        paintText(); paintTime();
        text.textContent = ""; if (me) me.textContent = "";
        setState("idle");
        var prompt = pick(c.prompt);
        if (reduced) { text.textContent = prompt; if (me) me.textContent = prompt; setState("run"); v.controls = true; return; }
        cursor.style.transform = "translate(" + (pp.clientWidth * .78) + "px," + (pp.clientHeight * .35) + "px)";
        await nap(my, 600);
        point(text); await nap(my, 650); click(); setState("typing");
        var per = Math.max(14, Math.min(38, (hero ? 2600 : 1700) / prompt.length));
        for (var i = 1; i <= prompt.length; i++) { text.textContent = prompt.slice(0, i); await nap(my, per); }
        point(send); await nap(my, 500); click(); await nap(my, 220);
        if (me) { me.textContent = prompt; text.textContent = ""; }
        setState("run");
        if (v.readyState < 3) pp.classList.add("buffering");
        var ok = await v.play().then(function () { return true; }, function () { return false; });
        // if the video can't play here, hold the poster for a moment instead of hanging on "run"
        await (ok ? new Promise(function (res) { v.onended = res; }) : nap(my, 4000));
        if (my !== run) return;
        setState("done");
        await nap(my, hero ? 3200 : 2200);
        if (visible) { if (opts && opts.next) load(opts.next()); cycle(); }
      } catch (e) { if (e !== "cancel") throw e; }
    }
    function stop() { run++; v.pause(); }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          visible = e.isIntersecting;
          if (visible && !warmed) { warmed = true; v.preload = "auto"; v.load(); }
          if (visible) cycle(); else stop();
        });
      }, { threshold: 0.35 }).observe(pp);
    } else { visible = true; cycle(); }
    document.addEventListener("jb:lang", function () { if (visible) cycle(); else paintText(); });
    return pp;
  };

  // Plain looping clips used as decoration (e.g. the drone shot in the CTA)
  $$("[data-bgclip]").forEach(function (el) { JB.mountClip(el, el.getAttribute("data-bgclip"), true); });

  // Hero scenario chips: tap one to replay that feature in the hero player; otherwise they auto-advance.
  function heroOpts() {
    var box = $("[data-hero-chips]");
    if (!box) return null;
    var chips = $$("button", box), cur = 0;
    function mark(i) {
      cur = i;
      chips.forEach(function (b, k) { b.classList.toggle("on", k === i); b.setAttribute("aria-pressed", String(k === i)); });
      var key = chips[i].dataset.clip;
      $$(".hero-crew [data-for]").forEach(function (ch) {
        var on = (" " + ch.dataset.for + " ").indexOf(" " + key + " ") !== -1;
        ch.classList.toggle("called", on);
        if (on) { ch.classList.remove("hop"); void ch.offsetWidth; ch.classList.add("hop"); }
      });
      if (box.scrollWidth > box.clientWidth) box.scrollTo({ left: chips[i].offsetLeft - (box.clientWidth - chips[i].offsetWidth) / 2, behavior: "smooth" });
    }
    var o = { next: function () { mark((cur + 1) % chips.length); return JB.clipInfo(chips[cur].dataset.clip); } };
    chips.forEach(function (b, i) { b.addEventListener("click", function () { if (i !== cur) { mark(i); o.swap(JB.clipInfo(b.dataset.clip)); } }); });
    mark(0);
    return o;
  }
  $$("[data-slot]").forEach(function (slot) {
    var key = slot.dataset.slot, c = JB.clipInfo(key);
    if (c) JB.player(slot, c, key === "hero" ? heroOpts() : null);
    slot.classList.add("slot-ready");
    JB.slotLabel(slot, key);
  });

  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, reduced ? 0 : ms); }); };
  async function typeInto(el, text, speed) {
    el.classList.add("caret");
    el.textContent = "";
    if (reduced) { el.textContent = text; el.classList.remove("caret"); return; }
    for (var i = 0; i < text.length; i++) {
      el.textContent += text[i];
      await sleep(speed || 22);
    }
    el.classList.remove("caret");
  }

  /* ---------------- shared: iso blocks + blocky agent avatars ---------------- */
  var CUBE = function (top, left, right) {
    return '<svg viewBox="0 0 44 46"><path d="M22 0 44 11.5 22 23 0 11.5Z" fill="' + top + '"/><path d="M0 11.5 22 23V46L0 34.5Z" fill="' + left + '"/><path d="M22 23 44 11.5V34.5L22 46Z" fill="' + right + '"/></svg>';
  };
  var SKIN = {
    base: CUBE("#6b6e71", "#45484b", "#393b3d"),
    white: CUBE("#ffffff", "#c7c9cb", "#9a9c9e"),
    grey: CUBE("#bdbebe", "#8a8c8e", "#6b6e71"),
    dark: CUBE("#45484b", "#2c2f31", "#232527"),
    ok: CUBE("#2fe0a0", "#00b06f", "#008a57"),
  };
  // cells: [x, y, z, skin]; returns the block elements in paint order (hidden until .on)
  function placeBlocks(iso, list, ox, oy) {
    list = list.slice().sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]) || a[2] - b[2]; });
    iso.innerHTML = "";
    return list.map(function (c) {
      var el = document.createElement("div");
      el.className = "blk";
      el.style.left = ((ox == null ? 110 : ox) + (c[0] - c[1]) * 20) + "px";
      el.style.top = ((oy == null ? 30 : oy) + (c[0] + c[1]) * 11.5 - c[2] * 23) + "px";
      el.innerHTML = SKIN[c[3]];
      iso.appendChild(el);
      return el;
    });
  }
  // Agent avatars: blocky Roblox-style busts, each role in its own outfit + prop.
  var K = ' stroke="#0b0c0d" stroke-width="';
  var OUTFIT = {
    architect: { shirt: "#23314f",
      over: '<path d="M19.5 31 24 37l4.5-6" fill="#fff"' + K + '1.5" stroke-linejoin="round"/><path d="m24 36.5-1.6 2.2L24 45l1.6-6.3z" fill="#e5484d"' + K + '1"/>',
      hat: '<rect x="11" y="5" width="26" height="6" rx="3" fill="#0b0c0d"/><path d="m24 0 2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" fill="#ffd84d"' + K + '1"/>',
      prop: '<g transform="rotate(-25 41 38)"><rect x="37.5" y="31" width="7" height="15" rx="3.5" fill="#9cc9ff"' + K + '2"/><ellipse cx="41" cy="31.6" rx="3.5" ry="1.6" fill="#fff"' + K + '1.2"/></g>' },
    scripter: { shirt: "#26282c", eyes: "glasses",
      over: '<path d="M21 31v4M27 31v4" stroke="#fff" stroke-width="1.2"/><text x="24" y="43" text-anchor="middle" font-family="monospace" font-weight="700" font-size="7" fill="#3fe0a4">&lt;/&gt;</text>',
      hat: '<path d="M10 20a14 13 0 0 1 28 0" fill="none" stroke="#26282c" stroke-width="3"/><rect x="7" y="17" width="6" height="9" rx="2.5" fill="#00b06f"' + K + '1.5"/><rect x="35" y="17" width="6" height="9" rx="2.5" fill="#00b06f"' + K + '1.5"/>',
      prop: '<rect x="35" y="37" width="11" height="7.5" rx="1" fill="#c9cacc"' + K + '1.5"/><rect x="33" y="44" width="15" height="2.4" rx="1" fill="#0b0c0d"/>' },
    builder: { shirt: "#8a8c8e",
      over: '<path d="M13 34q0-3 3-3h3l2 15h-8z" fill="#ff8a00"/><path d="M35 34q0-3-3-3h-3l-2 15h8z" fill="#ff8a00"/><rect x="13" y="39" width="7" height="2" fill="#ffe14d"/><rect x="28" y="39" width="7" height="2" fill="#ffe14d"/>',
      hat: '<path d="M10 14a14 11 0 0 1 28 0z" fill="#ffc21a"' + K + '2"/><rect x="8" y="13" width="32" height="3" rx="1.5" fill="#0b0c0d"/><rect x="22.5" y="4" width="3" height="9" rx="1" fill="#e0a500"/>',
      prop: '<g transform="rotate(28 41 39)"><rect x="40" y="33" width="2.6" height="13" rx="1" fill="#a0652e"' + K + '1"/><rect x="36.5" y="30.5" width="9.6" height="4" rx="1" fill="#c9cacc"' + K + '1.2"/></g>' },
    ui: { shirt: "#ffffff",
      over: '<rect x="13" y="34" width="22" height="2" fill="#23314f"/><rect x="13" y="38" width="22" height="2" fill="#23314f"/><rect x="13" y="42" width="22" height="2" fill="#23314f"/>',
      hat: '<ellipse cx="22" cy="9.5" rx="13" ry="4.5" fill="#e5484d"' + K + '2"/><circle cx="20.5" cy="4.6" r="1.8" fill="#0b0c0d"/>',
      prop: '<path d="M37 33c6-2 11 2 10 7-1 4-5 3-6 5-1 2-6 1-6-4z" fill="#f2d7a0"' + K + '1.5"/><circle cx="41" cy="36" r="1.3" fill="#e5484d"/><circle cx="44" cy="38.4" r="1.3" fill="#2f6fed"/><circle cx="40.6" cy="40.2" r="1.3" fill="#00b06f"/>' },
    qa: { shirt: "#f2f4f5",
      over: '<path d="M24 31h-5l3 7zM24 31h5l-3 7z" fill="#d6d7d9"' + K + '1"/><path d="M24 34v12" stroke="#0b0c0d" stroke-width="1.2"/><circle cx="30" cy="41" r="2.2" fill="#00b06f"/>',
      hat: '<path d="M10 21a14 14 0 0 1 28 0" fill="none" stroke="#0b0c0d" stroke-width="3"/><rect x="7" y="18" width="6" height="9" rx="2" fill="#0b0c0d"/><rect x="35" y="18" width="6" height="9" rx="2" fill="#0b0c0d"/><path d="M38 27q0 4-6 4" fill="none" stroke="#0b0c0d" stroke-width="2"/>',
      prop: '<circle cx="41" cy="36" r="4" fill="#bfe6ff" fill-opacity=".7"' + K + '2"/><path d="m43.8 39 3.2 4" stroke="#0b0c0d" stroke-width="2.5" stroke-linecap="round"/>' },
    guard: { shirt: "#2a2c2f", eyes: "shades",
      over: '<path d="m24 34 5 1.8v3.6c0 3-2.3 4.8-5 5.6-2.7-.8-5-2.6-5-5.6v-3.6z" fill="#e5484d"' + K + '1.2"/><path d="m21.8 39.4 1.6 1.6 3-3.2" fill="none" stroke="#fff" stroke-width="1.3"/>',
      hat: '<path d="M12 14a12 9 0 0 1 24 0z" fill="#1b1c1e"' + K + '2"/><rect x="22" y="11.5" width="17" height="3.5" rx="1.7" fill="#1b1c1e"' + K + '1.5"/>',
      prop: '' }
  };
  function eyesOf(o) {
    return o.eyes === "shades" ? '<rect x="16" y="15.5" width="16" height="5.5" rx="2" fill="#0b0c0d"/><rect x="18" y="16.5" width="4" height="1.5" rx=".7" fill="#5b5e62"/>'
      : o.eyes === "glasses" ? '<rect x="15.5" y="15" width="8" height="7" rx="2" fill="none" stroke="#0b0c0d" stroke-width="2"/><rect x="24.5" y="15" width="8" height="7" rx="2" fill="none" stroke="#0b0c0d" stroke-width="2"/><rect x="18.5" y="17" width="2" height="3" rx="1" fill="#0b0c0d"/><rect x="27.5" y="17" width="2" height="3" rx="1" fill="#0b0c0d"/>'
      : '<rect x="18" y="16" width="3" height="5" rx="1.5" fill="#0b0c0d"/><rect x="27" y="16" width="3" height="5" rx="1.5" fill="#0b0c0d"/>';
  }
  function avatar(kind) {
    var o = OUTFIT[kind] || { shirt: "#8a8c8e", over: "", hat: "", prop: "" }, eyes = eyesOf(o);
    return '<svg viewBox="0 0 48 48" aria-hidden="true">' +
      '<rect x="13" y="31" width="22" height="15" rx="3" fill="' + o.shirt + '"/>' + o.over +
      '<rect x="13" y="31" width="22" height="15" rx="3" fill="none"' + K + '2"/>' +
      '<rect x="12" y="8" width="24" height="22" rx="5" fill="#fff"' + K + '2"/>' + eyes +
      '<path d="M19 25q5 3.5 10 0" fill="none" stroke="#0b0c0d" stroke-width="2" stroke-linecap="round"/>' +
      o.hat + o.prop + "</svg>";
  }
  $$("[data-avatar]").forEach(function (el) { el.innerHTML = avatar(el.dataset.avatar); });

  // Full-body JokiBlox characters (same outfits) with jointed arms/legs so CSS can animate them:
  // <span class="jbc" data-char="builder" data-act="hammer"></span>  acts: idle wave hammer type scan point paint block walk cheer
  var PANTS = { architect: "#1b2238", scripter: "#3a3d42", builder: "#2f5d9e", ui: "#2b2d31", qa: "#5b5e62", guard: "#1b1c1e" };
  var HELD = {
    architect: { r: '<g transform="rotate(-18 38.5 46)"><rect x="35.5" y="37" width="6" height="16" rx="3" fill="#9cc9ff"' + K + '1.8"/><ellipse cx="38.5" cy="37.6" rx="3" ry="1.4" fill="#fff"' + K + '1"/></g>' },
    builder: { r: '<rect x="37.2" y="35" width="2.4" height="15" rx="1" fill="#a0652e"' + K + '1"/><rect x="32.6" y="32" width="11.6" height="4.8" rx="1" fill="#c9cacc"' + K + '1.2"/>' },
    scripter: { front: '<rect x="14" y="36.5" width="20" height="12.5" rx="1.5" fill="#c9cacc"' + K + '1.5"/><circle cx="24" cy="42.7" r="1.6" fill="#3fe0a4"/><rect x="12" y="48.5" width="24" height="2.6" rx="1.2" fill="#0b0c0d"/>' },
    ui: { r: '<rect x="37.7" y="33" width="2" height="13" fill="#a0652e"/><path d="M37.2 33.4h3l-1.5-4.6z" fill="#e5484d"' + K + '.8"/>',
          l: '<ellipse cx="7" cy="46" rx="6.5" ry="4.2" fill="#f2d7a0"' + K + '1.4"/><circle cx="4.6" cy="45.2" r="1.1" fill="#e5484d"/><circle cx="7.4" cy="44.2" r="1.1" fill="#2f6fed"/><circle cx="9.6" cy="46.4" r="1.1" fill="#00b06f"/>' },
    qa: { r: '<path d="m39.6 41.6-1.6 3.6" stroke="#0b0c0d" stroke-width="2.4" stroke-linecap="round"/><circle cx="42" cy="37" r="4.6" fill="#bfe6ff" fill-opacity=".75"' + K + '2"/>' },
    guard: { l: '<path d="m7 34.6 6 2.2v4.3c0 3.6-2.8 5.8-6 6.8-3.2-1-6-3.2-6-6.8v-4.3z" fill="#e5484d"' + K + '1.4"/><path d="m4.4 41.2 1.9 1.9 3.6-3.8" fill="none" stroke="#fff" stroke-width="1.5"/>' }
  };
  function character(kind) {
    var o = OUTFIT[kind] || { shirt: "#8a8c8e", over: "", hat: "" }, h = HELD[kind] || {}, pants = PANTS[kind] || "#3a3d42";
    var leg = function (x, side) {
      return '<g class="ch-leg ' + side + '"><rect x="' + x + '" y="44" width="8.5" height="17" rx="2" fill="' + pants + '"' + K + '2"/><rect x="' + (x - .5) + '" y="59.5" width="9.5" height="5" rx="2" fill="#0b0c0d"/></g>';
    };
    var arm = function (x, side, held) {
      return '<g class="ch-arm ' + side + '"><rect x="' + x + '" y="31.5" width="7.5" height="13" rx="3" fill="' + o.shirt + '"' + K + '2"/>' + (held || "") +
        '<rect x="' + (x + .5) + '" y="42" width="6.5" height="5" rx="2.2" fill="#fff"' + K + '1.5"/></g>';
    };
    var torso = '<rect x="13" y="31" width="22" height="15" rx="3" fill="' + o.shirt + '"/>' + o.over + '<rect x="13" y="31" width="22" height="15" rx="3" fill="none"' + K + '2"/>';
    var head = '<g class="ch-head"><rect x="12" y="8" width="24" height="22" rx="5" fill="#fff"' + K + '2"/><g class="ch-eyes">' + eyesOf(o) + "</g>" +
      '<path d="M19 25q5 3.5 10 0" fill="none" stroke="#0b0c0d" stroke-width="2" stroke-linecap="round"/>' + o.hat + "</g>";
    return '<svg viewBox="0 0 48 68" aria-hidden="true"><ellipse class="ch-shadow" cx="24" cy="65.5" rx="12" ry="2" fill="#000" opacity=".28"/><g class="ch-body">' +
      leg(15, "l") + leg(24.5, "r") + arm(6, "l", h.l) + torso + arm(34.5, "r", h.r) + (h.front || "") + head + "</g></svg>";
  }
  JB.character = character;
  var charIO = "IntersectionObserver" in window && new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle("live", e.isIntersecting); });
  });
  JB.mountChars = function (scope) {
    $$("[data-char]", scope).forEach(function (el) {
      if (el.firstChild) return;
      el.innerHTML = character(el.dataset.char);
      el.classList.add("jbc", "act-" + (el.dataset.act || "idle"));
      if (charIO) charIO.observe(el); else el.classList.add("live");
    });
  };
  JB.mountChars(document);
  window.JB.placeBlocks = placeBlocks;
  window.JB.avatar = avatar;
  window.JB.typeInto = typeInto;
  window.JB.onVisible = onVisible;
  window.JB.reduced = reduced;

  /* ---------------- multiplayer squad board: parallel lanes + revision rounds ---------------- */
  var ROUNDS = [
    { you: ["Build a Sniper Arena from an empty baseplate.", "Buat Sniper Arena dari baseplate kosong."], all: true,
      lanes: { architect: ["12 steps, split across the squad", "12 tahap, dibagi ke squad"], builder: ["Arena: 4 zones, tower, bridges", "Arena: 4 zona, menara, jembatan"],
        scripter: ["Scope, headshots, bounty", "Scope, headshot, bounty"], ui: ["Lobby, Shop, Missions", "Lobby, Shop, Misi"],
        qa: ["Plays each merge", "Main tiap merge"], guard: ["Server checks on every remote", "Cek server di semua remote"] },
      img: "t-lobby", res: ["First playable at 11:42", "Bisa dimainkan di 11:42"] },
    { you: ["Make the bridges glow neon.", "Bikin jembatannya neon."], lanes: { builder: ["Neon on 4 bridges", "Neon di 4 jembatan"] },
      img: "t-map", res: ["Bridges updated", "Jembatan diperbarui"] },
    { you: ["Bots kill me every 25 seconds. Tone them down.", "Bot bunuh aku tiap 25 detik. Kurangi."],
      lanes: { scripter: ["Bot aim and reaction tuned", "Bidikan & reaksi bot disetel"], qa: ["Re-plays 3 rounds", "Main ulang 3 ronde"] },
      img: "t-play", res: ["Bots tuned, QA rechecked", "Bot disetel, dicek ulang QA"] },
    { you: ["Try a night mode.", "Coba mode malam."], lanes: { builder: ["Night lighting", "Lighting malam"] },
      img: "rev-night", res: ["Night mode on", "Mode malam aktif"] },
    { you: ["Nah, undo that.", "Nggak cocok, undo."], undo: true, img: "t-map", res: ["Back to the version before", "Kembali ke versi sebelumnya"] },
    { you: ["The jump pad doesn’t launch me.", "Jump pad-nya nggak melempar."],
      lanes: { qa: ["Reproduces it in Play mode", "Reproduksi di mode Play"], builder: ["Moves pads off the ramp", "Pindah pad dari ramp"] },
      img: "inside", res: ["Fixed and re-tested", "Diperbaiki & dites ulang"] },
    { you: ["Add a killcam when I die.", "Tambah killcam waktu aku mati."],
      lanes: { scripter: ["Orbit camera on the shooter", "Kamera orbit ke penembak"], ui: ["Killcam overlay", "Overlay killcam"], guard: ["Checks the new remote", "Cek remote baru"] },
      img: "t-review", res: ["Killcam added", "Killcam ditambahkan"] }
  ];
  $$("[data-board]").forEach(function (board) {
    var lanes = {}, thread = $("[data-bd-thread]", board), verEl = $("[data-bd-ver]", board), countEl = $("[data-bd-count]", board);
    $$("[data-lane]", board).forEach(function (li) { lanes[li.dataset.lane] = li; });
    var pickL = function (p) { return p[lang() === "id" ? 1 : 0]; };
    var wait = function (ms) { return new Promise(function (r) { setTimeout(r, reduced ? 0 : ms); }); };
    var stack = [], top = 0, revs = 0, undos = 0;  // version history: undo pops, a revision pushes a new number
    function setLane(key, text, state) {
      var li = lanes[key]; if (!li) return;
      li.className = state;
      if (text != null) $(".ln-t", li).textContent = text;
      var bar = $(".ln-bar b", li);
      bar.style.transition = "none"; bar.style.width = state === "work" ? "0%" : state === "done" ? "100%" : bar.style.width;
      if (state === "work") { void bar.offsetWidth; bar.style.transition = ""; bar.style.width = "100%"; }
    }
    function counter() {
      countEl.textContent = t("1 prompt · " + revs + " revisions · " + undos + " undo", "1 prompt · " + revs + " revisi · " + undos + " undo");
    }
    function bump(v) { verEl.textContent = "v" + v; verEl.classList.remove("pop"); void verEl.offsetWidth; verEl.classList.add("pop"); }
    async function play() {
      stack = []; top = 0; revs = 0; undos = 0; thread.innerHTML = ""; counter(); verEl.textContent = "v0";
      Object.keys(lanes).forEach(function (k) { setLane(k, "—", "idle"); $(".ln-bar b", lanes[k]).style.width = "0%"; });
      for (var r = 0; r < ROUNDS.length; r++) {
        var R = ROUNDS[r];
        $$(".bd-x", thread).forEach(function (x, i, all) { if (i < all.length - 1) x.remove(); else x.classList.add("old"); });
        var x = document.createElement("div"); x.className = "bd-x";
        var you = document.createElement("p"); you.className = "bd-you"; x.appendChild(you); thread.appendChild(x);
        await JB.typeInto(you, pickL(R.you), 18);
        you.classList.remove("caret");
        var keys = R.undo ? [] : Object.keys(R.lanes);
        if (!R.undo) {
          var to = document.createElement("span"); to.className = "bd-to";
          to.textContent = R.all ? t("→ whole squad, in parallel", "→ seluruh squad, paralel") : "→ " + keys.map(function (k) { return $(".ln-n", lanes[k]).textContent; }).join(" + ");
          x.appendChild(to);
          Object.keys(lanes).forEach(function (k) { if (keys.indexOf(k) === -1 && lanes[k].className !== "idle") setLane(k, null, "idle"); });
          keys.forEach(function (k, i) { lanes[k].style.setProperty("--d", (R.all ? 1.4 + i * .35 : 1.5) + "s"); setLane(k, pickL(R.lanes[k]), "work"); });
          await wait(R.all ? 3400 : 2000);
          keys.forEach(function (k) { setLane(k, null, "done"); });
        } else await wait(700);
        if (R.undo) { undos++; stack.pop(); } else { if (r) revs++; stack.push(++top); }
        var ver = stack[stack.length - 1];
        var res = document.createElement("div"); res.className = "bd-res" + (R.undo ? " undo" : "");
        res.innerHTML = '<img src="assets/clips/' + R.img + '.jpg" alt=""><span><b>' + pickL(R.res) + "</b><small>" +
          (R.undo ? t("one click, nothing lost", "sekali klik, tidak ada yang hilang") : t("saved as a version", "tersimpan sebagai versi")) +
          '</small></span><span class="v">' + (R.undo ? "↶ v" + ver : "v" + ver) + "</span>";
        x.appendChild(res);
        bump(ver); counter();
        await wait(2000);
      }
      await wait(2600);
      if (!reduced) play();
    }
    onVisible(board, function () { play(); });
  });

  /* ---------------- phone notifications ---------------- */
  $$("[data-notifs]").forEach(function (phone) {
    var items = $$(".notif", phone), i = 0;
    function step() {
      if (i === items.length) { items.forEach(function (n) { n.classList.remove("in"); }); i = 0; setTimeout(step, 900); return; }
      items[i++].classList.add("in");
      setTimeout(step, i === items.length ? 3200 : 1300);
    }
    onVisible(phone, function () { if (reduced) items.forEach(function (n) { n.classList.add("in"); }); else step(); });
  });

  /* ---------------- migration demo ---------------- */
  $$("[data-demo=migrate]").forEach(function (box) {
    var lines = $$(".ln[data-new]", box), timer = $(".timer", box), bar = $(".progress b", box), fixed = $(".fixed", box);
    var originals = lines.map(function (l) { return l.innerHTML; });
    async function run() {
      lines.forEach(function (l, i) { l.innerHTML = originals[i]; l.classList.remove("add", "del"); });
      fixed.textContent = "0/" + lines.length;
      bar.style.width = "0";
      var secs = 0;
      for (var i = 0; i < lines.length; i++) {
        lines[i].classList.add("del");
        await sleep(650);
        var n = lines[i].querySelector(".n").outerHTML;
        lines[i].innerHTML = n + lines[i].dataset.new;
        lines[i].classList.remove("del");
        lines[i].classList.add("add");
        secs += 95 + Math.round(Math.random() * 40);
        timer.textContent = String(Math.floor(secs / 60)).padStart(2, "0") + ":" + String(secs % 60).padStart(2, "0");
        fixed.textContent = (i + 1) + "/" + lines.length;
        bar.style.width = ((i + 1) / lines.length * 100) + "%";
        await sleep(450);
      }
      await sleep(4200);
      run();
    }
    onVisible(box, run);
  });

  /* ---------------- UGC demo ---------------- */
  $$("[data-demo=ugc]").forEach(function (box) {
    var chips = $$(".chip", box), prompt = $(".prompt-box", box), shirt = $(".shirt-fill", box), prev = $(".ugc-preview", box), checks = $$(".checks div", box);
    var idx = 0, timerId = null, busy = false;
    async function gen(i) {
      if (busy) return;
      busy = true;
      idx = i;
      chips.forEach(function (c, k) { c.classList.toggle("on", k === i); });
      checks.forEach(function (c) { c.classList.remove("on"); });
      await typeInto(prompt, chips[i].dataset["p" + (lang() === "id" ? "Id" : "En")] || chips[i].textContent, 16);
      prev.classList.remove("gen"); void prev.offsetWidth; prev.classList.add("gen");
      await sleep(600);
      shirt.setAttribute("fill", "url(#" + chips[i].dataset.pattern + ")");
      for (var k = 0; k < checks.length; k++) { await sleep(320); checks[k].classList.add("on"); }
      busy = false;
    }
    function loop() { gen((idx + 1) % chips.length); timerId = setTimeout(loop, 5200); }
    chips.forEach(function (c, i) { c.addEventListener("click", function () { clearTimeout(timerId); gen(i); timerId = setTimeout(loop, 8000); }); });
    onVisible(box, function () { gen(0); timerId = setTimeout(loop, 5200); });
  });

  /* ---------------- before/after meters ---------------- */
  $$("[data-demo=meters]").forEach(function (box) {
    onVisible(box, function () { $$(".bar b", box).forEach(function (b) { b.style.width = b.dataset.w; }); });
  });

  /* ---------------- model router ---------------- */
  $$("[data-demo=router]").forEach(function (box) {
    var tasks = $$(".tasks .row", box), models = $$(".models .row", box), i = 0;
    function step() {
      tasks.concat(models).forEach(function (r) { r.classList.remove("hot"); });
      var task = tasks[i++ % tasks.length];
      task.classList.add("hot");
      var m = models.filter(function (r) { return r.dataset.model === task.dataset.model; })[0];
      if (m) m.classList.add("hot");
    }
    onVisible(box, function () { step(); if (!reduced) setInterval(step, 1600); });
  });

  /* ---------------- pricing ---------------- */
  var billing = $(".billing");
  function money(n) { return "$" + (Math.round(n * 100) % 100 === 0 ? Math.round(n) : n.toFixed(2)); }
  function renderPrices(mode) {
    var disc = CFG.EARLY_DISCOUNT == null ? 0.2 : CFG.EARLY_DISCOUNT;
    var paid = CFG.YEARLY_MONTHS_PAID || 10;
    $$("[data-price]").forEach(function (plan) {
      var base = parseFloat(plan.dataset.price);
      var monthly = mode === "yearly" ? base * paid / 12 : base;
      var now = $(".now", plan), was = $(".was", plan), note = $(".early-note", plan), per = $(".per", plan);
      if (base === 0) { now.textContent = "$0"; was.textContent = ""; note.innerHTML = "&nbsp;"; return; }
      was.textContent = money(monthly);
      now.textContent = money(monthly * (1 - disc));
      per.innerHTML = mode === "yearly"
        ? t("/mo · billed " + money(base * paid * (1 - disc)) + "/yr", "/bln · ditagih " + money(base * paid * (1 - disc)) + "/thn")
        : t("/mo", "/bln");
      note.textContent = t("−" + Math.round(disc * 100) + "% early-bird · waitlist only", "−" + Math.round(disc * 100) + "% early-bird · khusus waitlist");
    });
  }
  if (billing) {
    var mode = "monthly";
    $$("button", billing).forEach(function (b) {
      b.addEventListener("click", function () {
        mode = b.dataset.mode;
        $$("button", billing).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        renderPrices(mode);
      });
    });
    renderPrices(mode);
    document.addEventListener("jb:lang", function () { renderPrices(mode); });
  }
})();
