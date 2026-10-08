/* Animated feature demos: home "feature theater" + per-feature stages on the products page. */
(function () {
  "use strict";
  if (!window.JB) return;
  var JB = window.JB, t = JB.t;
  var CANCEL = { cancel: true };
  var q = function (s, el) { return el.querySelector(s); };
  var qa = function (s, el) { return Array.prototype.slice.call(el.querySelectorAll(s)); };
  var raw = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var uid = 0;

  /* ---------- shared drawings ---------- */
  var TYCOON = (function () {
    var b = [];
    for (var x = 0; x < 4; x++) for (var y = 0; y < 4; y++) b.push([x, y, 0, "base"]);
    b.push([0, 0, 1, "grey"], [0, 0, 2, "white"], [1, 0, 1, "grey"], [2, 0, 1, "grey"], [3, 0, 1, "white"],
           [0, 3, 1, "dark"], [1, 3, 1, "dark"], [2, 3, 1, "dark"], [3, 3, 1, "dark"], [3, 2, 1, "ok"]);
    return b;
  })();
  function upgraded(cells) {
    return cells.map(function (c) {
      var skin = c[3] === "base" ? "grey" : c[3] === "dark" ? "white" : c[3] === "grey" ? "white" : c[3];
      return [c[0], c[1], c[2], skin];
    }).concat([[1, 1, 1, "ok"], [2, 2, 1, "white"], [2, 2, 2, "ok"]]);
  }
  function chest(body, side, trim, gem) {
    return '<svg viewBox="0 0 120 104" aria-hidden="true">' +
      '<path d="M20 44 60 64V98L20 78Z" fill="' + side + '"/><path d="M60 64 100 44V78L60 98Z" fill="' + body + '"/>' +
      '<path d="M20 30 60 50V64L20 44Z" fill="' + side + '"/><path d="M60 50 100 30V44L60 64Z" fill="' + body + '"/>' +
      '<path d="M60 10 100 30 60 50 20 30Z" fill="' + body + '" opacity=".9"/>' +
      '<path d="M78 41 84 38V72L78 75Z M36 38 42 41V75L36 72Z" fill="' + trim + '"/>' +
      '<path d="M20 44 60 64 100 44" fill="none" stroke="' + trim + '" stroke-width="3"/>' +
      (gem ? '<rect x="44" y="60" width="9" height="11" rx="2" fill="' + gem + '" transform="skewY(26.6)" transform-origin="48 65"/>' : "") +
      "</svg>";
  }
  var CHESTS = [
    chest("#8a5a2b", "#6b4420", "#ffd84d", "#00b06f"),
    chest("#6b6e71", "#45484b", "#ffd84d", ""),
    chest("#a46a35", "#7d4f26", "#c7c9cb", "#ffd84d"),
    chest("#45484b", "#2c2f31", "#00b06f", "#ffffff"),
  ];
  function mannequin(fill, id) {
    return '<svg viewBox="0 0 160 236" aria-hidden="true"><defs>' + PATTERNS(id) + "</defs>" +
      '<rect x="55" y="6" width="50" height="46" rx="11" fill="#fff" stroke="#0b0c0d" stroke-width="3"/>' +
      '<rect x="69" y="22" width="5" height="9" rx="2.5" fill="#0b0c0d"/><rect x="86" y="22" width="5" height="9" rx="2.5" fill="#0b0c0d"/>' +
      '<path d="M70 38q10 7 20 0" fill="none" stroke="#0b0c0d" stroke-width="3" stroke-linecap="round"/>' +
      '<g class="cloth" fill="' + fill + '" stroke="#0b0c0d" stroke-width="3">' +
      '<rect x="44" y="56" width="72" height="82" rx="6"/><rect x="14" y="58" width="27" height="76" rx="6"/><rect x="119" y="58" width="27" height="76" rx="6"/></g>' +
      '<rect x="46" y="140" width="33" height="88" rx="6" fill="#45484b" stroke="#0b0c0d" stroke-width="3"/>' +
      '<rect x="81" y="140" width="33" height="88" rx="6" fill="#45484b" stroke="#0b0c0d" stroke-width="3"/></svg>';
  }
  function PATTERNS(id) {
    return '<pattern id="b' + id + '" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="#191b1d"/><path d="M14 2 26 14 14 26 2 14Z" fill="none" stroke="#c7a24a" stroke-width="2"/><circle cx="14" cy="14" r="4" fill="#fff"/><circle cx="0" cy="0" r="3" fill="#9a9c9e"/><circle cx="28" cy="28" r="3" fill="#9a9c9e"/></pattern>' +
      '<pattern id="c' + id + '" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#0b0c0d"/><path d="M14 0H0V14" fill="none" stroke="#00b06f" stroke-width="1.5"/></pattern>' +
      '<pattern id="j' + id + '" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="16" height="16" fill="#2c2f31"/><rect width="7" height="16" fill="#e3e5e7"/></pattern>' +
      '<pattern id="p' + id + '" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#f2f4f5"/><circle cx="6" cy="6" r="2.6" fill="#45484b"/></pattern>';
  }
  /* ---------- scenes ---------- */
  var SCENES = {
    create: async function (s, nap) {
      s.innerHTML = '<div class="fx fx-create">' +
        '<div class="fx-prompt"><span class="pp">YOU</span><span data-typed></span></div>' +
        '<div class="fx-vp"><div class="iso"></div><span class="fx-chip ok" data-badge hidden></span></div>' +
        '<div class="fx-tl"><div class="tl-bar"><b></b></div><div class="tl-steps">' +
        [t("Plan", "Rencana"), t("Build", "Bangun"), "QA", t("Playable", "Siap main")].map(function (x) { return "<span>" + x + "</span>"; }).join("") +
        '</div><b class="tl-time" data-time>0 min</b></div></div>';
      var blocks = JB.placeBlocks(q(".iso", s), TYCOON, 110, 30);
      await JB.typeInto(q("[data-typed]", s), t("Tycoon with 3 droppers, rebirths and a VIP gamepass", "Tycoon dengan 3 dropper, rebirth dan gamepass VIP"), 16);
      await nap(300);
      var bar = q(".tl-bar b", s), steps = qa(".tl-steps span", s), time = q("[data-time]", s);
      for (var i = 0; i < blocks.length; i++) {
        blocks[i].classList.add("on");
        var p = (i + 1) / blocks.length;
        bar.style.width = (p * 100) + "%";
        steps.forEach(function (st, k) { st.classList.toggle("on", p >= k / 3.2); });
        time.textContent = Math.round(p * 24) + " min";
        await nap(140);
      }
      var badge = q("[data-badge]", s);
      badge.hidden = false;
      badge.textContent = t("Playable ✓ · 4 agents · 24 min", "Siap main ✓ · 4 agent · 24 mnt");
      await nap(2600);
    },

    clone: async function (s, nap) {
      s.innerHTML = '<div class="fx fx-clone">' +
        '<div class="cl-card orig"><div class="cl-head"><b>MyTycoon</b><small>' + t("original", "asli") + '</small></div><div class="cl-map"><div class="iso"></div></div>' +
        '<ul class="cl-stats"><li class="bad" data-k="fps">FPS 28</li><li class="bad" data-k="err">48 ' + t("errors/hr", "error/jam") + '</li><li class="bad" data-k="ui">' + t("PC-only UI", "UI khusus PC") + "</li></ul></div>" +
        '<div class="cl-arrow"><span>' + t("Clone", "Clone") + '</span><i></i></div>' +
        '<div class="cl-card copy" data-copy><div class="cl-head"><b>MyTycoon v2</b><small>' + t("upgraded copy", "salinan upgrade") + '</small></div><div class="cl-map"><div class="iso"></div><div class="cl-layers"></div></div>' +
        '<ul class="cl-stats"><li class="bad" data-k="fps">FPS 28</li><li class="bad" data-k="err">48 ' + t("errors/hr", "error/jam") + '</li><li class="bad" data-k="ui">' + t("PC-only UI", "UI khusus PC") + "</li></ul></div>" +
        '<p class="cl-note">' + t("Your original stays untouched · undo anything", "Game asli tidak disentuh · semua bisa di-undo") + "</p></div>";
      var o = JB.placeBlocks(q(".orig .iso", s), TYCOON, 110, 30);
      o.forEach(function (b) { b.classList.add("on"); });
      await nap(900);
      var copy = q("[data-copy]", s);
      copy.classList.add("in");
      q(".cl-arrow", s).classList.add("go");
      var c = JB.placeBlocks(q(".copy .iso", s), TYCOON, 110, 30);
      for (var i = 0; i < c.length; i++) { c[i].classList.add("on"); if (i % 3 === 0) await nap(40); }
      await nap(700);
      var layers = q(".cl-layers", s);
      var ups = [
        [t("Lighting pass", "Pencahayaan baru"), null],
        [t("Mobile UI", "UI mobile"), ["ui", t("Mobile ✓", "Mobile ✓")]],
        [t("Perf: −45% memory", "Perf: memori −45%"), ["fps", "FPS 58"]],
        [t("Anti-exploit", "Anti-exploit"), ["err", "2 " + t("errors/hr", "error/jam")]],
        [t("Daily rewards", "Daily reward"), null],
      ];
      for (var k = 0; k < ups.length; k++) {
        var chip = document.createElement("span");
        chip.className = "layer";
        chip.textContent = "+ " + ups[k][0];
        layers.appendChild(chip);
        if (k === 0) { var c2 = JB.placeBlocks(q(".copy .iso", s), upgraded(TYCOON), 110, 30); c2.forEach(function (b) { b.classList.add("on"); }); }
        if (ups[k][1]) {
          var li = q('.copy [data-k="' + ups[k][1][0] + '"]', s);
          li.textContent = ups[k][1][1];
          li.className = "good";
        }
        await nap(750);
      }
      await nap(2400);
    },

    migrate: async function (s, nap) {
      var tiles = [
        ["Chat", t("Legacy chat", "Legacy chat"), "TextChatService"],
        [t("Physics", "Fisika"), "BodyVelocity ×14", "LinearVelocity"],
        ["Audio", t("9 private sounds", "9 audio private"), t("Re-uploaded", "Diunggah ulang")],
        ["Scripts", "212 × wait()", "task.wait()"],
        ["Remotes", t("6 unsecured", "6 tidak aman"), t("Rate-limited", "Dibatasi")],
        [t("Errors", "Error"), t("31 runtime", "31 runtime"), "0"],
      ];
      s.innerHTML = '<div class="fx fx-migrate"><div class="mg-top"><span>' + t("Game health", "Kesehatan game") + ' <b data-h>34%</b></span><span>' + t("AI time", "Waktu AI") + ' <b data-time>0:00</b></span><span class="mg-hand">' + t("By hand ~2 days", "Manual ~2 hari") + "</span></div>" +
        '<div class="mg-grid">' + tiles.map(function (x) {
          return '<div class="mg-tile bad"><small>' + x[0] + '</small><b data-old>' + x[1] + '</b><b data-new hidden>' + x[2] + '</b><i class="mg-dot"></i></div>';
        }).join("") + '<div class="mg-scan"></div></div></div>';
      await nap(800);
      q(".mg-scan", s).classList.add("go");
      var els = qa(".mg-tile", s), h = q("[data-h]", s), time = q("[data-time]", s);
      for (var i = 0; i < els.length; i++) {
        await nap(650);
        els[i].classList.remove("bad");
        els[i].classList.add("good");
        q("[data-old]", els[i]).hidden = true;
        q("[data-new]", els[i]).hidden = false;
        h.textContent = Math.round(34 + (66 * (i + 1) / els.length)) + "%";
        var secs = Math.round((i + 1) / els.length * 862);
        time.textContent = Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0");
      }
      await nap(2600);
    },

    assets: async function (s, nap) {
      s.innerHTML = '<div class="fx fx-assets">' +
        '<div class="as-panel"><div class="as-title">✦ ' + t("Generate asset", "Generate aset") + '</div><div class="as-prompt" data-typed></div>' +
        '<div class="as-grid">' + [0, 1, 2, 3].map(function (i) { return '<div class="as-tile" data-i="' + i + '"><span class="shimmer"></span></div>'; }).join("") + "</div>" +
        '<button type="button" class="as-insert" tabindex="-1">' + t("Insert into Studio", "Masukkan ke Studio") + "</button></div>" +
        '<div class="as-studio"><div class="fx-vp"><div class="iso"></div><div class="as-drop"></div><span class="fx-chip" data-up hidden></span></div>' +
        '<ul class="as-tree"><li>Workspace</li><li class="kid">Baseplate</li><li class="kid">Tycoon</li><li class="kid new" hidden>TreasureChest</li></ul></div></div>';
      var plat = [];
      for (var x = 0; x < 4; x++) for (var y = 0; y < 4; y++) plat.push([x, y, 0, (x + y) % 2 ? "base" : "grey"]);
      JB.placeBlocks(q(".iso", s), plat, 110, 40).forEach(function (b) { b.classList.add("on"); });
      await JB.typeInto(q("[data-typed]", s), t("Low-poly treasure chest, wooden, gold trim", "Peti harta low-poly, kayu, list emas"), 18);
      await nap(300);
      var tiles = qa(".as-tile", s);
      for (var i = 0; i < tiles.length; i++) { await nap(380); tiles[i].innerHTML = CHESTS[i]; tiles[i].classList.add("ready"); }
      await nap(600);
      tiles[0].classList.add("pick");
      await nap(700);
      var btn = q(".as-insert", s);
      btn.classList.add("press");
      await nap(250);
      btn.classList.remove("press");
      var drop = q(".as-drop", s);
      drop.innerHTML = CHESTS[0];
      drop.classList.add("go");
      await nap(700);
      q(".as-tree .new", s).hidden = false;
      var up = q("[data-up]", s);
      up.hidden = false;
      up.textContent = t("Uploaded · rbxassetid://1849…", "Terunggah · rbxassetid://1849…");
      await nap(2800);
    },

    clothing: async function (s, nap) {
      var id = ++uid;
      var looks = [
        ["b", t("Batik streetwear, kawung motif", "Streetwear batik, motif kawung")],
        ["c", t("Cyberpunk jacket, neon grid", "Jaket cyberpunk, grid neon")],
        ["j", t("Sporty jersey, diagonal stripes", "Jersey sporty, garis diagonal")],
        ["p", t("Cute polka-dot school uniform", "Seragam sekolah polkadot")],
      ];
      s.innerHTML = '<div class="fx fx-cloth"><div class="ct-model">' + mannequin("#45484b", id) + '<span class="ct-spin"></span></div>' +
        '<div class="ct-side"><div class="as-prompt" data-typed></div><div class="ct-template"><svg viewBox="0 0 585 559" aria-hidden="true"><defs>' + PATTERNS("t" + id) + '</defs><rect width="585" height="559" fill="#232527"/>' +
        '<g class="tpl" fill="#45484b" stroke="#6b6e71" stroke-width="4"><rect x="231" y="74" width="128" height="128"/><rect x="231" y="204" width="128" height="64"/><rect x="427" y="74" width="128" height="128"/><rect x="19" y="355" width="128" height="128"/><rect x="217" y="355" width="128" height="128"/><rect x="308" y="355" width="128" height="128"/><rect x="406" y="355" width="128" height="128"/></g></svg><small>585 × 559</small></div>' +
        '<ul class="ct-checks"><li>' + t("Template mapped", "Template terpetakan") + "</li><li>" + t("Moderation pre-check", "Pre-check moderasi") + "</li><li>" + t("Ready to upload", "Siap diunggah") + "</li></ul></div></div>";
      var cloth = q(".cloth", s), tpl = q(".tpl", s), checks = qa(".ct-checks li", s), typed = q("[data-typed]", s);
      for (var i = 0; i < looks.length; i++) {
        checks.forEach(function (c) { c.classList.remove("on"); });
        await JB.typeInto(typed, looks[i][1], 14);
        await nap(250);
        s.querySelector(".ct-model").classList.remove("gen"); void s.offsetWidth; s.querySelector(".ct-model").classList.add("gen");
        await nap(500);
        cloth.setAttribute("fill", "url(#" + looks[i][0] + id + ")");
        tpl.setAttribute("fill", "url(#" + looks[i][0] + "t" + id + ")");
        for (var k = 0; k < checks.length; k++) { await nap(260); checks[k].classList.add("on"); }
        await nap(1500);
      }
    },

    discord: async function (s, nap) {
      s.innerHTML = '<div class="fx fx-discord"><aside class="dc-side"><b>JokiBlox HQ</b><span class="on"># my-tycoon</span><span># builds</span><span># alerts</span></aside>' +
        '<div class="dc-main"><div class="dc-head"># my-tycoon</div><div class="dc-msgs" data-msgs></div><div class="dc-input">' + t("Message #my-tycoon", "Kirim pesan ke #my-tycoon") + "</div></div></div>";
      var box = q("[data-msgs]", s);
      function msg(who, html, bot) {
        var d = document.createElement("div");
        d.className = "dc-msg";
        d.innerHTML = '<span class="dc-av' + (bot ? " bot" : "") + '">' + (bot ? '<img src="assets/img/logo.svg" alt="">' : "R") + '</span><div><b>' + who + (bot ? ' <i class="tag">BOT</i>' : "") + "</b>" + html + "</div>";
        box.appendChild(d);
        box.scrollTop = box.scrollHeight;
        return d;
      }
      await nap(500);
      msg("ryan", "<p>/jb " + t("add a 7-day daily reward streak", "tambah daily reward streak 7 hari") + "</p>");
      await nap(900);
      var m = msg("JokiBlox", '<p>' + t("On it — 2 agents, ~40 tokens.", "Siap — 2 agent, ~40 token.") + '</p><div class="dc-embed"><div class="dc-row">Scripter<span class="dc-bar"><b></b></span></div><div class="dc-row">UI<span class="dc-bar"><b></b></span></div></div>', true);
      var bars = qa(".dc-bar b", m);
      for (var p = 1; p <= 10; p++) { bars[0].style.width = Math.min(100, p * 12) + "%"; bars[1].style.width = (p * 10) + "%"; await nap(160); }
      await nap(300);
      msg("JokiBlox", '<div class="dc-embed ok"><b>✅ ' + t("Daily rewards ready", "Daily reward siap") + "</b><p>" + t("QA recheck passed · 8 bots · 0 errors", "Recheck QA lolos · 8 bot · 0 error") + '</p><div class="dc-btns"><span>' + t("Review in Studio", "Review di Studio") + "</span><span>Publish</span><span>Undo</span></div></div>", true);
      await nap(1200);
      msg("ryan", "<p>publish</p>");
      await nap(700);
      msg("JokiBlox", "<p>🚀 " + t("Published · version 14", "Terbit · versi 14") + "</p>", true);
      await nap(1300);
      msg("JokiBlox", '<div class="dc-embed alert"><b>📈 ' + t("MyTycoon just hit 1,000 players online", "MyTycoon tembus 1.000 pemain online") + "</b><p>" + t("+38% vs yesterday · alert set at 1,000 CCU", "+38% vs kemarin · alert di 1.000 CCU") + "</p></div>", true);
      await nap(2800);
    },

    qa: async function (s, nap) {
      var kinds = ["builder", "scripter", "ui", "qa", "architect", "builder", "ui", "scripter"];
      s.innerHTML = '<div class="fx fx-qa"><div class="fx-vp qa-vp"><div class="iso"></div><div class="bots">' +
        kinds.map(function (k, i) {
          return '<i style="--x:' + (18 + (i * 37) % 64) + "%;--y:" + (30 + (i * 23) % 44) + "%;--dx:" + ((i % 2 ? 1 : -1) * (20 + i * 4)) + "px;--dy:" + ((i % 3 ? -1 : 1) * (8 + i * 2)) + "px;--d:" + (1.6 + (i % 4) * 0.5) + 's">' + JB.avatar(k) + "</i>";
        }).join("") + '</div><span class="fx-chip">' + t("8 test bots", "8 bot uji") + "</span></div>" +
        '<div class="qa-side"><ul class="qa-list">' +
        [t("Join & spawn", "Join & spawn"), t("Buy VIP gamepass", "Beli gamepass VIP"), t("DataStore save/load", "Simpan/muat DataStore"), t("Mobile layout", "Tampilan mobile"), t("Exploit probes", "Uji exploit")].map(function (x) { return "<li>" + x + "</li>"; }).join("") +
        '</ul><div class="qa-loop"><i></i>' + t("Rechecks after every task", "Recheck setiap tugas selesai") + "</div></div></div>";
      var plat = [];
      for (var x = 0; x < 4; x++) for (var y = 0; y < 4; y++) plat.push([x, y, 0, (x + y) % 2 ? "base" : "grey"]);
      JB.placeBlocks(q(".iso", s), plat, 110, 40).forEach(function (b) { b.classList.add("on"); });
      var items = qa(".qa-list li", s);
      for (var i = 0; i < items.length; i++) {
        items[i].classList.add("run");
        await nap(700);
        items[i].classList.remove("run");
        if (i === 3) {
          items[i].classList.add("fail");
          items[i].setAttribute("data-note", t("Shop button off-screen → sent to UI agent", "Tombol toko keluar layar → dikirim ke agent UI"));
          await nap(1500);
          items[i].classList.remove("fail");
          items[i].classList.add("run");
          items[i].setAttribute("data-note", t("Fixed · rechecking…", "Diperbaiki · recheck…"));
          await nap(900);
          items[i].classList.remove("run");
          items[i].removeAttribute("data-note");
        }
        items[i].classList.add("pass");
      }
      q(".fx-chip", s).textContent = t("8 bots · 3 min · 0 errors ✓", "8 bot · 3 mnt · 0 error ✓");
      q(".fx-chip", s).classList.add("ok");
      await nap(2600);
    },

    antiexploit: async function (s, nap) {
      s.innerHTML = '<div class="fx fx-ax"><div class="ax-top"><span class="ax-live">● LIVE · MyTycoon · 23 ' + t("players", "pemain") + '</span><span>' + t("Blocked", "Diblokir") + ' <b data-blocked>0</b></span></div>' +
        '<div class="ax-main"><div class="fx-vp ax-vp"><div class="iso"></div><span class="ax-bad" data-bad>' + JB.avatar("qa") + '</span><span class="ax-ring" data-ring></span></div><ul class="ax-log" data-log></ul></div>' +
        '<div class="ax-foot">🛡 ' + t("Checks run on the server · nothing on the client for exploiters to switch off", "Cek berjalan di server · tidak ada yang bisa dimatikan exploiter di client") + "</div></div>";
      var plat = [];
      for (var x = 0; x < 4; x++) for (var y = 0; y < 4; y++) plat.push([x, y, 0, (x + y) % 2 ? "base" : "grey"]);
      JB.placeBlocks(q(".iso", s), plat, 110, 40).forEach(function (b) { b.classList.add("on"); });
      var bad = q("[data-bad]", s), ring = q("[data-ring]", s), log = q("[data-log]", s), blocked = q("[data-blocked]", s), n = 0;
      var hits = [
        ["speed", t("Speed 94 studs/s (limit 32)", "Kecepatan 94 stud/dtk (batas 32)"), t("rubber-banded", "ditarik balik")],
        ["teleport", t("Teleport 480 studs in 0.1 s", "Teleport 480 stud dalam 0,1 dtk"), t("kicked + logged", "di-kick + dicatat")],
        ["fly", t("Flying 6 s with no ground contact", "Terbang 6 dtk tanpa menyentuh tanah"), t("flagged", "ditandai")],
        ["spam", t("RemoteEvent spam 300/s", "Spam RemoteEvent 300/dtk"), t("throttled", "dibatasi")],
      ];
      await nap(700);
      for (var i = 0; i < hits.length; i++) {
        bad.className = "ax-bad " + hits[i][0];
        await nap(900);
        ring.className = "ax-ring on";
        bad.classList.add("caught");
        var li = document.createElement("li");
        li.innerHTML = '<b>⚠ ' + hits[i][1] + '</b><span>→ ' + hits[i][2] + "</span>";
        log.appendChild(li);
        blocked.textContent = ++n;
        await nap(900);
        ring.className = "ax-ring";
        bad.className = "ax-bad";
        await nap(300);
      }
      var d = document.createElement("li");
      d.className = "dc";
      d.innerHTML = "<b>🔔 Discord</b><span>" + t("4 exploit attempts blocked in MyTycoon", "4 percobaan exploit diblokir di MyTycoon") + "</span>";
      log.appendChild(d);
      await nap(2600);
    },
  };
  JB.scenes = SCENES;

  /* ---------- runner ---------- */
  function Runner(stage) {
    var run = 0;
    return {
      play: async function (key, loop, onDone) {
        var my = ++run;
        var nap = function (ms) { return raw(JB.reduced ? 0 : ms).then(function () { if (my !== run) throw CANCEL; }); };
        stage.setAttribute("data-scene", key);
        try {
          do {
            await SCENES[key](stage, nap);
            if (onDone) { onDone(); return; }
            await raw(1500);
            if (my !== run) return;
          } while (loop);
        } catch (e) { if (e !== CANCEL) throw e; }
      },
      stop: function () { run++; },
    };
  }

  /* ---------- home: feature theater ---------- */
  var theater = document.querySelector("[data-theater]");
  if (theater) {
    var tabs = qa("[data-fx]", theater), stage = q("[data-stage]", theater), runner = Runner(stage);
    var idx = 0, auto = true, started = false;
    var select = function (i, byUser) {
      idx = i;
      if (byUser) auto = false;
      tabs.forEach(function (b, k) { b.setAttribute("aria-selected", String(k === i)); b.classList.toggle("on", k === i); });
      qa("[data-fx-cap]", theater).forEach(function (c) { c.hidden = c.getAttribute("data-fx-cap") !== tabs[i].dataset.fx; });
      var key = tabs[i].dataset.fx, src = JB.clip && JB.clip("fx-" + key);
      var next = function () { if (auto) select((idx + 1) % tabs.length); };
      if (src) {
        runner.stop();
        stage.classList.add("has-clip");
        JB.mountClip(stage, src, !auto, auto ? next : null);
      } else {
        stage.classList.remove("has-clip");
        runner.play(key, !auto, auto ? next : null);
      }
      if (JB.slotLabel) JB.slotLabel(stage, "fx-" + key);
    };
    tabs.forEach(function (b, k) { b.addEventListener("click", function () { select(k, true); }); });
    theater.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      if (!e.target.closest("[data-fx]")) return;
      e.preventDefault();
      var n = (idx + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
      select(n, true);
      tabs[n].focus();
    });
    var hash = location.hash.replace("#", "");
    var start = Math.max(0, tabs.findIndex(function (b) { return b.dataset.fx === hash; }));
    JB.onVisible(theater, function () { started = true; select(start, start > 0); });
    document.addEventListener("jb:lang", function () { if (started) select(idx); });
  }

  /* ---------- products: one looping stage per feature ---------- */
  qa("[data-fx-mount]", document).forEach(function (el) {
    var r = Runner(el), key = el.getAttribute("data-fx-mount"), on = false;
    var inSlot = !!el.closest("[data-slot]");   // the surrounding slot already handles clips + labels
    var clip = !inSlot && JB.clipInfo && JB.clipInfo("fx-" + key);
    if (clip) { JB.player(el, clip); if (JB.slotLabel) JB.slotLabel(el, "fx-" + key); return; }
    if (!inSlot && JB.slotLabel) JB.slotLabel(el, "fx-" + key);
    JB.onVisible(el, function () { on = true; r.play(key, true); if (!inSlot && JB.slotLabel) JB.slotLabel(el, "fx-" + key); });
    document.addEventListener("jb:lang", function () { if (on) r.play(key, true); });
  });
  /* ---------- fixed-size demos scaled to fit their card (720×405 design size) ---------- */
  qa("[data-scale]", document).forEach(function (wrap) {
    var fit = function () { wrap.style.setProperty("--s", (wrap.clientWidth / 720).toFixed(4)); };
    fit();
    if ("ResizeObserver" in window) new ResizeObserver(fit).observe(wrap);
    else window.addEventListener("resize", fit);
  });
})();
