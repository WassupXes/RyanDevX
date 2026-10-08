# Roblox Studio screenshots — shot list

Goal: real Studio references so the website's Studio mockups (hero, feature demos, Studio tour) match what creators actually see. Some shots may also be used directly on the site.

## Rules for every shot
- Roblox Studio **dark theme**, latest version, window **1920×1080** (or larger, same 16:9), display scaling 100% or 200%.
- **PNG**, no compression artifacts. One shot = one file, named exactly as below.
- **No personal data**: hide or blur usernames, avatar, user/group IDs, email, Robux balance, notifications with names. Use a fresh test account if possible.
- Don't show other creators' games or assets you don't own. Use Studio's own templates (Baseplate, Classic Baseplate, Obby, etc.).
- Save to `site/assets/img/studio/` in this repo.

## Shot list

**Received 8 Oct 2026 (in chat):** overview + Assistant panel (#1, #3), Avatar tab (#14), Explorer (#4), Import Preview (#8), Assistant Settings → MCP Servers (#12). The Studio tour now follows these.
**Still useful:** #2, #5, #6, #7, #9, #10, #11, #13.

| # | File name | What to capture | Used for |
|---|---|---|---|
| 1 | `studio-overview.png` | New **Baseplate** place, default layout: top bar (playtest buttons, tabs Home · Model · Avatar · UI · Script · Plugins, Assistant on the right), Toolbox left, Explorer + Properties right, Output bottom. Full window. | Studio frame accuracy (tour + hero) |
| 2 | `studio-plugins-tab.png` | **Plugins** tab selected so its toolbar is visible. Crop: top ~220 px of the window, full width. | Tour step 1 (plugin button) |
| 3 | `studio-assistant-panel.png` | **Assistant** panel open with one short prompt and answer (e.g. "Add a part"). Full window. | Dock/panel style, chat layout |
| 4 | `studio-explorer-tree.png` | Explorer with Workspace, Players, Lighting, ReplicatedStorage, ServerScriptService, StarterGui expanded one level, a Script selected. Crop: Explorer + Properties panels only. | Explorer accuracy |
| 5 | `studio-script-editor.png` | A Script open in the editor with ~20 lines of Luau (e.g. a leaderstats script). Full window. | Code/diff visuals |
| 6 | `studio-output-warnings.png` | Output panel showing a few warnings/errors (e.g. run a script that uses `wait()` / a deprecated API, or an intentional error). Crop: Output panel. | Migrate & fix demo |
| 7 | `studio-toolbox-grid.png` | Toolbox → Creator Store → **Models** grid showing thumbnails (search "chest" or "egg"). Crop: Toolbox panel. | AI assets grid style |
| 8 | `studio-import-3d.png` | **File → Import 3D** dialog with any `.fbx`/`.glb` model previewed. Full window. | Asset insert flow |
| 9 | `studio-playtest-players.png` | Test with **multiple clients** (server + 2–4 players) running, windows visible or the "Clients and Servers" controls. Full window. | QA agent / bot playtests |
| 10 | `studio-template-viewport.png` | A Studio template (e.g. **Obby** or **Village**) in the viewport, nice 3/4 camera angle, UI panels visible. Full window. | Hero / clone & upgrade visuals |
| 11 | `studio-game-settings-security.png` | **Game Settings → Security** showing "Allow HTTP Requests" and "Enable Studio Access to API Services". Crop: dialog. | Setup step accuracy |
| 12 | `studio-mcp-or-ai-settings.png` | Wherever the **Studio MCP server / AI assistant** connection is enabled or configured in the current Studio (Assistant settings, Beta Features, or MCP setup screen). Full window. | "Connect" step accuracy |
| 13 | `creator-hub-analytics.png` | Creator Hub (create.roblox.com) → an experience you own → **Analytics** showing concurrent users / visits. Blur the experience name if private. | Traffic-alert feature |
| 14 | `studio-avatar-tab.png` | **Avatar** tab toolbar (Accessory Fitting Tool / Rig Builder visible). Crop: top ~220 px. | Clothing & UGC demo |

Optional: a 10–20 s screen recording (`.mp4`, 1080p) of inserting a model from the Toolbox into the viewport — useful for the asset-insert animation timing.

## When done
Commit to branch `claude/dazzling-galileo-xznxdg` (folder `site/assets/img/studio/`) and push, or upload the PNGs in the chat. Claude will then align the mockups and use the clean shots on the site.

---

## Prompt for a local Claude agent (computer use)

Paste this into a Claude session running on the computer that has Roblox Studio installed:

```
Open Roblox Studio (already installed and logged in) and capture the screenshots listed in
docs/STUDIO-SCREENSHOTS.md of the repo WassupXes/RyanDevX (branch claude/dazzling-galileo-xznxdg).
Rules: dark theme, 1920×1080 window, PNG, exact file names from the table, save into
site/assets/img/studio/. Use a new Baseplate or Studio templates only. Before saving, check each
image for personal data (username, avatar, IDs, Robux, email) and blur or crop it out.
Do not publish any place, do not change account settings, do not buy anything.
When finished, list which shots you captured and which you couldn't, then commit and push them
to the same branch.
```
