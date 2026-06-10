# Contributing

Thanks for helping improve the Antigravity (`agy`) plugin.

## Development

```bash
npm test        # node --test --experimental-test-module-mocks tests/*.test.mjs
```

- **Node ≥ 22.3** is required to run the tests (`mock.module`). The plugin
  runtime itself supports Node ≥ 18.18.

## Conventions

- **TDD.** Write a failing test first, then the minimal code to pass it. Tests
  live in `tests/*.test.mjs`.
- **Hermetic tests.** Never spawn the real `agy` or touch the real `$HOME` /
  plugin-data dir. Point `CLAUDE_PLUGIN_DATA` at a temp dir, and use a fake
  `agy` via `AGY_BIN` (a stub script) — see `tests/feature-correctness.test.mjs`
  and `tests/background-integration.test.mjs`.
  - To capture a command's output, run it as a **subprocess** (`spawnSync` on the
    command module, which self-invokes) rather than monkey-patching
    `process.stdout.write` — the latter breaks node:test's own reporter.
- **Cross-process safety.** Any terminal status write (`completed` / `failed` /
  `cancelled`) must go through `applyJobPatchIfActive` (which wins the O_EXCL
  terminal claim) — never a raw `writeJobFile` / unconditional `patchJob`.
- **Bump the version** on any change that affects what the marketplace serves
  (commands, runtime). Update every version site: `package.json`, `plugin.json`,
  `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`,
  `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json`. They must match.
- **New slash command?** Add `commands/<verb>.md`, a `scripts/commands/<verb>.mjs`
  that ends with `runAsMain(import.meta.url, run, "<verb>")`, and register it in
  `bin/antigravity.mjs` (`KNOWN`, `AGY_REQUIRED`, `COMMAND_HELP`, `printHelp`).

## Forwarding to agy

Models are forwarded **verbatim** (no aliasing). Drive agy through the single
chokepoint `scripts/lib/agent-runtime.mjs` (`runAgyPrint`) so timeouts, model,
and sandbox flags stay consistent.
