# Clips — how the Studio recordings become site motion

Every visual slot on the site can play a clip cut from a real Roblox Studio recording. A clip plays as a **prompt player**: the cursor clicks the JokiBlox prompt, the prompt is typed and sent, then the Studio clip runs with the agent's steps and a running clock. Empty slots keep their animation.

**See all slots:** open any page with `?slots` (e.g. `/?slots`, `/products.html?slots`, `/studio.html?slots`). Green tag = clip set.

## Current source: Sniper Arena test session (Oct 2026)
One prompt, empty baseplate, ≈1.5 h of real session time. Recordings (kept outside the repo):

| File | Content | Used for |
|---|---|---|
| `00_timelapse_roblox_only_10x` | Studio-only timelapse of the whole session | `hero` |
| `01_build_replay` | Map assembling zone by zone (**reconstruction**, labelled "Replay") | `how-build`, `fx-create`, `tour-build` |
| `02_api_check_migrate_backdoor` | Deprecated-API check + backdoor scan | `usp-migrate`, `fx-migrate` |
| `03_undo_satu_klik` | Night mode, then one-click undo | `usp-approve` |
| `04_user_testing_shop_misi_tembak` | QA agent: lobby, buy skin, claim missions, scope & shoot | `usp-qa`, `usp-runs`, `how-prompt`, `fx-assets`, `usp-precheck` (concept) |
| `05_anti_exploit_shield` | 8 attack types blocked, Shield panel | `usp-secure`, `usp-antiexploit` |
| `06_agent_review_bug_ide` | Agent review board: bugs fixed + ideas | `usp-squad` |
| `07_bug_hunt_jumppad_fix` | Reproducing the jump-pad bug in Play mode | `usp-inside` |
| `08_drone_view` | Drone flight around the finished arena | `how-publish`, CTA, `tour-publish` |

## Re-cutting
```
python3 tools/cut_clips.py <folder with the .mp4 recordings> [clip keys…]
```
- Crops the Studio viewport only (no ribbon, chat, dock or menu bar), 960×684, 24 fps, muted.
- Writes `site/assets/clips/<key>.mp4` (H.264), `<key>.webm` (VP9 fallback), `<key>.jpg` (poster) and the homepage timeline stills `t-*.jpg`.
- Segments and speed per clip live in `SPECS` at the top of the script. After a re-cut, check step timings in `config.js`.

## Wiring a clip to a slot
`site/assets/js/config.js` → `CLIPS`:
```js
"usp-qa": {
  src: "assets/clips/qa.mp4", kind: "real", speed: 5,       // kind: real | replay | concept
  prompt: ["Play it like a real player…", "Mainkan seperti pemain asli…"],
  steps: [[0, "Test 1/5: buy the skin", "Tes 1/5: beli skin"], [9.4, "Bought", "Terbeli"]],  // [video second, EN, ID]
  done: ["Session report: 8 bugs fixed", "Laporan sesi: 8 bug beres"]
},
"fx-qa": "usp-qa"   // reuse another slot's clip
```
- `steps` with a real session time: `[video second, real second, EN, ID]` (used by the hero clock).
- The small timer shows **video time × speed** (estimated real time). Keep `speed` honest.
- Label anything that is not a straight recording: `kind: "replay"` or `"concept"`, or `replayUntil` for a mixed clip.

## Recording more
Follow `docs/STUDIO-TEST-PLAN.md`. Hide personal info (dock, notifications, other accounts). Record Studio on the left so the same crop works, or note the new crop in `CROPS`.
