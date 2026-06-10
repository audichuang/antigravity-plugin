# antigravity-plugin

Multi-host plugin (Claude Code / Codex CLI / agy / `npx`) that drives the **real
Google Antigravity CLI (`agy`)** via `agy --print` — review, delegate, image,
handoff — with crash-survivable background jobs. Hardened fork of
`sakibsadmanshajib/antigravity-plugin`. Commands and the handoff are thin; the
real logic lives in `scripts/`.

## Commands

```bash
npm test    # node --test --experimental-test-module-mocks tests/*.test.mjs  (needs Node >= 22.3 for mock.module)
node bin/antigravity.mjs --help   # lists every command; the standalone/Codex/npx entry
```

- Install (this fork): `claude plugin marketplace add audichuang/antigravity-plugin` → `claude plugin install antigravity@antigravity` (marketplace name is `antigravity`, NOT `@audichuang`).
- **No bump-version script.** Bump ALL of these in lockstep or the marketplace serves a stale copy: `package.json`, `plugin.json`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` (2 sites), `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json`.

## Architecture (`scripts/`)

- `bin/antigravity.mjs` — standalone CLI + command router (`KNOWN` / `AGY_REQUIRED` / `COMMAND_HELP` / `printHelp`).
- `lib/agent-runtime.mjs` — **the single chokepoint that spawns `agy`** (`runAgyPrint`). Add agy flags here, not in callers. `resolveAgyTimeouts` derives `--print-timeout` + a Node-side hard backstop.
- `lib/state.mjs` — job state. **Per-job JSON file is the source of truth; `state.json` is a derived index.** Terminal writes go through `applyJobPatchIfActive` (active-gate + O_EXCL `.lock` `claimTerminalTransition`, first-writer-wins). `listJobs` runs `reconcileDeadPidJobs` (dead-pid sweep). Corrupt files are quarantined, not silently dropped.
- `lib/job-helpers.mjs` — `runForegroundJob` / `startBackgroundJob` (spawns the worker **and a detached watchdog**) / `waitForJob` (polls the per-job file).
- `scripts/commands/_worker.mjs` — background worker; writes a throttled heartbeat (`touchJobProgress`) and finalizes via the CAS.
- `scripts/commands/_watchdog.mjs` + `lib/liveness.mjs` — detached liveness watchdog, escalate-not-kill. Kills on **dead pid OR missed `timeoutAt`**, NOT on silence (agy `--print` is legitimately quiet for minutes).
- `lib/cli-entry.mjs` — `runAsMain`; `lib/text.mjs`, `lib/render.mjs` (`parseReviewJson`/`renderReviewResult`), `lib/prompt-templates.mjs` (`build*Prompt`).

## Gotchas

- **Every `scripts/commands/<verb>.mjs` MUST end with `runAsMain(import.meta.url, run, "<verb>")`** — the slash-command `.md` runs `node …/<verb>.mjs $ARGUMENTS` directly; without the shim it is a silent no-op (the modules only `export run`).
- **New slash command checklist:** `commands/<verb>.md` + `scripts/commands/<verb>.mjs` (with `runAsMain`) + register in `bin/antigravity.mjs` (`KNOWN`, `AGY_REQUIRED`, `COMMAND_HELP`, `printHelp`). `handoff` is the exception — a pure `.md` (Claude-orchestrated), no bin entry.
- **Any terminal status write (`completed`/`failed`/`cancelled`) must go through `applyJobPatchIfActive`**, never a raw `writeJobFile` / unconditional `patchJob` — that is what makes cancel-vs-completion first-writer-wins across processes.
- **Tests are hermetic:** fake `agy` via an `AGY_BIN` stub script, `CLAUDE_PLUGIN_DATA` → a temp dir, fake/dead pids; never spawn real agy or touch `~/.claude`.
  - **Capture a command's stdout by running it as a subprocess (`spawnSync` on the command module — it self-invokes), NOT by monkey-patching `process.stdout.write`** — patching it breaks node:test's own reporter and silently drops tests (real bug hit this session). See `tests/feature-correctness.test.mjs`.
  - `listJobs` reconciles dead pids, so a test seeding a `running` job with a **dead** pid gets auto-failed — seed `pid: process.pid` (alive) or no pid to keep it active.
- **agy print-mode facts:** no ACP / streaming / structured output. Native `--model` (forwarded **verbatim**, no aliasing), `--sandbox` (boolean; review/adversarial-review use it for read-only), `--print-timeout <Go-duration>`, `--continue` / `--conversation <id>`. agy does NOT expose a print-mode conversation id, so resume hints point at `--continue` (resume most recent), not a captured id.
- **TDD is the workflow:** test first (`tests/*.test.mjs`), one behavior at a time. CI runs the suite on Node 22.x/24.x.
