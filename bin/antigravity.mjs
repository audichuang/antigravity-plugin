#!/usr/bin/env node
/**
 * antigravity-plugin — standalone CLI surface.
 *
 * `npx antigravity-plugin <command> [args]`
 *
 * Commands are dispatched to the same scripts/commands/<name>.mjs modules
 * used by the Claude Code and Codex CLI hosts, so behaviour is identical
 * across every entry point.
 */
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const KNOWN = new Set([
  'setup',
  'review',
  'rescue',
  'task',
  'status',
  'result',
  'cancel',
]);

const [, , raw, ...rest] = process.argv;
const name = (raw || '').toLowerCase();

if (!name || name === '-h' || name === '--help' || name === 'help') {
  printHelp();
  process.exit(0);
}

if (!KNOWN.has(name)) {
  console.error(`antigravity-plugin: unknown command '${raw}'`);
  printHelp();
  process.exit(2);
}

const mod = pathToFileURL(resolve(ROOT, 'scripts', 'commands', `${name}.mjs`)).href;
try {
  const cmd = await import(mod);
  const run = cmd.default ?? cmd.run;
  if (typeof run !== 'function') {
    console.error(`antigravity-plugin: command '${name}' has no exported run()`);
    process.exit(2);
  }
  const code = await run(rest, { host: 'standalone', cwd: process.cwd() });
  process.exit(typeof code === 'number' ? code : 0);
} catch (err) {
  if (err?.code === 'ERR_MODULE_NOT_FOUND') {
    console.error(`antigravity-plugin: command '${name}' is not implemented yet.`);
    process.exit(2);
  }
  console.error('antigravity-plugin:', err?.message ?? err);
  process.exit(1);
}

function printHelp() {
  process.stdout.write(`antigravity-plugin — delegate to Google Antigravity (agy)

Usage:
  antigravity-plugin <command> [args]

Commands:
  setup      One-time interactive OAuth wizard
  review     Review uncommitted changes (or --base <ref> for a branch diff)
  rescue     Hand a task off to agy (investigate, fix, refactor, ...)
  task       Free-form prompt with state tracking
  status     List active/recent delegation jobs
  result     Fetch the result of a finished job
  cancel     Cancel a running job

Options forwarded to commands:
  --background    fork a worker, return immediately, track via status
  --wait          block until the job finishes
  --continue      resume the latest conversation
  --conversation <id>  resume a specific conversation

Docs: https://github.com/sakibsadmanshajib/antigravity-plugin
`);
}
