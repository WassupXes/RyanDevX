# Studio + Claude test plan (measure real build times)

Why: the site currently shows **targets** ("~6 min" for a simple game, "~25 min" for a tycoon, "15–30 min" for a migration). Before launch we replace them with measured numbers and real screen recordings, and the Studio-tour timeline uses the real timestamps.

## 1. Setup (≈5 min)
1. Roblox Studio → open a new **Baseplate**.
2. **Assistant** panel → `⋯` → **Settings** → **MCP Servers** → turn on **Enable Studio as MCP server** (status shows "No clients connected").
3. Connect Claude, one of:
   - **Claude Desktop:** toggle *Claude Desktop* under Quick connect, restart Claude Desktop.
   - **Claude Code CLI:** click *Claude Code CLI* → follow the setup instructions (docs: https://create.roblox.com/docs/studio/mcp).
4. Status must show **1 client connected**. In Claude, ask: "List the services in my open Studio place" to confirm.
5. Start a screen recording (macOS: ⌘⇧5 · Windows: Win+Alt+R / OBS), 1080p, Studio window only. Hide username/avatar.

Use a test account. Do not publish. Do not run anything you don't understand.

## 2. Benchmarks (paste each prompt as one message)

**B1 — Coin collector (matches the website tour)**
```
Make a coin-collecting game in this place: spawn 24 gold coins around the baseplate, a leaderstats
"Coins" value per player, a server-validated CoinCollected RemoteEvent, a ScreenGui HUD showing
"Coins: N", a pickup sound, and a Config ModuleScript for coin value and respawn time.
When done, start a playtest, collect at least 3 coins, read the console output and fix any errors.
```
Pass when: playtest runs, HUD updates, leaderstats increase, no errors in Output.

**B2 — 10-stage obby**
```
Build a 10-stage obby on this baseplate: stages get harder, a checkpoint per stage saved with
DataStore, a kill brick that respawns at the last checkpoint, a timer leaderboard, and a
"Skip stage" developer product stub. Playtest and fix errors.
```
Pass when: you can walk from stage 1 to 3, die and respawn at the checkpoint, timer shows.

**B3 — Simple tycoon**
```
Build a simple tycoon: a plot with 3 droppers, a conveyor to a collector, cash in leaderstats,
buy buttons for each dropper, and a rebirth button that resets cash for a 2× multiplier.
Mobile-friendly UI. Playtest and fix errors.
```
Pass when: droppers produce cash, buttons buy droppers, rebirth works.

**B4 — Migration**
First ask Claude: "Create a test script in ServerScriptService that uses wait(), spawn(), BodyVelocity and game:GetService('Chat'):Chat()". Then:
```
Scan every script in this place and migrate deprecated APIs: wait/spawn/delay → task library,
BodyVelocity/BodyGyro/BodyPosition → constraints, legacy Chat → TextChatService.
Show me what you changed, then playtest and confirm there are no errors or deprecation warnings.
```
Pass when: no deprecated calls remain and the playtest is clean.

## 3. What to record (per run)
| Field | How |
|---|---|
| Time to first playable | Stopwatch from pressing send until the pass condition is met |
| Messages needed | Count your follow-up prompts (0 = one-shot) |
| Errors hit | Count red Output errors during the run |
| Manual fixes | Anything you had to change by hand |
| Cost / tokens | Claude Code: `/cost` at the end · Claude Desktop: usage page |
| Notes | What broke, what impressed |

Run each benchmark **3 times** on a fresh Baseplate and report the **median**.

Optional "squad" check: in Claude Code, ask it to use parallel subagents ("split this into map, scripts and UI and work on them in parallel") and compare times with the single-agent run. This approximates JokiBlox Multiplayer Mode.

## 4. Results template
```
benchmark,run,model,minutes_to_playable,messages,errors,manual_fixes,cost_usd,notes
B1,1,,,,,,,
B1,2,,,,,,,
B1,3,,,,,,,
B2,1,,,,,,,
...
```
Save as `docs/benchmarks.csv`, and put the recordings in a shared folder (they can be sped up into the website's "running seconds" demo).

## 5. What happens with the results
- Site numbers ("~6 min", "~25 min", "15–30 min") are replaced with the medians, with "measured on <date>, Claude via Studio MCP".
- The Studio-tour timeline (`EVENTS` in `site/assets/js/studio.js`) is updated to the real timestamps from the recording.
- If a benchmark can't reach "playable" without manual fixes, we reword the claim instead of hiding it.
