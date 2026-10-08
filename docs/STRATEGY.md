# JokiBlox Agent — USP data, AI integration, pricing logic

Internal doc (English). Last updated 8 Oct 2026.

## 1. Positioning

**JokiBlox Agent** is an AI game-dev squad that works inside Roblox Studio. Five products, one token balance:

| Product | Job | Main competitor reference |
|---|---|---|
| Create | Prompt → playable game (systems, UI, monetization) | Ropilot, Lemonade |
| Migrate & fix | Deprecated APIs, private audio, group transfers, errors | none focused on this (gap) |
| Remix & upgrade | Fork your own place → perf, security, retention upgrades | none focused on this (gap) |
| Assets | Props, textures, icons, UI kits → Open Cloud upload | Summer Engine (non-Roblox), Roblox Cube |
| Clothing & UGC | 585×559 clothing templates, accessory concepts, moderation pre-check | UGCraft AI |

**USP = Multiplayer Mode**: an Architect agent splits the game into independent systems, then specialist agents (Scripter, Builder, UI, QA, Monetize, Art) build in parallel. Competitors run a single assistant.

## 2. Speed claims (what the site says and why)

| Claim on site | Basis | Status |
|---|---|---|
| **2.3× faster** with one AI assistant | GitHub/Microsoft controlled study: 95 devs, 1h11m vs 2h41m (55% faster) — [GitHub blog](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/) | Sourced. Single task, vendor-run study, wide CI (21–89%). |
| **+31% publishes** for Roblox creators using AI | Roblox estimate, creators who used Assistant/AI tools at least once — [PocketGamer.biz](https://www.pocketgamer.biz/roblox-studio-chief-on-how-ai-will-revolutionise-ugc/) | Sourced, Roblox's own estimate. |
| **~25 min to first playable tycoon** (race: by hand ~6 h → one AI ~2.6 h → JokiBlox ~25 min) | By hand 4–8 h for a simple tycoon ([Playgama](https://playgama.com/blog/2025/07/10/how-much-time-is-needed-to-create-a-roblox-game/)); ÷2.3 for one assistant; 25 min = 4 parallel agents | **Target, not measured.** Labeled on site. Replace with beta data. |
| **15–30 min migration** vs 1–3 days by hand | Internal target for a mid-size game (≈200 scripts) | **Assumption / target.** Labeled. Measure in beta. |

Action: during beta, log wall-clock time per task (prompt → accepted diff) and publish real numbers before launch. Keep the "modeled/target" labels until then — consumer-protection risk otherwise.

## 3. How the AI integration works

```
Roblox Studio ──(Studio MCP server + JokiBlox plugin)──► JokiBlox Bridge (local)
      ▲                                                        │ HTTPS
      │ Open Cloud upload                                      ▼
      └──────────────────────────────── JokiBlox Cloud: Architect → parallel agents
                                         Smart Router ─► Claude · OpenAI · DeepSeek · Kimi
                                         Token meter, BYOK vault, snapshots
```

- **Studio access**: Roblox now ships an official **Studio MCP server** built into Studio (explore DataModel, write scripts, run Luau, playtest; 2026 updates added console output, play-mode control, BYOK in Assistant) — [docs](https://create.roblox.com/docs/studio/mcp). Use it as the primary channel; our own plugin adds diff review, snapshots and multi-agent locking.
- **Asset upload**: Open Cloud Assets API (API key with `asset:write`) supports audio, decals/images, models (FBX/GLB/RBXM). **Classic clothing is not listed as an Open Cloud asset type** — users upload clothing in Creator Hub themselves (we prepare the file + pre-check). Verify before launch.
- **Models** (router is model-agnostic; swap freely):
  - Claude (Anthropic Messages API, tool use) → architecture, refactors, hard debugging.
  - OpenAI → image generation (clothing textures, icons, thumbnails) + writing.
  - DeepSeek → bulk scans/migrations, cheapest per token. OpenAI-compatible API (`https://api.deepseek.com`).
  - Kimi (Moonshot) → long-context "read the whole place" pass. OpenAI-compatible API (`https://api.moonshot.ai/v1`).
  - Base URLs are from memory — confirm in each provider's docs. DeepSeek and Kimi being OpenAI-compatible means one client library covers three of the four providers.
- **Data**: turn off provider training on API data where offered; site promises we don't train on private game files.
- **Discord bot**: `/jb` commands start tasks; the bot posts progress, QA results and Review/Publish/Undo buttons. Same orchestrator as the Studio plugin.
- **Traffic alerts**: poll `games.roblox.com/v1/games?universeIds=` (`playing` = live CCU, `visits` = lifetime) every few minutes per subscribed game; fire a Discord/email alert when a threshold is crossed. Error-spike alerts need an in-game logger (HttpService → our endpoint) installed by the plugin.
- **QA agent**: runs a multi-client playtest (Studio MCP `start_stop_play` / `run_script_in_play_mode`) after every merged task; failures are routed back to the agent that made the change.
- **Competitive note**: Roblox Assistant now supports BYOK for Claude/OpenAI/Gemini and the MCP server is free. Our edge must be Multiplayer Mode, the migration/remix specialisation, clothing pipeline, Bahasa Indonesia, and local payments — not "AI in Studio" alone.

## 4. Pricing logic (USD)

| Plan | Price | Early-bird (−20%) | Tokens/mo | Parallel agents | $/token |
|---|---|---|---|---|---|
| Free | $0 | — | 300 | 1 | — |
| Starter | $12 | $9.60 | 3,000 | 2 | $0.0040 |
| Pro | $29 | $23.20 | 10,000 | 4 | $0.0029 |
| Studio | $79 (+$15/extra seat) | $63.20 | 35,000 | 8 | $0.0023 |

Yearly = pay 10 months. Top-ups: 1k/$5, 5k/$20, 20k/$70.
References: Ropilot Light $20 / Max $250 (BYO inference); UGCraft ~$10–24/mo.

**Unit economics check (needs beta data):** budget ≈ $0.001 model cost per token on DeepSeek/Kimi, with Claude/GPT tasks charged ~3× tokens. At Pro early-bird ($0.00232/token) that is ~55–60% gross margin if routing stays mostly on cheap models; heavy Claude users could go negative. Mitigations: router defaults to cheapest passing model, show token estimate before big tasks, BYOK on Pro+.

## 5. Assumptions to confirm (Ryan)

1. Launch date for countdown: **1 Nov 2026 00:00 WIB** (`site/assets/js/config.js`).
2. Early-bird: 20% for **12 months**, must subscribe **within 30 days of launch**; **+500 bonus tokens** for waitlist.
3. Legal entity named only as "JokiBlox" in Terms/Privacy — add the PT name, address and NIB once decided.
4. Contact email **hello@jokiblox.com** (needs a mailbox).
5. Refund rule: 7 days, <10% tokens used.
6. Local payments (QRIS/e-wallet) "planned at launch".
