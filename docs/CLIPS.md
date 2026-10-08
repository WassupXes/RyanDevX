# Clip slots — what to cut from the Studio recording

The site shows **clips from a real Roblox Studio recording**, from the user's point of view (what they type, see and click). Every visual on the site is a named **slot**. An empty slot keeps its current animation/illustration; a filled slot plays the clip (muted, autoplay, only while on screen).

**See all slots:** open any page with `?slots`, e.g. `http://202.155.19.19/?slots`, `/products.html?slots`, `/studio.html?slots`. Each slot shows a yellow tag with its name (green = clip set).

## Recording
Follow `docs/STUDIO-TEST-PLAN.md` (Claude connected via **Enable Studio as MCP server**, fresh Baseplate, 1920×1080, personal info hidden). One long recording per benchmark is enough; the clips below are cut from it.

## Clip specs (all)
- **16:9**, 1920×1080 or 1280×720, **MP4 (H.264)**, 30 fps, **no audio**.
- **6–15 s** each (hero 20–40 s), sped up where nothing happens. Keep a small **real-time clock** in a corner when showing building.
- Crop to the part of Studio that matters (e.g. the panel + viewport), not the whole desktop.
- **≤ 4 MB** per clip (hero ≤ 12 MB). File name = slot name, e.g. `how-build.mp4`.

## Slot list

### Homepage (`/`)
| Slot | Show (user POV) | Length |
|---|---|---|
| `hero` | Best moments of one build: prompt typed → parts/scripts appearing → playtest → "playable". Clock visible. | 20–40 s |
| `how-prompt` | Typing the request into the AI panel in Studio and pressing send. | 6–8 s |
| `how-plan` | The plan appearing (tasks list), user scrolling/approving it. | 6–8 s |
| `how-build` | Viewport filling up: coins/parts appear, Explorer gets new scripts, clock running. | 10–15 s |
| `how-publish` | Playtest with the character collecting coins, HUD counting up, then Publish. | 8–12 s |
**USP cards ("Why JokiBlox")** — each clip proves one promise; see `docs/USER-RESEARCH.md` for the complaint it answers.

| Slot | Show (user POV) | Length |
|---|---|---|
| `usp-inside` | Error appears in Output → agent fixes it and re-runs. No copy-paste. | 8–12 s |
| `usp-runs` | Script generated → API/type checks pass → playtest runs clean. | 8–12 s |
| `usp-approve` | Plan approved → diff shown → Undo restores instantly. | 8–12 s |
| `usp-qa` | Multi-client playtest; bug found → fixed → recheck passes. | 10–15 s |
| `usp-secure` | Remote handler gets validation lines; free-model backdoor flagged. | 8–12 s |
| `usp-antiexploit` | A test account speed-hacks/teleports/flies in a playtest → server check snaps it back or kicks → log + Discord alert. Use your own test place only. | 10–15 s |
| `usp-squad` | One prompt → agents working in parallel → playable, clock running. | 10–15 s |
| `usp-precheck` | Design fails pre-check → fixed → passes → upload. | 8–12 s |
| `usp-migrate` | Output full of deprecation warnings → one pass → clean Output. | 8–12 s |

### Products (`/products.html`)
One clip per feature row: `fx-create`, `fx-clone`, `fx-migrate`, `fx-assets`, `fx-clothing`, `fx-discord`, `fx-qa`, `fx-antiexploit` (same specs, 8–15 s).

### Studio tour (`/studio.html`)
| Slot | Show | Length |
|---|---|---|
| `tour-install` | Toolbox → Creator Store → install the plugin → button appears in Plugins tab. | 6–10 s |
| `tour-connect` | Assistant → Settings → MCP Servers → toggle "Enable Studio as MCP server" → "1 client connected". | 6–10 s |
| `tour-prompt` | Typing the prompt and sending it. | 6–8 s |
| `tour-plan` | Plan appears; user approves. | 6–8 s |
| `tour-build` | The build, sped up with the clock (0s → done). | 15–25 s |
| `tour-assets` | Generating/importing an asset and inserting it. | 8–12 s |
| `tour-review` | Reviewing changes, playtest, Publish. | 8–12 s |

Until the JokiBlox plugin exists, `tour-install` can stay empty (the illustration remains).

## Hand-over and registering
1. Put the files in `site/assets/clips/` (or send them via Google Drive and Claude will add them).
2. Register them in `site/assets/js/config.js`:
```js
CLIPS: {
  "hero": "assets/clips/hero.mp4",
  "how-build": "assets/clips/how-build.mp4",
  // …
},
```
3. Push. The VPS updates itself within 5 minutes (auto-deploy).

The caption under the hero clip comes from `CLIP_NOTE` ("Real recording in Roblox Studio · sped up"). Keep it while the footage shows Claude via Studio MCP rather than the finished JokiBlox plugin.
