// Site config — edit these, no build step needed.
window.JOKIBLOX_CONFIG = {
  // Google Apps Script Web App URL (see apps-script/README.md). Leave empty until deployed.
  WAITLIST_ENDPOINT: "",
  // Public launch moment (WIB, UTC+7). Change if the launch date moves.
  LAUNCH_DATE: "2026-11-01T00:00:00+07:00",
  // Early-bird discount for waitlist members.
  EARLY_DISCOUNT: 0.20,
  // Video clips cut from the Roblox Studio demo recording. Key = slot name, value = file path.
  // Empty slots keep their animation/illustration. Open any page with ?slots to see every slot name.
  // Example: CLIPS: { "hero": "assets/clips/hero.mp4", "how-build": "assets/clips/how-build.mp4" }
  CLIPS: {},
  // Note shown under clips, so viewers know what they're watching.
  CLIP_NOTE: { en: "Real recording in Roblox Studio · sped up", id: "Rekaman asli di Roblox Studio · dipercepat" },
  // Yearly billing = pay 10 months, get 12.
  YEARLY_MONTHS_PAID: 10,
};
