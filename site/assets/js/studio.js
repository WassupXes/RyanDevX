/* Studio tour: a Roblox Studio–style workspace with the JokiBlox panel.
   Steps: install → connect (MCP) → prompt → plan → build (live timer) → assets → review & publish. */
(function () {
  "use strict";
  var root = document.querySelector("[data-studio-tour]");
  if (!root || !window.JB) return;
  var JB = window.JB, t = JB.t;
  var $ = function (s, el) { return (el || root).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || root).querySelectorAll(s)); };
  var raw = function (ms) { return new Promise(function (r) { setTimeout(r, JB.reduced ? 0 : ms); }); };

  var el = {
    steps: $$("[data-step]"), caption: $("[data-caption]"), prev: $("[data-prev]"), next: $("[data-next]"), play: $("[data-play]"),
    tabs: $$("[data-rtab]"), toolsHome: $("[data-tools=home]"), toolsPlugins: $("[data-tools=plugins]"), jbTool: $("[data-jb-tool]"),
    docs: $("[data-docs]"), tree: $("[data-tree]"), vp: $("[data-vp]"), world: $("[data-world]"), overlay: $("[data-overlay]"),
    timer: $("[data-timer]"), hud: $("[data-hud]"), log: $("[data-log]"), body: $("[data-dock-body]"), input: $("[data-input]"),
    conv: $("[data-conv]"), tokens: $("[data-tokens]"), panel: $("[data-panel]"), conn: $("[data-conn]"), clipBox: $("[data-tour-clip]"),
  };

  /* ---------- game content (matches a real Studio coin-collector place) ---------- */
  var TREE = [
    ["Workspace", "ws", [["Camera", "cam"], ["Terrain", "ter"], ["SpawnLocation", "spawn"], ["Baseplate", "part"], ["Coins", "folder", 1]]],
    ["Players", "plr"], ["Lighting", "light"], ["MaterialService", "mat"], ["ReplicatedFirst", "rep"],
    ["ReplicatedStorage", "rep", [["CoinCollected", "remote", 2], ["Config", "module", 3]]],
    ["ServerScriptService", "sss", [["Leaderstats", "script", 1], ["CoinSpawner", "script", 2]]],
    ["ServerStorage", "sss"], ["StarterGui", "gui", [["HUD", "screen", 2]]], ["StarterPack", "folder"], ["StarterPlayer", "folder"],
    ["SoundService", "sound", [["CoinPickup", "sound", 3]]], ["TextChatService", "chat"],
  ];
  var COINS = [[22, 70], [34, 62], [47, 74], [60, 64], [72, 72], [28, 82], [55, 84], [78, 82], [40, 90], [66, 92], [18, 88], [84, 66]];
  var EVENTS = [
    [3, "Architect", ["Plan locked · 6 tasks · 4 agents", "Rencana dikunci · 6 tugas · 4 agent"], null],
    [18, "Builder", ["Map + 24 coin spawns", "Map + 24 titik koin"], "coins"],
    [47, "Scripter", ["ServerScriptService/Leaderstats", "ServerScriptService/Leaderstats"], 1],
    [80, "Scripter", ["CoinCollected RemoteEvent + server check", "RemoteEvent CoinCollected + cek server"], 2],
    [125, "UI", ["StarterGui/HUD · “Coins: 0”", "StarterGui/HUD · “Coins: 0”"], "hud"],
    [170, "Scripter", ["Config module · coin value, respawn", "Modul Config · nilai koin, respawn"], 3],
    [220, "Audio", ["CoinPickup sound", "Suara CoinPickup"], null],
    [270, "QA", ["Playtest · 4 bots collecting coins", "Playtest · 4 bot mengumpulkan koin"], "qa"],
    [320, "QA", ["Bug: coin counted twice → sent to Scripter", "Bug: koin terhitung dua kali → dikirim ke Scripter"], "bug"],
    [345, "Scripter", ["Fixed debounce · QA recheck ✓", "Debounce diperbaiki · recheck QA ✓"], "fix"],
    [372, "JokiBlox", ["Playable ✓ · 118 tokens", "Siap main ✓ · 118 token"], "done"],
  ];
  var TOTAL = 372;
  var TOKENS = 10000;

  function coinSVG(style) {
    if (style === "new") return '<svg viewBox="0 0 40 40"><ellipse cx="20" cy="20" rx="15" ry="17" fill="#ffd84d" stroke="#b8860b" stroke-width="3"/><path d="m20 9 3 7h7l-5.5 4.5 2 7.5-6.5-4.5-6.5 4.5 2-7.5L10 16h7z" fill="#fff3b0"/></svg>';
    return '<svg viewBox="0 0 40 40"><ellipse cx="20" cy="20" rx="13" ry="16" fill="#f5c542" stroke="#b8860b" stroke-width="3"/><ellipse cx="16" cy="15" rx="3" ry="5" fill="#fff3b0"/></svg>';
  }
  function fmt(s) { s = Math.round(s); return s < 60 ? s + "s" : Math.floor(s / 60) + "m " + (s % 60) + "s"; }
  function setTokens(n) { el.tokens.textContent = n.toLocaleString("en-US"); }
  function log(line, cls) {
    var d = document.createElement("div");
    if (cls) d.className = cls;
    d.textContent = line;
    el.log.appendChild(d);
    el.log.scrollTop = el.log.scrollHeight;
  }

  /* ---------- Studio state ---------- */
  function renderTree(level) {
    var html = "";
    TREE.forEach(function (svc) {
      var kids = (svc[2] || []).filter(function (k) { return !k[2] || k[2] <= level; });
      html += '<li><span class="tw">' + (kids.length ? "▾" : "") + '</span><i class="ri ri-' + svc[1] + '"></i>' + svc[0] + "</li>";
      kids.forEach(function (k) { html += '<li class="kid' + (k[2] && k[2] === level ? " fresh" : "") + '" data-node="' + k[0] + '"><span class="tw"></span><i class="ri ri-' + k[1] + '"></i>' + k[0] + "</li>"; });
    });
    el.tree.innerHTML = html;
  }
  function setTab(name) {
    el.tabs.forEach(function (b) { b.classList.toggle("on", b.dataset.rtab === name); });
    el.toolsHome.hidden = name !== "Home";
    el.toolsPlugins.hidden = name !== "Plugins";
  }
  function setDocs(withScript) {
    el.docs.innerHTML = '<span class="on"><i class="ri ri-place"></i>Place1 ×</span>' + (withScript ? '<span><i class="ri ri-script"></i>Leaderstats ×</span>' : "");
  }
  function world(state) {
    // state: {coins: "none"|"old"|"new", count: n collected, bots: bool}
    var html = '<span class="spawn"></span>';
    if (state.coins !== "none") {
      COINS.forEach(function (c, i) {
        var gone = i < (state.count || 0);
        html += '<span class="coin' + (gone ? " gone" : "") + '" style="left:' + c[0] + "%;top:" + c[1] + "%;--d:" + (i % 4) * 0.2 + 's">' + coinSVG(state.coins) + "</span>";
      });
    }
    if (state.bots) {
      ["builder", "scripter", "ui", "qa"].forEach(function (k, i) {
        html += '<span class="bot" style="--i:' + i + '">' + JB.avatar(k) + "</span>";
      });
    }
    el.world.innerHTML = html;
  }
  function hud(on, n) { el.hud.hidden = !on; el.hud.textContent = "Coins: " + (n || 0); }
  function timer(on, s) { el.timer.hidden = !on; el.timer.textContent = "⏱ " + fmt(s || 0); }

  function base(i) {
    setTab(i === 0 ? "Plugins" : "Home");
    el.jbTool.classList.toggle("show", i >= 1);
    root.classList.toggle("panel-open", i >= 1);
    el.conn.classList.toggle("on", i >= 2);
    el.conn.textContent = i >= 2 ? "● MCP · JokiBlox" : "● MCP off";
    setDocs(i >= 4);
    renderTree(i >= 4 ? 3 : 0);
    el.overlay.innerHTML = "";
    el.log.innerHTML = "";
    var built = i >= 5;
    world({ coins: i >= 6 ? "new" : built ? "old" : "none", count: 0 });
    hud(built, 0);
    timer(built, built ? TOTAL : 0);
    setTokens(i >= 6 ? TOKENS - 140 : built ? TOKENS - 118 : TOKENS);
    el.conv.textContent = i >= 2 ? t("Coin Rush", "Coin Rush") : t("New chat", "Chat baru");
    el.input.textContent = t("Ask JokiBlox", "Tanya JokiBlox");
    el.input.classList.remove("typing");
  }

  /* ---------- scenes ---------- */
  var SCENES = {
    install: async function (nap) {
      el.body.innerHTML = '<div class="jp-empty">' + t("Install the plugin, then click <b>JokiBlox</b> in the Plugins tab.", "Pasang plugin, lalu klik <b>JokiBlox</b> di tab Plugins.") + "</div>";
      el.overlay.innerHTML =
        '<div class="store-card"><div class="sc-top"><div class="sc-icon"><img src="assets/img/mark.svg" alt=""></div><div><b>JokiBlox Agent</b><small>' + t("Plugin · Creator Store", "Plugin · Creator Store") + "</small></div></div>" +
        "<p>" + t("AI squad that builds, fixes and upgrades your game in Studio.", "Squad AI yang membangun, memperbaiki, dan upgrade game kamu di Studio.") + "</p>" +
        '<button class="sc-btn" type="button" tabindex="-1">' + t("Install", "Pasang") + "</button></div>";
      log(t("Toolbox › Creator Store › “JokiBlox”", "Toolbox › Creator Store › “JokiBlox”"));
      await nap(1300);
      var btn = $(".sc-btn", el.overlay);
      btn.classList.add("press"); btn.textContent = t("Installing…", "Memasang…");
      await nap(1000);
      btn.classList.remove("press"); btn.classList.add("done"); btn.textContent = t("Installed ✓", "Terpasang ✓");
      log(t("Plugin installed: JokiBlox Agent", "Plugin terpasang: JokiBlox Agent"), "ok");
      await nap(600);
      el.jbTool.classList.add("show", "hot");
      await nap(900);
      el.jbTool.classList.remove("hot");
      root.classList.add("panel-open");
    },

    connect: async function (nap) {
      el.overlay.innerHTML =
        '<div class="rs-modal"><div class="rs-mbar"><i></i><i></i><i></i><b>Assistant Settings</b></div><div class="rs-mbody">' +
        '<nav><span>Usage</span><span>API Keys</span><span class="on">MCP Servers</span><span>Skills</span></nav>' +
        '<div class="rs-mmain"><p class="rs-note">ⓘ ' + t("Connecting an outside AI shares your data with that provider.", "Menghubungkan AI luar membagikan datamu ke penyedia itu.") + "</p>" +
        '<div class="rs-trow"><b>Enable Studio as MCP server</b><i class="rs-tg" data-tg></i></div>' +
        '<div class="rs-status" data-st><i></i>No clients connected</div></div></div></div>';
      el.body.innerHTML = '<div class="jp-card"><h5>' + t("Connect Studio", "Hubungkan Studio") + "</h5><p>" +
        t("Turn on <b>Enable Studio as MCP server</b> in Assistant Settings → MCP Servers.", "Nyalakan <b>Enable Studio as MCP server</b> di Assistant Settings → MCP Servers.") + "</p></div>";
      log(t("Assistant › Settings › MCP Servers", "Assistant › Settings › MCP Servers"));
      await nap(1300);
      $("[data-tg]", el.overlay).classList.add("on");
      log("Studio MCP server: on", "ok");
      await nap(1100);
      var st = $("[data-st]", el.overlay);
      st.classList.add("on");
      st.lastChild.textContent = "1 client connected";
      log(t("MCP client connected: JokiBlox Bridge", "Klien MCP terhubung: JokiBlox Bridge"), "ok");
      el.conn.classList.add("on");
      el.conn.textContent = "● MCP · JokiBlox";
      await nap(900);
      el.overlay.innerHTML = "";
      el.body.innerHTML = '<div class="jp-card"><h5>' + t("Link your account", "Hubungkan akun") + "</h5><p>" + t("Enter this code at <b>jokiblox.com/pair</b>", "Masukkan kode ini di <b>jokiblox.com/pair</b>") + '</p><div class="pair">482 913</div>' +
        '<ul class="checklist"><li>' + t("Account @builderman · Pro", "Akun @builderman · Pro") + "</li><li>" + t("Snapshot of Place1 saved", "Snapshot Place1 tersimpan") + "</li><li>" + t("Ready · 10,000 tokens", "Siap · 10.000 token") + "</li></ul></div>";
      var items = $$(".checklist li", el.body);
      for (var i = 0; i < items.length; i++) { await nap(600); items[i].classList.add("on"); }
    },

    prompt: async function (nap) {
      el.conv.textContent = t("New chat", "Chat baru");
      el.body.innerHTML = '<div class="jp-starters"><span>Tycoon</span><span>Obby</span><span class="on">' + t("Coin collector", "Kumpul koin") + "</span><span>" + t("Fix my game", "Perbaiki game") + "</span></div>";
      el.input.textContent = "";
      el.input.classList.add("typing");
      await JB.typeInto(el.input, t("Make a coin-collecting game: 24 coins around the map, leaderstats, a HUD that shows my coins, and a sound when I pick one up.",
                                     "Bikin game kumpul koin: 24 koin di map, leaderstats, HUD yang menampilkan koin, dan suara saat koin diambil."), 15);
      await nap(500);
      var msg = el.input.textContent;
      el.input.classList.remove("typing");
      el.input.textContent = t("Ask JokiBlox", "Tanya JokiBlox");
      el.conv.textContent = "Coin Rush";
      el.body.innerHTML = '<div class="jp-you">' + msg.replace(/</g, "&lt;") + '</div><div class="jp-thought" data-th>› ' + t("Thinking", "Berpikir") + " 0.0s</div>";
      var th = $("[data-th]", el.body);
      for (var k = 1; k <= 12; k++) { th.textContent = "› " + t("Thinking", "Berpikir") + " " + (k * 0.2).toFixed(1) + "s"; await nap(110); }
      th.textContent = "› " + t("Thought for 2.4 seconds", "Berpikir selama 2,4 detik");
      el.body.insertAdjacentHTML("beforeend", '<p class="jp-say">' + t("Reading your place with Kimi (long context)… Empty baseplate. Drafting a plan.", "Membaca place dengan Kimi (konteks panjang)… Baseplate kosong. Menyusun rencana.") + "</p>");
      log("[Router] Whole-place read → Kimi", "ok");
    },

    plan: async function (nap) {
      var rows = [
        ["builder", t("Map + 24 coin spawns", "Map + 24 titik koin"), "Builder · DeepSeek"],
        ["scripter", "Leaderstats (Coins)", "Scripter · Claude"],
        ["scripter", t("CoinCollected + server check", "CoinCollected + cek server"), "Scripter · Claude"],
        ["ui", t("HUD “Coins: 0”", "HUD “Coins: 0”"), "UI · GPT"],
        ["scripter", t("Pickup sound + Config", "Suara pickup + Config"), "Scripter · DeepSeek"],
        ["qa", t("Playtest with 4 bots", "Playtest 4 bot"), "QA · DeepSeek"],
      ];
      el.body.innerHTML = '<div class="jp-thought">› ' + t("Thought for 2.4 seconds", "Berpikir selama 2,4 detik") + '</div><div class="jp-plan"><div class="jp-plan-h">☰ <b>Coin Rush — ' + t("game plan", "rencana game") + "</b></div>" +
        '<ul class="plan-rows">' + rows.map(function (r) { return '<li><span class="av-mini">' + JB.avatar(r[0]) + '</span><span class="pr-t">' + r[1] + "<small>" + r[2] + "</small></span></li>"; }).join("") + "</ul>" +
        '<div class="estimate"><span>' + t("Estimate", "Estimasi") + "</span><b>≈ 120 " + t("tokens · ~6 min", "token · ~6 mnt") + "</b></div></div>" +
        '<div class="dk-actions"><button type="button" class="ghost" tabindex="-1">' + t("Edit plan", "Ubah rencana") + '</button><button type="button" class="primary" data-go tabindex="-1">▶ ' + t("Start squad", "Jalankan squad") + "</button></div>";
      var lis = $$(".plan-rows li", el.body);
      for (var i = 0; i < lis.length; i++) { await nap(300); lis[i].classList.add("on"); el.body.scrollTop = el.body.scrollHeight; }
      await nap(500);
      el.body.scrollTop = el.body.scrollHeight;
      $("[data-go]", el.body).classList.add("pulse");
      log("[Architect] Plan: 6 tasks, 4 agents", "ok");
    },

    build: async function (nap) {
      el.body.innerHTML = '<div class="jp-thought" data-wk>› ' + t("Working", "Bekerja") + ' 0s</div><ol class="jp-events" data-ev></ol>';
      var ev = $("[data-ev]", el.body), wk = $("[data-wk]", el.body);
      timer(true, 0);
      var real = 15000, steps = 150, next = 0, coins = 0;
      for (var k = 0; k <= steps; k++) {
        var p = k / steps, sim = TOTAL * Math.pow(p, 2.1);
        timer(true, sim);
        wk.textContent = "› " + t("Working", "Bekerja") + " " + fmt(sim) + " · 4 " + t("agents", "agent");
        setTokens(Math.round(TOKENS - 118 * p));
        while (next < EVENTS.length && EVENTS[next][0] <= sim) {
          var e = EVENTS[next++];
          ev.insertAdjacentHTML("beforeend", '<li class="' + (e[3] === "bug" ? "bad" : "") + '"><time>' + fmt(e[0]) + "</time><b>" + e[1] + "</b><span>" + t(e[2][0], e[2][1]) + "</span></li>");
          ev.scrollTop = ev.scrollHeight;
          log("[" + e[1] + "] " + e[2][0], e[3] === "bug" ? "warn" : "ok");
          if (e[3] === "coins") world({ coins: "old" });
          if (typeof e[3] === "number") { renderTree(e[3]); if (e[3] === 1) setDocs(true); }
          if (e[3] === "hud") hud(true, 0);
          if (e[3] === "qa") world({ coins: "old", bots: true });
          if (e[3] === "done") { world({ coins: "old", count: 6 }); hud(true, 60); }
        }
        if (next >= 8 && next < EVENTS.length && k % 6 === 0 && coins < 6) { coins++; world({ coins: "old", count: coins, bots: true }); hud(true, coins * 10); }
        await nap(real / steps);
      }
      wk.textContent = "› " + t("Done in 6m 12s", "Selesai dalam 6m 12d");
      el.overlay.innerHTML = '<div class="toast">✓ ' + t("Playable in 6m 12s", "Siap main dalam 6m 12d") + "</div>";
    },

    assets: async function (nap) {
      el.body.innerHTML = '<div class="jp-you">' + t("Make the coins look nicer — low-poly gold coin with a star.", "Bikin koinnya lebih bagus — koin emas low-poly dengan bintang.") + "</div>" +
        '<div class="jp-card"><h5>✦ ' + t("Generate asset", "Generate aset") + '</h5><div class="dk-eggs">' +
        [0, 1, 2].map(function (i) { return '<div class="dk-egg"><span class="shimmer"></span><small>v' + (i + 1) + "</small></div>"; }).join("") + "</div>" +
        '<ul class="rs-checks"><li class="on">Upload to Roblox</li><li class="on">Add to Workspace</li><li class="on">' + t("Replace 24 coins", "Ganti 24 koin") + "</li><li>Anchored</li></ul>" +
        '<div class="dk-actions"><button type="button" class="ghost" tabindex="-1">' + t("Regenerate", "Generate ulang") + '</button><button type="button" class="primary" data-ins tabindex="-1">' + t("Insert", "Masukkan") + "</button></div></div>";
      var tiles = $$(".dk-egg", el.body);
      for (var i = 0; i < tiles.length; i++) { await nap(450); tiles[i].insertAdjacentHTML("afterbegin", coinSVG(i === 1 ? "new" : "old")); tiles[i].classList.add("ready"); }
      tiles[1].classList.add("pick");
      log("[Art] 3 coin meshes generated", "ok");
      await nap(800);
      var ins = $("[data-ins]", el.body);
      ins.classList.add("pulse");
      await nap(900);
      ins.classList.remove("pulse"); ins.textContent = t("Inserted ✓", "Masuk ✓"); ins.disabled = true;
      world({ coins: "new" });
      $$(".coin", el.world).forEach(function (c) { c.classList.add("swap"); });
      log("Open Cloud: GoldCoin uploaded · 24 instances replaced", "ok");
      setTokens(TOKENS - 140);
    },

    review: async function (nap) {
      var files = [["+", "ServerScriptService/Leaderstats", "+38"], ["+", "ServerScriptService/CoinSpawner", "+54"], ["+", "ReplicatedStorage/CoinCollected", "Remote"], ["+", "ReplicatedStorage/Config", "+12"], ["+", "StarterGui/HUD", "UI"], ["~", "Workspace/Coins", "24"]];
      el.body.innerHTML = '<ul class="changes">' + files.map(function (f, i) { return '<li class="' + (i === 0 ? "open" : "") + '"><span class="ch-k">' + f[0] + '</span><span class="ch-f">' + f[1] + '</span><span class="ch-n">' + f[2] + "</span></li>"; }).join("") + "</ul>" +
        '<pre class="mini-diff"><span class="a">+ local stats = Instance.new("Folder")</span><span class="a">+ stats.Name = "leaderstats"</span><span class="a">+ local coins = Instance.new("IntValue", stats)</span><span class="c">  …</span></pre>' +
        '<div class="qa-box">✓ ' + t("Playtest · 4 bots · 0 errors", "Playtest · 4 bot · 0 error") + "</div>" +
        '<div class="dk-actions"><button type="button" class="ghost" tabindex="-1">' + t("Undo all", "Undo semua") + '</button><button type="button" class="primary" data-acc tabindex="-1">' + t("Accept all", "Terima semua") + "</button></div>";
      await nap(1500);
      var acc = $("[data-acc]", el.body);
      acc.classList.add("pulse"); await nap(900); acc.classList.remove("pulse");
      acc.textContent = "Publish ▲"; log(t("Changes accepted · snapshot kept", "Perubahan diterima · snapshot disimpan"), "ok");
      await nap(900); acc.classList.add("pulse"); await nap(800); acc.classList.remove("pulse");
      acc.textContent = t("Published ✓", "Terbit ✓"); acc.disabled = true;
      el.overlay.innerHTML = '<div class="toast">✓ ' + t("Published · Coin Rush v1", "Terbit · Coin Rush v1") + "</div>";
      log("Published Coin Rush · version 1", "ok");
      await nap(1200);
      el.overlay.innerHTML = '<div class="toast dc">💬 ' + t("Sent to Discord #coin-rush", "Dikirim ke Discord #coin-rush") + "</div>";
      log("Discord: notified #coin-rush", "ok");
    },
  };

  var STEPS = [
    ["install", ["Install the plugin", "Pasang plugin"], ["Find JokiBlox in Toolbox → Creator Store and click Install. A JokiBlox button appears in the <b>Plugins</b> tab.", "Cari JokiBlox di Toolbox → Creator Store lalu klik Install. Tombol JokiBlox muncul di tab <b>Plugins</b>."], ["Click Install", "Klik Install"], ["Adds the panel", "Menambah panel"]],
    ["connect", ["Connect through MCP", "Hubungkan lewat MCP"], ["In <b>Assistant Settings → MCP Servers</b>, turn on <b>Enable Studio as MCP server</b>. The JokiBlox bridge connects as a client, then you link your account with a one-time code.", "Di <b>Assistant Settings → MCP Servers</b>, nyalakan <b>Enable Studio as MCP server</b>. Bridge JokiBlox terhubung sebagai klien, lalu hubungkan akun dengan kode sekali pakai."], ["One toggle + a code", "Satu toggle + kode"], ["Connects, takes a snapshot", "Terhubung, buat snapshot"]],
    ["prompt", ["Prompt", "Prompt"], ["Type what you want in English or Bahasa Indonesia. JokiBlox reads your whole place first so it knows what already exists.", "Ketik maumu dalam bahasa Inggris atau Indonesia. JokiBlox membaca seluruh place dulu supaya tahu apa yang sudah ada."], ["Write one prompt", "Tulis satu prompt"], ["Reads the place", "Membaca place"]],
    ["plan", ["Approve the plan", "Setujui rencana"], ["Every task, agent, model and the token estimate — before anything is spent.", "Semua tugas, agent, model, dan estimasi token — sebelum ada yang terpakai."], ["Edit or approve", "Ubah atau setujui"], ["Splits work across agents", "Membagi kerja ke agent"]],
    ["build", ["Watch it build", "Lihat proses build"], ["Four agents work in parallel. The clock shows every step, from the first part to a QA-checked playable game.", "Empat agent bekerja paralel. Timer menunjukkan setiap langkah, dari part pertama sampai game siap main yang sudah dicek QA."], ["Grab a snack", "Ngemil dulu"], ["Builds, tests, fixes", "Bangun, tes, perbaiki"]],
    ["assets", ["Generate & insert assets", "Generate & masukkan aset"], ["Describe a prop, pick a variant, and it’s uploaded and placed in your Workspace — the same options you know from Import.", "Deskripsikan properti, pilih varian, lalu diunggah dan ditaruh di Workspace — opsi yang sama seperti di Import."], ["Pick and insert", "Pilih dan masukkan"], ["Uploads, replaces", "Unggah, ganti"]],
    ["review", ["Review & publish", "Review & publish"], ["Every change is a diff with QA results. Accept, undo or publish — and get a ping on Discord.", "Setiap perubahan berupa diff dengan hasil QA. Terima, undo, atau publish — lalu dapat notifikasi di Discord."], ["Accept & publish", "Terima & publish"], ["Applies, keeps a snapshot", "Terapkan, simpan snapshot"]],
  ];

  /* ---------- controller ---------- */
  var state = { step: 0, run: 0, playing: true, started: false };
  var L = function (pair) { return JB.lang() === "id" ? pair[1] : pair[0]; };
  function caption(i) {
    var s = STEPS[i];
    el.caption.innerHTML = '<span class="cap-n">' + (i + 1) + "/" + STEPS.length + "</span><h3>" + L(s[1]) + "</h3><p>" + L(s[2]) + "</p>" +
      '<div class="cap-split"><div><small>' + t("You", "Kamu") + "</small>" + L(s[3]) + "</div><div><small>JokiBlox</small>" + L(s[4]) + "</div></div>";
    el.steps.forEach(function (b, k) { b.classList.toggle("on", k === i); b.classList.toggle("done", k < i); b.setAttribute("aria-current", k === i ? "step" : "false"); });
    // on phones the stepper is a swipe row: keep the current step centred (horizontal scroll only, never the page)
    var row = el.steps[i].closest(".stepper"), btn = el.steps[i];
    if (row && row.scrollWidth > row.clientWidth) row.scrollTo({ left: btn.offsetLeft - (row.clientWidth - btn.offsetWidth) / 2, behavior: "smooth" });
    el.prev.disabled = i === 0;
  }
  async function go(i) {
    state.step = i;
    var my = ++state.run;
    var nap = function (ms) { return raw(ms).then(function () { if (my !== state.run) throw "cancel"; }); };
    caption(i);
    base(i);
    var key = "tour-" + STEPS[i][0], src = JB.clip && JB.clip(key);
    if (JB.slotLabel) JB.slotLabel(el.clipBox, key);
    if (src) {
      el.clipBox.hidden = false;
      var done = new Promise(function (res) { JB.mountClip(el.clipBox, src, !state.playing, res); });
      if (JB.slotLabel) JB.slotLabel(el.clipBox, key);
      try {
        if (state.playing) { await done; await nap(800); go((i + 1) % STEPS.length); }
      } catch (e) { if (e !== "cancel") throw e; }
      return;
    }
    el.clipBox.hidden = true;
    el.clipBox.innerHTML = "";
    try {
      await SCENES[STEPS[i][0]](nap);
      if (state.playing) { await nap(2600); go((i + 1) % STEPS.length); }
    } catch (e) { if (e !== "cancel") throw e; }
  }
  function setPlaying(p) {
    state.playing = p;
    el.play.setAttribute("aria-pressed", String(p));
    el.play.innerHTML = p ? "❚❚ " + t("Pause", "Jeda") : "▶ " + t("Autoplay", "Putar otomatis");
  }
  el.steps.forEach(function (b, k) { b.addEventListener("click", function () { setPlaying(false); go(k); }); });
  el.prev.addEventListener("click", function () { setPlaying(false); go(Math.max(0, state.step - 1)); });
  el.next.addEventListener("click", function () { setPlaying(false); go((state.step + 1) % STEPS.length); });
  el.play.addEventListener("click", function () { setPlaying(!state.playing); if (state.playing) go(state.step); });
  document.addEventListener("jb:lang", function () { if (state.started) { setPlaying(state.playing); go(state.step); } });
  document.addEventListener("keydown", function (e) {
    if (!root.contains(document.activeElement)) return;
    if (e.key === "ArrowRight") el.next.click();
    if (e.key === "ArrowLeft") el.prev.click();
  });
  setPlaying(true);
  caption(0);
  base(0);
  var startAt = Math.max(0, STEPS.findIndex(function (s) { return s[0] === location.hash.replace("#", ""); }));
  JB.onVisible(root, function () { state.started = true; if (startAt) setPlaying(false); go(startAt); });
})();
