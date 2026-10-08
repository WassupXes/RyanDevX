/* Interactive Roblox Studio tour: install → connect → describe → plan → build → review. */
(function () {
  "use strict";
  var root = document.querySelector("[data-studio-tour]");
  if (!root || !window.JB) return;
  var JB = window.JB, t = JB.t;
  var $ = function (s, el) { return (el || root).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || root).querySelectorAll(s)); };

  var el = {
    steps: $$("[data-step]"), caption: $("[data-caption]"), prev: $("[data-prev]"), next: $("[data-next]"), play: $("[data-play]"),
    tool: $("[data-jb-tool]"), pill: $("[data-conn]"), tree: $("[data-tree]"), iso: $(".iso"), overlay: $("[data-overlay]"),
    log: $("[data-log]"), dockBody: $("[data-dock-body]"), tabs: $$("[data-tab]"), tokens: $("[data-tokens]"), meter: $("[data-meter] b"),
    place: $("[data-place]"), props: $("[data-props]"),
  };

  var TOKENS = 10000, SPEND = 258;
  var BASE_TREE = ["Workspace", "Players", "Lighting", "ReplicatedStorage", "ServerScriptService", "StarterGui", "SoundService"];
  var NEW_TREE = [["Workspace", "Zones"], ["Workspace", "Eggs"], ["ServerScriptService", "CurrencyService"], ["ServerScriptService", "EggHatch"], ["ReplicatedStorage", "PetData"], ["StarterGui", "PetInventory"], ["StarterGui", "ShopUI"]];
  var CELLS = (function () {
    var b = [];
    for (var x = 0; x < 5; x++) for (var y = 0; y < 5; y++) b.push([x, y, 0, x < 2 ? "base" : x < 4 ? "grey" : "dark"]);
    b.push([0, 0, 1, "white"], [0, 0, 2, "white"], [0, 1, 1, "white"], [4, 4, 1, "dark"], [4, 4, 2, "dark"], [4, 4, 3, "ok"],
           [2, 2, 1, "white"], [2, 3, 1, "ok"], [3, 1, 1, "white"], [1, 4, 1, "grey"], [4, 0, 1, "grey"]);
    return b;
  })();

  var STEPS = [
    { key: "install",
      title: ["Install the plugin", "Pasang plugin"],
      text: ["Find <b>JokiBlox Agent</b> in the Creator Store and click Install. A JokiBlox button appears in Studio’s <b>Plugins</b> tab — that’s it.",
             "Cari <b>JokiBlox Agent</b> di Creator Store lalu klik Install. Tombol JokiBlox muncul di tab <b>Plugins</b> Studio — selesai."],
      you: ["Click Install", "Klik Install"], jb: ["Adds a toolbar button", "Menambah tombol toolbar"] },
    { key: "connect",
      title: ["Connect your account", "Hubungkan akun"],
      text: ["Open the panel and pair Studio with your JokiBlox account using a one-time code. JokiBlox talks to Studio through Roblox’s official Studio MCP server and takes a snapshot before touching anything. We never ask for your Roblox password.",
             "Buka panel dan pasangkan Studio dengan akun JokiBlox memakai kode sekali pakai. JokiBlox terhubung ke Studio lewat Studio MCP server resmi Roblox dan membuat snapshot sebelum mengubah apa pun. Kami tidak pernah meminta password Roblox kamu."],
      you: ["Enter a 6-digit code", "Masukkan kode 6 digit"], jb: ["Links Studio, makes a snapshot", "Menghubungkan Studio, membuat snapshot"] },
    { key: "describe",
      title: ["Describe your game", "Ceritakan game kamu"],
      text: ["Type what you want in English or Bahasa Indonesia — or tap a starter. JokiBlox first reads your whole place so it knows what already exists.",
             "Ketik keinginanmu dalam bahasa Inggris atau Indonesia — atau pilih starter. JokiBlox membaca seluruh place dulu supaya tahu apa yang sudah ada."],
      you: ["Write one prompt", "Tulis satu prompt"], jb: ["Reads the whole place", "Membaca seluruh place"] },
    { key: "plan",
      title: ["Approve the plan", "Setujui rencana"],
      text: ["The Architect agent turns your idea into a plan: every system, which agent and model handles it, and the token estimate — before a single token is spent. Edit anything, then start the squad.",
             "Agent Architect mengubah idemu menjadi rencana: semua sistem, agent dan model yang mengerjakan, serta estimasi token — sebelum satu token pun terpakai. Ubah apa saja, lalu jalankan squad."],
      you: ["Edit or approve", "Ubah atau setujui"], jb: ["Splits work across agents", "Membagi kerja ke para agent"] },
    { key: "build",
      title: ["Watch the squad build", "Lihat squad bekerja"],
      text: ["Multiplayer Mode: four specialist agents work <b>at the same time</b> on separate parts of the DataModel, so they never overwrite each other. Parts, scripts and UI appear live in your Studio.",
             "Mode Multiplayer: empat agent spesialis bekerja <b>bersamaan</b> di bagian DataModel yang berbeda, jadi tidak saling menimpa. Part, script, dan UI muncul langsung di Studio kamu."],
      you: ["Grab a snack", "Ngemil dulu"], jb: ["Builds in parallel, playtests", "Membangun paralel, playtest"] },
    { key: "assets",
      title: ["Generate & insert assets", "Generate & masukkan aset"],
      text: ["Need props? Describe them, pick the variants you like and click Insert. They’re uploaded through Open Cloud and placed straight into your Workspace.",
             "Butuh properti? Deskripsikan, pilih varian yang kamu suka, lalu klik Insert. Aset diunggah lewat Open Cloud dan langsung ditaruh di Workspace."],
      you: ["Pick and insert", "Pilih dan masukkan"], jb: ["Generates, uploads, places", "Generate, unggah, taruh"] },
    { key: "review",
      title: ["Review & publish", "Review & publish"],
      text: ["Every change arrives as a diff with QA results. Accept, tweak or undo with one click — snapshots make everything reversible. Publish when you’re happy.",
             "Semua perubahan datang sebagai diff lengkap dengan hasil QA. Terima, ubah, atau undo dengan satu klik — snapshot membuat semuanya bisa dibatalkan. Publish kalau sudah puas."],
      you: ["Accept & publish", "Terima & publish"], jb: ["Applies changes, keeps a snapshot", "Menerapkan perubahan, menyimpan snapshot"] },
  ];

  function egg(fill, spot) {
    return '<svg viewBox="0 0 60 74" aria-hidden="true"><ellipse cx="30" cy="70" rx="18" ry="4" fill="rgba(0,0,0,.25)"/><path d="M30 4C16 4 6 26 6 44c0 14 11 24 24 24s24-10 24-24C54 26 44 4 30 4z" fill="' + fill + '" stroke="#0b0c0d" stroke-width="3"/><circle cx="22" cy="30" r="5" fill="' + spot + '"/><circle cx="38" cy="44" r="6" fill="' + spot + '"/><circle cx="24" cy="52" r="3.5" fill="' + spot + '"/></svg>';
  }
  var EGGS = [egg("#f2f4f5", "#bdbebe"), egg("#2fe0a0", "#00895a"), egg("#ffd84d", "#c79a00")];
  function placeEggs(animate) {
    el.props.innerHTML = EGGS.map(function (e, i) { return '<span class="egg' + (animate ? " drop" : "") + '" style="--i:' + i + '">' + e + "</span>"; }).join("");
  }
  var state = { step: 0, run: 0, playing: true, started: false };
  var L = function (pair) { return JB.lang() === "id" ? pair[1] : pair[0]; };
  var sleepRaw = function (ms) { return new Promise(function (r) { setTimeout(r, JB.reduced ? 0 : ms); }); };

  /* ---------- persistent Studio state for a given step ---------- */
  function renderTree(withNew) {
    var html = "";
    BASE_TREE.forEach(function (svc) {
      html += '<li class="svc"><span class="ic"></span>' + svc + "</li>";
      NEW_TREE.forEach(function (n, i) {
        if (n[0] === svc) html += '<li class="child' + (withNew ? " on" : "") + '" data-new="' + i + '"><span class="ic s"></span>' + n[1] + "</li>";
      });
    });
    el.tree.innerHTML = html;
  }
  function setTokens(n) {
    el.tokens.textContent = n.toLocaleString("en-US");
    el.meter.style.width = (n / TOKENS * 100) + "%";
  }
  function setTab(name) { el.tabs.forEach(function (b) { b.classList.toggle("on", b.dataset.tab === name); }); }
  function log(line, cls) {
    var d = document.createElement("div");
    if (cls) d.className = cls;
    d.textContent = line;
    el.log.appendChild(d);
    el.log.scrollTop = el.log.scrollHeight;
  }
  function base(i) {
    el.tool.classList.toggle("show", i >= 1);
    el.tool.classList.toggle("hot", i === 1);
    el.pill.classList.toggle("on", i >= 2);
    el.pill.textContent = i >= 2 ? t("JokiBlox connected", "JokiBlox terhubung") : t("Not connected", "Belum terhubung");
    el.place.textContent = i >= 5 ? "PetSim.rbxl" : "Baseplate.rbxl";
    el.overlay.innerHTML = "";
    el.log.innerHTML = "";
    renderTree(i >= 5);
    var blocks = JB.placeBlocks(el.iso, CELLS, 130, 26);
    if (i >= 5) blocks.forEach(function (b) { b.classList.add("on"); });
    setTokens(i >= 6 ? TOKENS - SPEND - 42 : i >= 5 ? TOKENS - SPEND : TOKENS);
    el.props.innerHTML = "";
    if (i >= 6) placeEggs(false);
    root.classList.toggle("dock-open", i >= 1);
    return blocks;
  }

  /* ---------- step scenes ---------- */
  var SCENES = {
    install: async function (nap) {
      setTab("chat");
      el.dockBody.innerHTML = '<div class="dk-empty">' + t("Open <b>Plugins → JokiBlox</b> to start.", "Buka <b>Plugins → JokiBlox</b> untuk mulai.") + "</div>";
      el.overlay.innerHTML =
        '<div class="store-card">' +
        '<div class="sc-top"><div class="sc-icon"><img src="assets/img/logo.svg" alt=""></div><div><b>JokiBlox Agent</b><small>' + t("Plugin · Free to install", "Plugin · Gratis dipasang") + "</small></div></div>" +
        "<p>" + t("AI squad that builds, migrates and upgrades your game inside Studio.", "Squad AI yang membangun, migrasi, dan upgrade game kamu di dalam Studio.") + "</p>" +
        '<button class="sc-btn" type="button">' + t("Install", "Pasang") + "</button></div>";
      log(t("Creator Store: JokiBlox Agent", "Creator Store: JokiBlox Agent"));
      await nap(1400);
      var btn = $(".sc-btn", el.overlay);
      btn.classList.add("press");
      btn.textContent = t("Installing…", "Memasang…");
      await nap(1100);
      btn.classList.remove("press");
      btn.classList.add("done");
      btn.textContent = t("Installed ✓", "Terpasang ✓");
      log(t("Plugin installed: JokiBlox Agent", "Plugin terpasang: JokiBlox Agent"), "ok");
      await nap(700);
      el.tool.classList.add("show", "hot");
      log(t("Toolbar button added under Plugins", "Tombol toolbar ditambahkan di Plugins"));
    },
    connect: async function (nap) {
      setTab("chat");
      el.dockBody.innerHTML =
        '<div class="dk-card"><h5>' + t("Link this Studio", "Hubungkan Studio ini") + "</h5>" +
        "<p>" + t("Go to <b>jokiblox.com/pair</b> and enter:", "Buka <b>jokiblox.com/pair</b> lalu masukkan:") + "</p>" +
        '<div class="pair">482 913</div>' +
        '<ul class="checklist">' +
        "<li>" + t("Account linked — @builderman · Pro", "Akun terhubung — @builderman · Pro") + "</li>" +
        "<li>" + t("Studio MCP server detected", "Studio MCP server terdeteksi") + "</li>" +
        "<li>" + t("Snapshot of Baseplate.rbxl saved", "Snapshot Baseplate.rbxl tersimpan") + "</li>" +
        "<li>" + t("Ready — 10,000 tokens available", "Siap — 10.000 token tersedia") + "</li></ul></div>";
      var items = $$(".checklist li", el.dockBody);
      await nap(1200);
      for (var i = 0; i < items.length; i++) { items[i].classList.add("on"); log(items[i].textContent, "ok"); await nap(650); }
      el.pill.classList.add("on");
      el.pill.textContent = t("JokiBlox connected", "JokiBlox terhubung");
    },
    describe: async function (nap) {
      setTab("chat");
      el.dockBody.innerHTML =
        '<div class="dk-chat">' +
        '<div class="bubble ai">' + t("Hi! What are we building today?", "Halo! Mau bikin apa hari ini?") + "</div>" +
        '<div class="starter-chips"><span>Tycoon</span><span>Obby</span><span class="on">Pet Sim</span><span>' + t("Fix my game", "Perbaiki game") + "</span></div>" +
        '<div class="bubble you" data-typed></div>' +
        '<div class="bubble ai sys" data-read hidden></div>' +
        "</div>" +
        '<div class="dk-input"><span data-input-ph>' + t("Describe your game…", "Ceritakan game kamu…") + '</span><button type="button" aria-label="Send">➤</button></div>';
      await nap(700);
      var typed = $("[data-typed]", el.dockBody);
      await JB.typeInto(typed, t("Make a pet simulator with 3 zones, egg hatching, a pet inventory and a 2× luck gamepass. Mobile-friendly.",
                                 "Bikin pet simulator dengan 3 zona, buka telur, inventori pet dan gamepass 2× luck. Ramah HP."), 16);
      await nap(500);
      var read = $("[data-read]", el.dockBody);
      read.hidden = false;
      read.textContent = t("Reading your place… (Kimi · long context)", "Membaca place kamu… (Kimi · konteks panjang)");
      log(t("[Router] Whole-place read → Kimi", "[Router] Baca seluruh place → Kimi"));
      await nap(1300);
      read.textContent = t("Empty baseplate found. Drafting a plan…", "Baseplate kosong. Menyusun rencana…");
      log(t("[Architect] 0 scripts, 1 part — starting fresh", "[Architect] 0 script, 1 part — mulai dari awal"), "ok");
    },
    plan: async function (nap) {
      setTab("plan");
      var rows = [
        ["CurrencyService + DataStore", "scripter", "Scripter", "Claude"],
        [t("Egg hatching + rarity table", "Buka telur + tabel rarity"), "scripter", "Scripter", "Claude"],
        [t("3 zones + portals", "3 zona + portal"), "builder", "Builder", "DeepSeek"],
        [t("Pet inventory & shop UI (mobile)", "UI inventori & toko pet (mobile)"), "ui", "UI", "GPT"],
        [t("2× luck gamepass", "Gamepass 2× luck"), "scripter", "Scripter", "Claude"],
        [t("Playtest with 8 players", "Playtest 8 pemain"), "qa", "QA", "DeepSeek"],
      ];
      el.dockBody.innerHTML =
        '<div class="dk-card"><h5>' + t("Game plan · Pet Simulator", "Rencana game · Pet Simulator") + "</h5>" +
        '<ul class="plan-rows">' + rows.map(function (r) {
          return '<li><span class="av-mini">' + JB.avatar(r[1]) + "</span><span class=\"pr-t\">" + r[0] + "<small>" + r[2] + " · " + r[3] + "</small></span></li>";
        }).join("") + "</ul>" +
        '<div class="estimate"><span>' + t("Estimate", "Estimasi") + "</span><b>≈ 260 " + t("tokens · ~6 min", "token · ~6 mnt") + "</b></div>" +
        '<div class="dk-actions"><button type="button" class="ghost">' + t("Edit plan", "Ubah rencana") + '</button><button type="button" class="primary" data-start>▶ ' + t("Start squad", "Jalankan squad") + "</button></div></div>";
      var lis = $$(".plan-rows li", el.dockBody);
      for (var i = 0; i < lis.length; i++) { await nap(320); lis[i].classList.add("on"); }
      log(t("[Architect] Plan ready: 6 tasks, 4 agents", "[Architect] Rencana siap: 6 tugas, 4 agent"), "ok");
      await nap(600);
      $("[data-start]", el.dockBody).classList.add("pulse");
    },
    build: async function (nap, blocks) {
      setTab("squad");
      var agents = [
        ["scripter", "Scripter", [t("Writing CurrencyService…", "Menulis CurrencyService…"), t("Rarity table for EggHatch…", "Tabel rarity EggHatch…"), t("Wiring 2× luck gamepass…", "Menyambung gamepass 2× luck…")]],
        ["builder", "Builder", [t("Laying out zone 1…", "Membuat zona 1…"), t("Portals + barriers…", "Portal + pembatas…"), t("Egg stands…", "Stand telur…")]],
        ["ui", "UI/UX", [t("Inventory grid…", "Grid inventori…"), t("Shop buttons (mobile)…", "Tombol toko (mobile)…"), t("Scaling for phones…", "Skala untuk HP…")]],
        ["qa", "QA", [t("Waiting for first merge…", "Menunggu merge pertama…"), t("Spawning 8 test players…", "Menyiapkan 8 pemain uji…"), t("0 errors so far ✓", "Sejauh ini 0 error ✓")]],
      ];
      el.dockBody.innerHTML = '<div class="squad-lanes">' + agents.map(function (a) {
        return '<div class="lane-row"><span class="av-mini">' + JB.avatar(a[0]) + '</span><div class="lr-main"><div class="lr-top"><b>' + a[1] + '</b><span class="lr-act"></span></div><div class="lr-bar"><b></b></div></div></div>';
      }).join("") + '</div><div class="squad-foot"><span>' + t("Elapsed", "Waktu") + ' <b data-elapsed>0:00</b></span><span>' + t("Model calls", "Panggilan model") + ' <b data-calls>0</b></span></div>';
      var rows = $$(".lane-row", el.dockBody), elapsed = $("[data-elapsed]", el.dockBody), calls = $("[data-calls]", el.dockBody);
      var newItems = $$(".child", el.tree);
      var ticks = 24;
      var speed = [1, 0.92, 1.08, 0.7];
      var logs = [
        [3, "[Scripter] + ServerScriptService/CurrencyService"], [5, "[Builder] + Workspace/Zones (14 parts)"], [8, "[UI] + StarterGui/PetInventory"],
        [11, "[Scripter] + ServerScriptService/EggHatch"], [14, "[Builder] + Workspace/Eggs"], [16, "[UI] + StarterGui/ShopUI"],
        [19, "[Scripter] + ReplicatedStorage/PetData"], [21, "[QA] Playtest 8 players · 0 errors"],
      ];
      for (var k = 0; k <= ticks; k++) {
        var p = k / ticks;
        rows.forEach(function (r, i) {
          var pi = Math.min(1, p * speed[i] + (i === 3 ? 0 : 0.04));
          if (k === ticks) pi = 1;
          $(".lr-bar b", r).style.width = (pi * 100) + "%";
          var acts = agents[i][2];
          $(".lr-act", r).textContent = pi >= 1 ? t("Done ✓", "Selesai ✓") : acts[Math.min(acts.length - 1, Math.floor(pi * acts.length))];
          r.classList.toggle("done", pi >= 1);
        });
        var shown = Math.floor(p * blocks.length);
        for (var b = 0; b < shown; b++) blocks[b].classList.add("on");
        var showItems = Math.floor(p * newItems.length);
        for (var n = 0; n < showItems; n++) newItems[n].classList.add("on", "fresh");
        logs.forEach(function (l) { if (l[0] === k) log(l[1], "ok"); });
        setTokens(Math.round(TOKENS - SPEND * p));
        var secs = Math.round(p * 352);
        elapsed.textContent = Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0");
        calls.textContent = Math.round(p * 46);
        await nap(260);
      }
      blocks.forEach(function (b) { b.classList.add("on"); });
      newItems.forEach(function (n) { n.classList.add("on"); });
      log(t("[Squad] Done in 5m 52s · 258 tokens", "[Squad] Selesai 5m 52d · 258 token"), "ok");
    },
    assets: async function (nap) {
      setTab("assets");
      el.dockBody.innerHTML =
        '<div class="dk-input as-p"><span data-typed></span></div>' +
        '<div class="dk-eggs">' + EGGS.map(function (e, i) { return '<div class="dk-egg" data-i="' + i + '"><span class="shimmer"></span><small>' + ["Common", "Rare", "Legendary"][i] + "</small></div>"; }).join("") + "</div>" +
        '<div class="dk-actions"><button type="button" class="ghost">' + t("Regenerate", "Generate ulang") + '</button><button type="button" class="primary" data-insert>' + t("Insert 3", "Masukkan 3") + "</button></div>" +
        '<p class="dk-hint">' + t("Uploads via Open Cloud to your account or group.", "Diunggah lewat Open Cloud ke akun atau grup kamu.") + "</p>";
      await JB.typeInto($("[data-typed]", el.dockBody), t("Pet eggs: common, rare and legendary", "Telur pet: common, rare dan legendary"), 18);
      var tiles = $$(".dk-egg", el.dockBody);
      for (var i = 0; i < tiles.length; i++) {
        await nap(450);
        tiles[i].insertAdjacentHTML("afterbegin", EGGS[i]);
        tiles[i].classList.add("ready", "pick");
      }
      log(t("[Art] 3 egg meshes generated", "[Art] 3 mesh telur dibuat"), "ok");
      await nap(700);
      var ins = $("[data-insert]", el.dockBody);
      ins.classList.add("pulse");
      await nap(900);
      ins.classList.remove("pulse");
      ins.textContent = t("Inserted ✓", "Masuk ✓");
      ins.disabled = true;
      placeEggs(true);
      log(t("Open Cloud: 3 assets uploaded", "Open Cloud: 3 aset diunggah"), "ok");
      log("+ Workspace/Eggs/Common, Rare, Legendary", "ok");
      setTokens(TOKENS - SPEND - 42);
    },
    review: async function (nap) {
      setTab("changes");
      var files = [
        ["+", "ServerScriptService/CurrencyService", "+86"], ["+", "ServerScriptService/EggHatch", "+142"],
        ["~", "Workspace/Zones", "38 parts"], ["+", "StarterGui/PetInventory", "+61"], ["+", "ReplicatedStorage/PetData", "+40"],
      ];
      el.dockBody.innerHTML =
        '<ul class="changes">' + files.map(function (f, i) {
          return '<li class="' + (i === 1 ? "open" : "") + '"><span class="ch-k">' + f[0] + "</span><span class=\"ch-f\">" + f[1] + "</span><span class=\"ch-n\">" + f[2] + "</span></li>";
        }).join("") + "</ul>" +
        '<pre class="mini-diff"><span class="a">+ local RARITY = { Common = 70, Rare = 25, Legendary = 5 }</span>' +
        '<span class="a">+ local function roll(luck)</span><span class="a">+   local r = math.random() * 100 / luck</span><span class="c">  …</span></pre>' +
        '<div class="qa-box">✓ ' + t("Playtest · 8 players · 3 min · 0 errors", "Playtest · 8 pemain · 3 mnt · 0 error") + "</div>" +
        '<div class="dk-actions"><button type="button" class="ghost">' + t("Undo all", "Undo semua") + '</button><button type="button" class="primary" data-accept>' + t("Accept all", "Terima semua") + "</button></div>";
      await nap(1600);
      var acc = $("[data-accept]", el.dockBody);
      acc.classList.add("pulse");
      await nap(1100);
      acc.classList.remove("pulse");
      acc.textContent = t("Publish ▲", "Publish ▲");
      log(t("Changes accepted · snapshot kept", "Perubahan diterima · snapshot disimpan"), "ok");
      await nap(1000);
      acc.classList.add("pulse");
      await nap(900);
      acc.classList.remove("pulse");
      acc.textContent = t("Published ✓", "Terbit ✓");
      acc.disabled = true;
      el.overlay.innerHTML = '<div class="toast">✓ ' + t("Published to Roblox · Version 1", "Terbit di Roblox · Versi 1") + "</div>";
      log(t("Published PetSim · version 1", "PetSim terbit · versi 1"), "ok");
      await nap(1200);
      el.overlay.innerHTML = '<div class="toast dc">💬 ' + t("Sent to Discord #my-petsim", "Dikirim ke Discord #my-petsim") + "</div>";
      log(t("Discord: notified #my-petsim", "Discord: notifikasi ke #my-petsim"), "ok");
    },
  };

  /* ---------- controller ---------- */
  function caption(i) {
    var s = STEPS[i];
    el.caption.innerHTML =
      '<span class="cap-n">' + (i + 1) + "/" + STEPS.length + "</span><h3>" + L(s.title) + "</h3><p>" + L(s.text) + "</p>" +
      '<div class="cap-split"><div><small>' + t("You", "Kamu") + "</small>" + L(s.you) + "</div><div><small>JokiBlox</small>" + L(s.jb) + "</div></div>";
    el.steps.forEach(function (b, k) {
      b.classList.toggle("on", k === i);
      b.classList.toggle("done", k < i);
      b.setAttribute("aria-current", k === i ? "step" : "false");
    });
    el.prev.disabled = i === 0;
  }
  async function go(i) {
    state.step = i;
    var my = ++state.run;
    var nap = function (ms) { return sleepRaw(ms).then(function () { if (my !== state.run) throw "cancel"; }); };
    caption(i);
    var blocks = base(i);
    try {
      await SCENES[STEPS[i].key](nap, blocks);
      if (state.playing) {
        await nap(2600);
        go((i + 1) % STEPS.length);
      }
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
  JB.onVisible(root, function () { state.started = true; go(0); });
})();
