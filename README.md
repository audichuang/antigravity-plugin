# antigravity-plugin

Multi-host plugin for delegating tasks and code reviews to
[Google Antigravity CLI (`agy`)](https://antigravity.google).

Replaces [`gemini-plugin-cc`](https://github.com/sakibsadmanshajib/gemini-plugin-cc),
which is archived because Google [retires Gemini CLI on June 18, 2026](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/)
for free / personal users.

## Status

> **Pre-release (v0.1.0).** Active development. Expect breaking changes until
> v1.0.0. See [`CHANGELOG.md`](./CHANGELOG.md).

## What it does

Spawns `agy --print` (or `--continue` / `--conversation <id>`) from inside your
preferred AI host so you can:

- Get a code review of your uncommitted changes or a branch diff.
- Delegate a fix, investigation, or refactor without leaving your current host.
- Run multiple delegations in parallel with background job tracking.

## Where it runs

| Host             | Install command                                                    |
|------------------|--------------------------------------------------------------------|
| Claude Code      | `claude plugin install antigravity@sakibsadmanshajib`              |
| Codex CLI        | `codex plugin marketplace add` (see [docs/INSTALL.md](./docs/INSTALL.md)) |
| Antigravity (agy)| `agy plugin install antigravity@sakibsadmanshajib`                 |
| Standalone       | `npx antigravity-plugin <command>`                                 |

## Requirements

- Node.js ≥ 18.18.0
- `agy` v1.0.1+ on `PATH` ([install from antigravity.google](https://antigravity.google/download))
- A Google account for `agy` OAuth (run `agy --print 'hi'` once or `/antigravity:setup`)

## Quick start (Claude Code)

```bash
# 1. add the marketplace
claude plugin marketplace add sakibsadmanshajib/antigravity-plugin

# 2. install
claude plugin install antigravity@sakibsadmanshajib

# 3. one-time auth
/antigravity:setup

# 4. use
/antigravity:review
/antigravity:rescue investigate why the tests started failing
```

## Documentation

- [Installation](./docs/INSTALL.md) — per-host setup recipes
- [Spike findings](./docs/SPIKE-findings.md) — why we dropped ACP
- [Commands reference](./docs/COMMANDS.md) (coming soon)

## License

MIT — see [`LICENSE`](./LICENSE).
