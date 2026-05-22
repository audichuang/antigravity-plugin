/**
 * host-detect — figure out which host launched us.
 *
 * Possible values:
 *   - 'claude'      — Claude Code session (CLAUDE_ENV_FILE present + is a file)
 *   - 'codex'       — Codex CLI session (CODEX_PLUGIN_DATA or CODEX_HOME)
 *   - 'agy'         — invoked under Antigravity CLI (AGY_HOME or AGY_PLUGIN_DATA)
 *   - 'standalone'  — none of the above (likely `npx antigravity-plugin`)
 *
 * Defensive: tightly checks env shape so a stray CLAUDE_* var from a parent
 * shell doesn't pull us into Claude's state tree.
 */
import { statSync, existsSync } from 'node:fs';

/** @returns {'claude'|'codex'|'agy'|'standalone'} */
export function detectHost(env = process.env) {
  if (isClaude(env)) return 'claude';
  if (isCodex(env)) return 'codex';
  if (isAgy(env)) return 'agy';
  return 'standalone';
}

function isClaude(env) {
  const f = env.CLAUDE_ENV_FILE;
  if (!f) return false;
  try {
    return statSync(f).isFile();
  } catch {
    return false;
  }
}

function isCodex(env) {
  return Boolean(env.CODEX_PLUGIN_DATA || env.CODEX_HOME || env.CODEX_SESSION_ID);
}

function isAgy(env) {
  return Boolean(env.AGY_PLUGIN_DATA || env.AGY_HOME || env.AGY_SESSION_ID);
}
