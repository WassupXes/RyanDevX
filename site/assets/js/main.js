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

  /* ---------------- hero: Studio demo + prompt bar ---------------- */
  var studio = $("[data-demo=studio]");
  if (studio) {
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
          var b = [];
          var path = [[0, 3], [0, 2], [1, 2], [1, 1], [2, 1], [3, 1], [3, 0]];
          path.forEach(function (p, i) { var z = Math.min(i, 3); b.push([p[0], p[1], 0, "base"]); for (var k = 1; k <= z; k++) b.push([p[0], p[1], k, k === z ? (i === path.length - 1 ? "ok" : "white") : "grey"]); });
          return b;
        },
      },
      {
        prompt: ["Make a pet simulator with 3 zones, egg hatching, pet inventory and a 2× luck gamepass.",
                 "Bikin pet simulator dengan 3 zona, buka telur, inventori pet dan gamepass 2× luck."],
        tree: ["Workspace/Zones", "Workspace/Eggs", "ServerScriptService/CurrencyService", "ServerScriptService/EggHatch", "ReplicatedStorage/PetData", "StarterGui/PetInventory", "StarterGui/ShopUI"],
        log: [["Builder", "3 zones + portals ✓"], ["Scripter", "EggHatch rarity table ✓"], ["UI", "PetInventory (mobile) ✓"], ["QA", "8-player playtest ✓"]],
        blocks: function () {
          var b = [];
          for (var x = 0; x < 4; x++) for (var y = 0; y < 4; y++) b.push([x, y, 0, x < 2 ? "base" : "grey"]);
          b.push([0, 0, 1, "white"], [0, 0, 2, "white"], [3, 3, 1, "dark"], [3, 3, 2, "dark"], [3, 3, 3, "ok"], [1, 2, 1, "white"], [2, 1, 1, "ok"]);
          return b;
        },
      },
    ];
    var iso = $(".iso", studio), tree = $(".explorer .items", studio), chat = $(".chat", studio);
    var heroRun = 0, sceneIdx = 0, userDriven = false;
    function pickScene(text) {
      var s = (text || "").toLowerCase();
      if (/obby|parkour|stage|lompat/.test(s)) return 1;
      if (/pet|egg|telur|hatch|simulator/.test(s)) return 2;
      return 0;
    }
    async function runScene(idx, customPrompt) {
      var my = ++heroRun;
      var alive = function () { if (my !== heroRun) throw "cancel"; };
      var nap = function (ms) { return sleep(ms).then(alive); };
      try {
        var s = SCENES[idx];
        chat.innerHTML = '<div class="msg"><div class="av">YOU</div><div class="txt" data-p></div></div>';
        tree.innerHTML = "";
        var blocks = placeBlocks(iso, s.blocks());
        await typeInto($("[data-p]", chat), customPrompt || s.prompt[lang() === "id" ? 1 : 0], 18);
        alive();
        await nap(350);
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
          await nap(110);
        }
        var done = document.createElement("div");
        done.innerHTML = "<span class=ok>" + t("Done in 3m 42s · ready to review", "Selesai 3m 42d · siap direview") + "</span>";
        log.appendChild(done);
        await nap(userDriven ? 9000 : 3800);
        userDriven = false;
        sceneIdx = (idx + 1) % SCENES.length;
        runScene(sceneIdx);
      } catch (e) { if (e !== "cancel") throw e; }
    }
    var input = $("[data-hero-input]"), go = $("[data-hero-go]");
    function userBuild(idx, text) {
      userDriven = true;
      $$("[data-scene]").forEach(function (c) { c.classList.toggle("on", +c.dataset.scene === idx); });
      runScene(idx, text);
    }
    $$("[data-scene]").forEach(function (c) {
      c.addEventListener("click", function () { if (input) input.value = ""; userBuild(+c.dataset.scene); });
    });
    if (input && go) {
      var submit = function () {
        var v = input.value.trim().slice(0, 140);
        if (!v) { input.focus(); return; }
        userBuild(pickScene(v), v);
      };
      go.addEventListener("click", submit);
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
    }
    onVisible(studio, function () { runScene(0); });
  }

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
