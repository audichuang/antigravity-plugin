# Security Policy

This plugin spawns the local `agy` (Google Antigravity CLI) as a child process
with access to your files and network. Treat it like any tool that runs a local
agent on your repository.

## Reporting a vulnerability

Open a private security advisory on the GitHub repository, or email the
maintainer. Please do not file public issues for vulnerabilities. Include
reproduction steps and the affected version (`antigravity-plugin --version`).

## Notes on the threat model

- `/antigravity:review` and `/antigravity:adversarial-review` run agy under
  `--sandbox` (terminal restrictions) so a misbehaving model cannot mutate your
  tree during a read-only review. `--no-sandbox` disables this — use with care.
- Background jobs spawn detached worker + watchdog processes. They are scoped to
  the workspace state directory under `$CLAUDE_PLUGIN_DATA` and are reaped on
  completion, crash (dead-PID reconcile), or by the liveness watchdog.
- The plugin never passes `--dangerously-skip-permissions` to agy.
- Handoff documents are written to the OS temp directory; redact secrets before
  sharing them (the `/antigravity:handoff` prompt instructs the agent to redact
  API keys, tokens, and PII, but review the output).
