# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] — 2026-05-22

Initial release. Replaces and supersedes
[`gemini-plugin-cc`](https://github.com/sakibsadmanshajib/gemini-plugin-cc)
ahead of the June 18, 2026 Gemini CLI deprecation.

### Added

- Delegation runtime targeting **Google Antigravity CLI (`agy`)** via `agy --print`,
  `agy --continue`, and `agy --conversation <id>`. No ACP — agy 1.0.1 does not
  expose `--acp`.
- Multi-host packaging from a single source tree:
  - Claude Code (`.claude-plugin/plugin.json` + `marketplace.json`).
  - Codex CLI (`.codex-plugin/plugin.json`).
  - agy itself (`plugin.json` at root — importable via `agy plugin import claude`
    or installable via `agy plugin install antigravity@sakibsadmanshajib`).
  - Standalone CLI (`npx antigravity-plugin`).
- `/antigravity:setup` interactive auth wizard; background workers also surface
  the OAuth URL via `/antigravity:status` for re-auth flows.
- `/antigravity:review`, `/antigravity:rescue`, `/antigravity:status`,
  `/antigravity:result`, `/antigravity:cancel`, `/antigravity:task` commands
  (ported from `gemini-plugin-cc` v1.0.1).

### Removed

- All ACP client / broker code (`acp-client`, `acp-broker`, `acp-diagnostics`).
  agy does not speak ACP.
- Live token streaming and thought-chunk surfacing — `agy --print` returns a
  single final response.
- `gemini --experimental-acp` runtime path — deprecation deadline is too close
  to maintain a transitional fallback.

[Unreleased]: https://github.com/sakibsadmanshajib/antigravity-plugin/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/sakibsadmanshajib/antigravity-plugin/releases/tag/v0.1.0
