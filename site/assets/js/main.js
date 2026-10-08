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
  $$(".reveal").forEach(function (el) { onVisible(el, function () { el.classList.add("in"); }); });

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
  JB.player = function (box, c) {
    var hero = box.getAttribute("data-slot") === "hero";
    var run = 0, visible = false, warmed = false, raf = 0;
    box.classList.add("has-clip");
    var screen = '<div class="pp-screen"><video class="pp-v" muted playsinline preload="none" poster="' + c.src.replace(/\.mp4$/, ".jpg") + '">' + sources(c.src) + "</video>" +
      '<span class="pp-tag"><i></i><span data-pp-tag></span></span>' +
      (hero ? "" : '<div class="pp-chip"><i class="pp-dot"></i><span class="pp-step"></span><b class="pp-time">0:00</b></div>') +
      '<div class="pp-done"><b>✓</b><span></span></div>' +
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
        var ok = await v.play().then(function () { return true; }, function () { return false; });
        // if the video can't play here, hold the poster for a moment instead of hanging on "run"
        await (ok ? new Promise(function (res) { v.onended = res; }) : nap(my, 4000));
        if (my !== run) return;
        setState("done");
        await nap(my, hero ? 3200 : 2200);
        if (visible) cycle();
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

  $$("[data-slot]").forEach(function (slot) {
    var key = slot.dataset.slot, c = JB.clipInfo(key);
    if (c) JB.player(slot, c);
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
  var HATS = {
    architect: '<rect x="11" y="5" width="26" height="6" rx="3" fill="#0b0c0d"/><path d="m24 0 2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" fill="#ffd84d" stroke="#0b0c0d" stroke-width="1"/>',
    scripter: '<rect x="12" y="6" width="24" height="6" rx="3" fill="#0b0c0d"/><rect x="15.5" y="15" width="8" height="7" rx="2" fill="none" stroke="#0b0c0d" stroke-width="2"/><rect x="24.5" y="15" width="8" height="7" rx="2" fill="none" stroke="#0b0c0d" stroke-width="2"/>',
    builder: '<path d="M10 14a14 11 0 0 1 28 0z" fill="#00b06f" stroke="#0b0c0d" stroke-width="2"/><rect x="8" y="13" width="32" height="3" rx="1.5" fill="#0b0c0d"/>',
    ui: '<ellipse cx="22" cy="9" rx="12" ry="4.5" fill="#0b0c0d"/><circle cx="22" cy="4.5" r="2" fill="#0b0c0d"/>',
    qa: '<path d="M10 21a14 14 0 0 1 28 0" fill="none" stroke="#0b0c0d" stroke-width="3"/><rect x="7" y="18" width="6" height="9" rx="2" fill="#0b0c0d"/><rect x="35" y="18" width="6" height="9" rx="2" fill="#0b0c0d"/><path d="M38 27q0 4-6 4" fill="none" stroke="#0b0c0d" stroke-width="2"/>',
  };
  function avatar(kind) {
    var glasses = kind === "scripter";
    return '<svg viewBox="0 0 48 48" aria-hidden="true">' +
      '<rect x="13" y="31" width="22" height="15" rx="3" fill="#8a8c8e" stroke="#0b0c0d" stroke-width="2"/>' +
      '<rect x="12" y="8" width="24" height="22" rx="5" fill="#fff" stroke="#0b0c0d" stroke-width="2"/>' +
      (glasses ? "" : '<rect x="18" y="16" width="3" height="5" rx="1.5" fill="#0b0c0d"/><rect x="27" y="16" width="3" height="5" rx="1.5" fill="#0b0c0d"/>') +
      (glasses ? '<rect x="18.5" y="17" width="2" height="3" rx="1" fill="#0b0c0d"/><rect x="27.5" y="17" width="2" height="3" rx="1" fill="#0b0c0d"/>' : "") +
      '<path d="M19 25q5 3.5 10 0" fill="none" stroke="#0b0c0d" stroke-width="2" stroke-linecap="round"/>' +
      (HATS[kind] || "") + "</svg>";
  }
  $$("[data-avatar]").forEach(function (el) { el.innerHTML = avatar(el.dataset.avatar); });
  window.JB.placeBlocks = placeBlocks;
  window.JB.avatar = avatar;
  window.JB.typeInto = typeInto;
  window.JB.onVisible = onVisible;
  window.JB.reduced = reduced;

  /* ---------------- multiplayer race ---------------- */
  $$("[data-demo=race], [data-demo=race2]").forEach(function (race) {
    onVisible(race, function () {
      race.classList.add("run");
      $$("[data-count]", race).forEach(function (el) {
        var end = parseFloat(el.dataset.count), dur = parseFloat(el.dataset.dur || 3) * 1000, start = performance.now();
        var unit = el.dataset.unit || "";
        (function step(now) {
          var p = reduced ? 1 : Math.min(1, (now - start) / dur);
          el.textContent = (end * p).toFixed(end % 1 ? 1 : 0) + unit;
          if (p < 1) requestAnimationFrame(step);
        })(start);
      });
    });
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
