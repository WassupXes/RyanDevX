// Site config — edit these, no build step needed.
window.JOKIBLOX_CONFIG = {
  // Google Apps Script Web App URL (see apps-script/README.md). Leave empty until deployed.
  WAITLIST_ENDPOINT: "",
  // Public launch moment (WIB, UTC+7). Change if the launch date moves.
  LAUNCH_DATE: "2026-11-01T00:00:00+07:00",
  // Early-bird discount for waitlist members.
  EARLY_DISCOUNT: 0.20,
  // Clips cut from the Sniper Arena test session in Roblox Studio (tools/cut_clips.py).
  // Key = slot name (open any page with ?slots to see them). A string value = "same clip as that slot".
  // Each clip plays as: cursor clicks the JokiBlox prompt → prompt is typed → video runs with steps + timer.
  //   kind:  "real" (Studio recording), "replay" (rebuilt from the real build), "concept" (idea shown on real assets)
  //   replayUntil: seconds at the start of a "real" clip that are a replay (the tag switches after that)
  //   speed: how much the recording is sped up (the timer shows estimated real time = video time × speed)
  //   steps: [video second, EN, ID] — or [video second, real second, EN, ID] when the real session time is known
  //   [EN, ID] pairs everywhere else. Empty slots keep their animation.
  CLIPS: {
    "hero": {
      src: "assets/clips/hero.mp4", kind: "real", replayUntil: 9.1, end: 5700,
      prompt: ["Build a Sniper Arena from an empty baseplate: lobby, shop, missions, bots and anti-exploit.", "Buat game Sniper Arena dari baseplate kosong: lobby, shop, misi, bot, dan anti-exploit."],
      steps: [
        [0, 2, "Plan: 12 steps + config", "Rencana: 12 tahap + Config"],
        [1.5, 288, "Map: 4 color zones, sniper tower, bridges", "Map: 4 zona warna, menara sniper, jembatan"],
        [9.1, 702, "Lobby: Play, Shop, Inventory, Missions", "Lobby: Bermain, Shop, Inventory, Misi"],
        [12.6, 844, "Upgrade: sniper viewmodel, bounty, jump pads", "Upgrade: viewmodel sniper, bounty, jump pad"],
        [16.6, 4850, "QA agent buys skins and claims missions", "Agent QA beli skin & klaim misi"],
        [20.1, 5030, "Anti-exploit: 18 attacks blocked by the server", "Anti-exploit: 18 serangan diblokir server"],
        [24.1, 5400, "Drone view of the finished arena", "Drone view arena yang sudah jadi"]
      ],
      done: ["Sniper Arena · 1 prompt · ≈1.5 h · built, tested and QA’d by the agent", "Sniper Arena · 1 prompt · ≈1,5 jam · dibangun, dites & di-QA agent"]
    },
    "usp-inside": {
      src: "assets/clips/inside.mp4", kind: "real", speed: 2,
      prompt: ["The jump pad doesn’t launch me. Check it in Play mode.", "Jump pad-nya nggak melempar. Cek langsung di mode Play."],
      steps: [[0, "Playing as a test player", "Main sebagai pemain tes"], [4, "Walking onto the jump pad", "Jalan ke jump pad"], [6.5, "Found it: the tower ramp covers the pad", "Ketemu: ramp menara menutupi pad"]],
      done: ["Pads moved, launch fixed. No copy-paste.", "Pad dipindah, lontaran beres. Tanpa copy-paste."]
    },
    "usp-runs": {
      src: "assets/clips/runs.mp4", kind: "real", speed: 4,
      prompt: ["Test the arena: scope, shoot, server hit check.", "Tes arena: scope, tembak, cek hit di server."],
      steps: [[0, "Test 3/5: scope & shoot, checked by the server", "Tes 3/5: scope & tembak, dicek server"], [11, "Test 4/5: inspect, run, jump, jump pad", "Tes 4/5: inspeksi, lari, loncat, jump pad"]],
      done: ["Tested in Studio before it reaches you", "Dites di Studio sebelum sampai ke kamu"]
    },
    "usp-approve": {
      src: "assets/clips/undo.mp4", kind: "real", speed: 1.5,
      prompt: ["Try a night mode for the arena.", "Coba mode malam untuk arena."],
      steps: [[0, "Snapshot saved", "Snapshot disimpan"], [1.9, "Night lighting on (1 undo step)", "Lighting malam (1 langkah undo)"], [9, "You clicked Undo: back to the last version", "Kamu klik Undo: kembali ke versi sebelumnya"]],
      done: ["Nothing stays without your OK", "Tidak ada yang tersimpan tanpa izinmu"]
    },
    "usp-qa": {
      src: "assets/clips/qa.mp4", kind: "real", speed: 5,
      prompt: ["Play it like a real player: buy a skin, claim missions.", "Mainkan seperti pemain asli: beli skin, klaim misi."],
      steps: [[0, "Test 1/5: buy the Naga Emas skin", "Tes 1/5: beli skin Naga Emas"], [9.4, "Bought and equipped", "Terbeli dan dipakai"], [10.8, "Test 2/5: claim daily missions", "Tes 2/5: klaim hadiah misi harian"]],
      done: ["Session report: 8 bugs found and fixed", "Laporan sesi: 8 bug ditemukan & diperbaiki"]
    },
    "usp-secure": {
      src: "assets/clips/secure.mp4", kind: "real", speed: 2.5,
      prompt: ["Attack my remotes like an exploiter would.", "Serang remote-ku seperti exploiter."],
      steps: [[0, "Attack 1: NaN payload → rejected", "Serangan 1: payload NaN → ditolak"], [2.4, "Attack 2: fake payload → rejected", "Serangan 2: payload palsu → ditolak"], [3.6, "Attack 4: buy a skin that doesn’t exist → blocked", "Serangan 4: beli skin yang tidak ada → diblokir"], [5, "Attack 5: claim an unfinished reward → blocked", "Serangan 5: klaim hadiah belum selesai → diblokir"]],
      done: ["Every remote is checked on the server", "Semua remote dicek di server"]
    },
    "usp-antiexploit": {
      src: "assets/clips/shield.mp4", kind: "real", speed: 4,
      prompt: ["Run the exploit test: speed, teleport, remote spam.", "Jalankan tes exploit: speed, teleport, spam remote."],
      steps: [[0, "Speed hack: WalkSpeed 150", "Speed hack: WalkSpeed 150"], [7.4, "Teleport hack: 200 studs", "Teleport hack: 200 studs"], [12, "CFrame stepping", "CFrame stepping"]],
      done: ["18 attacks blocked and logged by the server", "18 serangan diblokir & dicatat server"]
    },
    "usp-squad": {
      src: "assets/clips/review.mp4", kind: "real", speed: 2,
      prompt: ["Review the session: what broke, and what would make it more fun?", "Review sesi ini: apa yang rusak, apa yang bikin lebih seru?"],
      steps: [[0, "Bugs found → fixed", "Bug ditemukan → diperbaiki"], [5, "Agent ideas: killcam, fairer bots", "Ide agent: killcam, bot lebih adil"], [9, "Built: viewmodel + bolt-action", "Dibuat: viewmodel + bolt-action"]],
      done: ["8 bugs fixed · 4 ideas built · 2 in the backlog", "8 bug beres · 4 ide dibuat · 2 masuk backlog"]
    },
    "usp-precheck": {
      src: "assets/clips/skins.mp4", kind: "concept", speed: 3,
      prompt: ["Check these skins before I pay to upload.", "Cek skin ini sebelum aku bayar upload."],
      steps: [[0, "Size and texture limits ✓", "Batas ukuran & tekstur ✓"], [4, "Moderation risk: low", "Risiko moderasi: rendah"], [8, "Ready to upload", "Siap upload"]],
      done: ["Checked before you spend Robux", "Dicek sebelum kamu keluar Robux"]
    },
    "usp-migrate": {
      src: "assets/clips/scan.mp4", kind: "real", speed: 3,
      prompt: ["Scan every script for deprecated APIs and backdoors.", "Scan semua script: API usang & backdoor."],
      steps: [[0, "Checking against the Roblox API docs", "Cek ke dokumentasi API Roblox"], [3, "Deprecated: CreateHumanoid… → Async version", "Usang: CreateHumanoid… → versi Async"], [6, "Anti-pattern: Instance.new(class, parent) → fixed", "Anti-pattern: Instance.new(class, parent) → diperbaiki"], [9, "20 scripts scanned · 0 backdoors", "20 script dipindai · 0 backdoor"]],
      done: ["Fixed and re-tested", "Diperbaiki dan dites ulang"]
    },
    "how-prompt": {
      src: "assets/clips/lobby.mp4", kind: "real", speed: 1,
      prompt: ["Add a lobby with Play, Shop, Inventory and Missions.", "Tambah lobby dengan tombol Bermain, Shop, Inventory, dan Misi."],
      steps: [[0, "Lobby ready to test", "Lobby siap dites"]],
      done: ["Your idea, in your Studio", "Idemu, di Studio kamu"]
    },
    "how-build": {
      src: "assets/clips/build.mp4", kind: "replay", speed: 3.5,
      prompt: ["Build the arena: 4 color zones, a sniper tower, bridges.", "Bangun arena: 4 zona warna, menara sniper, jembatan."],
      steps: [[0, "Builder: 4 color zones", "Builder: 4 zona warna"], [6, "Tower and neon bridges", "Menara dan jembatan neon"], [11, "Lobby and jump pads", "Lobby dan jump pad"]],
      done: ["Map done: 222 parts", "Map jadi: 222 part"]
    },
    "how-publish": {
      src: "assets/clips/drone.mp4", kind: "real", speed: 3,
      prompt: ["Fly a drone around the finished arena.", "Terbangkan drone keliling arena yang sudah jadi."],
      steps: [[0, "Drone view", "Drone view"]],
      done: ["Ready to publish", "Siap publish"]
    },
    "fx-assets": {
      src: "assets/clips/skins.mp4", kind: "real", speed: 3,
      prompt: ["Make 5 sniper skins for the shop, priced in Credits.", "Buat 5 skin sniper untuk shop, harga pakai Credits."],
      steps: [[0, "Skins in the shop", "Skin masuk shop"], [6, "Bought by the QA agent", "Dibeli agent QA"]],
      done: ["Generated, priced and tested", "Dibuat, diberi harga, dan dites"]
    },
    "fx-create": "how-build",
    "fx-qa": "usp-qa",
    "fx-antiexploit": "usp-antiexploit",
    "fx-migrate": "usp-migrate",
    "tour-build": "how-build",
    "tour-assets": "fx-assets",
    "tour-publish": "how-publish"
  },
  // Yearly billing = pay 10 months, get 12.
  YEARLY_MONTHS_PAID: 10,
};
