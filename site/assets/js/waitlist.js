/* Waitlist form → Google Apps Script web app (see apps-script/). */
(function () {
  "use strict";
  var form = document.getElementById("waitlist-form");
  if (!form) return;
  var CFG = window.JOKIBLOX_CONFIG || {};
  var status = form.querySelector(".form-status");
  var success = form.parentNode.querySelector(".success");
  var t = function (en, id) { return window.JB ? window.JB.t(en, id) : en; };

  var params = new URLSearchParams(location.search);
  if (params.get("plan")) {
    var sel = form.querySelector("#plan");
    if (sel.querySelector('option[value="' + params.get("plan") + '"]')) sel.value = params.get("plan");
  }

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var ROBLOX = /^(?=.{3,20}$)[A-Za-z0-9]+(_[A-Za-z0-9]+)?$/;

  function mark(name, ok) {
    var f = form.querySelector('[data-field="' + name + '"]');
    if (f) f.classList.toggle("invalid", !ok);
    return ok;
  }

  function validate() {
    var ok = true;
    ok = mark("email", EMAIL.test(form.email.value.trim())) && ok;
    ok = mark("roblox_username", ROBLOX.test(form.roblox_username.value.trim())) && ok;
    ok = mark("goals", form.querySelectorAll('input[name="goals"]:checked').length > 0) && ok;
    ok = mark("problem", form.problem.value.trim().length >= 10) && ok;
    ok = mark("consent", form.consent.checked) && ok;
    return ok;
  }

  function code(email) {
    var h = 0;
    for (var i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) >>> 0;
    return "JOKI20-" + h.toString(36).toUpperCase().slice(-5).padStart(5, "0");
  }

  form.addEventListener("input", function (e) {
    var f = e.target.closest("[data-field]");
    if (f && f.classList.contains("invalid")) validate();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    status.className = "form-status";
    status.textContent = "";
    if (!validate()) {
      var first = form.querySelector(".invalid input, .invalid textarea");
      if (first) first.focus();
      return;
    }
    var email = form.email.value.trim().toLowerCase();
    var data = new URLSearchParams();
    ["email", "roblox_username", "role", "experience", "problem", "expectations", "plan", "model", "country", "source"].forEach(function (k) {
      data.append(k, k === "email" ? email : form[k].value.trim());
    });
    data.append("goals", Array.prototype.map.call(form.querySelectorAll('input[name="goals"]:checked'), function (c) { return c.value; }).join(", "));
    data.append("consent", "yes");
    data.append("lang", window.JB ? window.JB.lang() : "en");
    data.append("early_code", code(email));
    data.append("utm", ["utm_source", "utm_medium", "utm_campaign"].map(function (k) { return params.get(k) || ""; }).join("|"));
    data.append("page", location.href);

    // Honeypot filled → silently pretend success.
    if (form.website.value) return done(email);

    if (!CFG.WAITLIST_ENDPOINT && CFG.PREVIEW) return done(email); // preview build: show the success state, send nothing
    if (!CFG.WAITLIST_ENDPOINT) {
      status.className = "form-status error";
      status.textContent = t("The waitlist isn't connected yet. Please email hello@jokiblox.com.", "Waitlist belum tersambung. Silakan email hello@jokiblox.com.");
      console.warn("JokiBlox: set WAITLIST_ENDPOINT in assets/js/config.js");
      return;
    }

    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    status.textContent = t("Sending…", "Mengirim…");
    // no-cors keeps this a "simple" request (no preflight) which Apps Script accepts.
    fetch(CFG.WAITLIST_ENDPOINT, { method: "POST", mode: "no-cors", body: data })
      .then(function () { done(email); })
      .catch(function () {
        btn.disabled = false;
        status.className = "form-status error";
        status.textContent = t("Network error — please try again.", "Gangguan jaringan — coba lagi.");
      });
  });

  function done(email) {
    form.hidden = true;
    success.hidden = false;
    success.querySelector("[data-success-email]").textContent = email;
    success.querySelector("[data-success-code]").textContent = code(email);
    try { localStorage.setItem("jb-waitlist", email); } catch (e) {}
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  }
})();
