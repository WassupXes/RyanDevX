/* Hero: example prompts are typed and games appear in a gallery (Spaces-style cards). Display only. */
(function () {
  "use strict";
  var root = document.querySelector("[data-gallery]");
  if (!root || !window.JB) return;
  var JB = window.JB, t = JB.t;
  var grid = root.querySelector("[data-gal-grid]"), field = root.querySelector("[data-gal-input]"), go = root.querySelector("[data-gal-go]");
  var status = root.querySelector("[data-gal-status]");
  var MAX = 6, run = 0, idx = 0;
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, JB.reduced ? 0 : ms); }); };

  var GRADS = [["#ff6fb5", "#7b5cff"], ["#2ec5ff", "#2563eb"], ["#3ddc84", "#0f9d58"], ["#ffb347", "#ff6a3d"], ["#a78bfa", "#4f46e5"], ["#fde047", "#f59e0b"], ["#94a3b8", "#334155"], ["#f472b6", "#ef4444"]];
  var IDEAS = [
    ["🥚", "Pet Paradise", ["Pet simulator with eggs, 3 zones and a 2× luck pass", "Pet simulator dengan telur, 3 zona dan pass 2× luck"], 372],
    ["👻", "Sekolah Angker", ["Horror game in a school, 5 floors, flashlight", "Game horor di sekolah, 5 lantai, senter"], 455],
    ["🏭", "Mega Factory", ["Tycoon with 3 droppers, conveyor and rebirths", "Tycoon 3 dropper, conveyor dan rebirth"], 418],
    ["🧗", "Neon Obby 50", ["50-stage neon obby with checkpoints and timer", "Obby neon 50 stage dengan checkpoint dan timer"], 341],
    ["🏎️", "Jakarta Drift", ["Racing game through Jakarta streets with drift points", "Game balap di jalanan Jakarta dengan poin drift"], 498],
    ["🍜", "Warung Tycoon", ["Food stall tycoon: serve customers, upgrade the kitchen", "Tycoon warung: layani pembeli, upgrade dapur"], 386],
    ["🗼", "Monas Defense", ["Tower defense around Monas with 10 waves", "Tower defense di sekitar Monas, 10 gelombang"], 512],
    ["👕", "Batik Runway", ["Fashion show game with batik outfits and voting", "Game fashion show dengan baju batik dan voting"], 401],
  ];
  function fmt(s) { s = Math.round(s); return s < 60 ? s + "s" : Math.floor(s / 60) + "m " + (s % 60) + "s"; }
  function card(idea, gi, building) {
    var g = GRADS[gi % GRADS.length];
    var el = document.createElement("article");
    el.className = "gcard" + (building ? " building" : "");
    el.style.setProperty("--g1", g[0]);
    el.style.setProperty("--g2", g[1]);
    el.innerHTML = '<span class="g-emoji" aria-hidden="true">' + idea[0] + "</span>" +
      '<b class="g-title"></b><p class="g-prompt"></p>' +
      '<div class="g-foot"><span class="g-state"></span><span class="g-time"></span></div><i class="g-bar"><b></b></i>';
    el.querySelector(".g-title").textContent = idea[1];
    el.querySelector(".g-prompt").textContent = "“" + t(idea[2][0], idea[2][1]) + "”";
    setDone(el, idea[3], !building);
    return el;
  }
  function setDone(el, secs, done) {
    el.classList.toggle("building", !done);
    el.querySelector(".g-state").innerHTML = done ? "● " + t("Playable", "Siap main") : t("Building…", "Membangun…");
    el.querySelector(".g-time").textContent = done ? fmt(secs) : "";
  }
  function fill() {
    grid.innerHTML = "";
    for (var i = 0; i < MAX; i++) grid.appendChild(card(IDEAS[(i + 1) % IDEAS.length], i + 1, false));
  }
  async function build(idea, gi) {
    var my = ++run;
    var alive = function () { if (my !== run) throw "cancel"; };
    try {
      field.textContent = "";
      field.classList.add("typing");
      var text = t(idea[2][0], idea[2][1]);
      for (var i = 1; i <= text.length; i++) { field.textContent = text.slice(0, i); await sleep(26); alive(); }
      field.classList.remove("typing");
      go.classList.add("press");
      await sleep(220); alive();
      go.classList.remove("press");
      var el = card(idea, gi, true);
      grid.insertBefore(el, grid.firstChild);
      while (grid.children.length > MAX) grid.removeChild(grid.lastChild);
      var bar = el.querySelector(".g-bar b"), time = el.querySelector(".g-time");
      var steps = 60;
      for (var k = 1; k <= steps; k++) {
        var p = k / steps, sim = idea[3] * Math.pow(p, 1.8);
        bar.style.width = (p * 100) + "%";
        time.textContent = fmt(sim);
        status.textContent = t("Building “" + idea[1] + "” · 4 agents · " + fmt(sim), "Membangun “" + idea[1] + "” · 4 agent · " + fmt(sim));
        await sleep(70); alive();
      }
      setDone(el, idea[3], true);
      el.classList.add("pop");
      status.textContent = t("“" + idea[1] + "” is playable · " + fmt(idea[3]), "“" + idea[1] + "” siap main · " + fmt(idea[3]));
      field.textContent = "";
      await sleep(2600); alive();
      idx = (idx + 1) % IDEAS.length;
      build(IDEAS[idx], idx);
    } catch (e) { if (e !== "cancel") throw e; }
  }

  fill();
  JB.onVisible(root, function () { build(IDEAS[0], 0); });
  document.addEventListener("jb:lang", function () { fill(); build(IDEAS[idx], idx); });
})();
