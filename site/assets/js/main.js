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
    var p = (a.getAttribute("href") || "").split("/").pop().replace(".html", "").split("#")[0] || "index";
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

  /* ---------------- hero: Studio demo ---------------- */
  var studio = $("[data-demo=studio]");
  if (studio) {
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
    var SCENES = [
      {
        prompt: ["Build a tycoon: 3 droppers, conveyor, rebirth system and daily rewards. Mobile-friendly UI.",
                 "Bikin tycoon: 3 dropper, conveyor, sistem rebirth dan daily reward. UI ramah HP."],
        tree: ["Workspace/Tycoon", "Workspace/Tycoon/Droppers", "Workspace/Tycoon/Conveyor", "ServerScriptService/TycoonService", "ServerScriptService/RebirthService", "ReplicatedStorage/Remotes", "StarterGui/TycoonHUD", "ServerScriptService/DailyRewards"],
        log: [["Scripter", "TycoonService.lua ✓"], ["Builder", "12 parts placed ✓"], ["UI", "TycoonHUD scaled for mobile ✓"], ["QA", "Playtest 0 errors ✓"]],
        blocks: function () {
          var b = [];
          for (var x = 0; x < 4; x++) for (var y = 0; y < 4; y++) b.push([x, y, 0, "base"]);
          b.push([0, 0, 1, "grey"], [0, 0, 2, "white"], [1, 0, 1, "grey"], [2, 0, 1, "grey"], [3, 0, 1, "white"]);
          b.push([0, 3, 1, "dark"], [1, 3, 1, "dark"], [2, 3, 1, "dark"], [3, 3, 1, "dark"], [3, 2, 1, "ok"]);
          return b;
        },
      },
      {
        prompt: ["Make a 20-stage obby with checkpoints, a timer leaderboard and a skip-stage gamepass.",
                 "Buat obby 20 stage dengan checkpoint, leaderboard waktu dan gamepass skip stage."],
        tree: ["Workspace/Stages", "Workspace/Stages/Checkpoints", "ServerScriptService/StageService", "ServerScriptService/Leaderboard", "ServerScriptService/MarketplaceHandler", "StarterGui/TimerUI", "ReplicatedStorage/Config"],
        log: [["Builder", "20 stages generated ✓"], ["Scripter", "Checkpoints + DataStore ✓"], ["Monetize", "Skip-stage gamepass wired ✓"], ["QA", "Fall-reset tested ✓"]],
        blocks: function () {
          var b = [], z = 0;
          var path = [[0, 3], [0, 2], [1, 2], [1, 1], [2, 1], [3, 1], [3, 0]];
          path.forEach(function (p, i) { z = Math.min(i, 3); b.push([p[0], p[1], 0, "base"]); for (var k = 1; k <= z; k++) b.push([p[0], p[1], k, k === z ? (i === path.length - 1 ? "ok" : "white") : "grey"]); });
          return b;
        },
      },
    ];
    var iso = $(".iso", studio), tree = $(".explorer .items", studio), chat = $(".chat", studio);
    function placeBlocks(list) {
      list.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]) || a[2] - b[2]; });
      iso.innerHTML = "";
      return list.map(function (c) {
        var el = document.createElement("div");
        el.className = "blk";
        el.style.left = (110 + (c[0] - c[1]) * 20) + "px";
        el.style.top = (30 + (c[0] + c[1]) * 11.5 - c[2] * 23) + "px";
        el.innerHTML = SKIN[c[3]];
        iso.appendChild(el);
        return el;
      });
    }
    var sceneIdx = 0;
    async function runScene() {
      var s = SCENES[sceneIdx++ % SCENES.length];
      var L = lang() === "id" ? 1 : 0;
      chat.innerHTML = '<div class="msg"><div class="av">YOU</div><div class="txt" data-p></div></div>';
      tree.innerHTML = "";
      var blocks = placeBlocks(s.blocks());
      await typeInto($("[data-p]", chat), s.prompt[L], 20);
      await sleep(350);
      var ai = document.createElement("div");
      ai.className = "msg";
      ai.innerHTML = '<div class="av ai">JB</div><div class="txt"><b>JokiBlox Agent</b> · ' + t("Spawning 4 agents in parallel…", "Menjalankan 4 agent paralel…") + '<div class="log"></div></div>';
      chat.appendChild(ai);
      var log = $(".log", ai);
      var treeEls = s.tree.map(function (n) { var d = document.createElement("div"); d.textContent = n; tree.appendChild(d); return d; });
      var total = Math.max(blocks.length, treeEls.length);
      for (var i = 0; i < total; i++) {
        if (blocks[i]) blocks[i].classList.add("on");
        if (treeEls[i]) treeEls[i].classList.add("on", "new");
        var li = Math.floor(i / total * s.log.length);
        if (i % Math.ceil(total / s.log.length) === 0 && s.log[li]) {
          var row = document.createElement("div");
          row.innerHTML = "[" + s.log[li][0] + "] <span class=ok>" + s.log[li][1] + "</span>";
          log.appendChild(row);
        }
        await sleep(110);
      }
      var done = document.createElement("div");
      done.innerHTML = "<span class=ok>" + t("Done in 3m 42s · published to Studio", "Selesai 3m 42d · terkirim ke Studio") + "</span>";
      log.appendChild(done);
      await sleep(3800);
      runScene();
    }
    onVisible(studio, runScene);
  }

  /* ---------------- multiplayer race ---------------- */
  $$("[data-demo=race]").forEach(function (race) {
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
