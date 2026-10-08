# Demo video: record in Roblox Studio and embed

The site has named clip slots (see `docs/CLIPS.md`). Until a clip is set, each slot keeps its animation or illustration.

## 1. Record (follow `docs/STUDIO-TEST-PLAN.md`, benchmark B1)
- Roblox Studio + Claude connected through **Enable Studio as MCP server** (Claude Desktop or Claude Code CLI).
- Fresh **Baseplate**, test account. Hide/blur username, avatar, IDs and file paths.
- Screen recording at **1920×1080**, Studio and the Claude window side by side (or Claude inside Studio's Assistant panel).
- Start recording **before** you press send and stop when the playtest passes. Keep the raw file: it is also the benchmark measurement.

## 2. Edit (CapCut, DaVinci Resolve or iMovie)
- Cut dead time, then speed up to fit **30–60 s** (usually 8–12×).
- Add a running **real-time clock** in a corner (0s → 6m 12s); this is the "1s, 2s, 3s… 6m" effect, using real timestamps.
- 4–5 short captions: *Prompt* → *Plan* → *Building* → *QA playtest* → *Playable in Xm Ys*.
- End card: JokiBlox logo + "Join the waitlist — 20% off".
- No audio needed (it autoplays muted).
- Optional: a 9:16 vertical cut for TikTok/Reels.

## 3. Export
- **MP4 (H.264)**, 1920×1080 or 1280×720, 30 fps, **≤ 15 MB** (smaller loads faster).
- A **poster JPG** (one clean frame, same size) for the moment before the video loads.
- File names: `jokiblox-demo.mp4`, `jokiblox-demo.jpg`.

## 4. Send it (any one)
1. Put both files in `site/assets/video/` on branch `claude/dazzling-galileo-xznxdg` and push.
2. Upload to **Google Drive** and tell Claude the file names (Claude can fetch them via the Drive connector).
3. Upload to **YouTube as Unlisted** and send the video ID (the part after `v=`).

## 5. Embed
The hero is the slot `hero`; other spots on the site are listed in `docs/CLIPS.md`. Register files in `site/assets/js/config.js` → `CLIPS`, e.g. `"hero": "assets/clips/hero.mp4"`, then push (the VPS auto-updates within 5 minutes).

**Label it honestly.** The recording shows Claude working through Studio's MCP server, the engine JokiBlox is built on, not the finished JokiBlox panel. Keep the caption so viewers know what they're watching. Once the JokiBlox plugin exists, re-record with it.
