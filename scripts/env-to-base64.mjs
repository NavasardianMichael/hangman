import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

// Prints the production env file (.env.production.local, or the path given as the first argument) as base64 for the
// ENV_FILE_BASE64 GitHub secret. Only the base64 goes to stdout, so it pipes cleanly (`pnpm -s envtob64 | clip`);
// key names (never values) and warnings go to stderr.

const envFile = process.argv[2] || '.env.production.local';
const envPath = resolve(process.cwd(), envFile);
// The systemd unit sets these; the deploy strips them from the secret
const DEPLOY_OWNED_KEYS = ['NODE_ENV', 'PORT', 'HOSTNAME'];

if (!existsSync(envPath)) {
  console.error(`❌ ${envFile} not found at ${envPath}`);
  process.exit(1);
}

try {
  const raw = readFileSync(envPath, 'utf8');
  const normalized = raw.replace(/\r\n/g, '\n');

  const entries = normalized
    .split('\n')
    .map((line) => line.trim().replace(/^export\s+/, ''))
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => [line.slice(0, line.indexOf('=')).trim(), line.slice(line.indexOf('=') + 1).trim()]);

  console.error(`keys: ${entries.map(([key]) => key).join(', ') || '(none)'}`);
  if (!entries.some(([key, value]) => key === 'GEMINI_KEY' && value)) {
    console.error('⚠️  GEMINI_KEY is empty: production single player will use the built-in words only');
  }
  const owned = entries.map(([key]) => key).filter((key) => DEPLOY_OWNED_KEYS.includes(key));
  if (owned.length) console.error(`⚠️  ${owned.join(', ')} will be ignored: the systemd unit sets them`);

  console.log(Buffer.from(normalized, 'utf8').toString('base64'));
} catch (err) {
  console.error(`❌ Failed to encode ${envFile}:`, err instanceof Error ? err.message : err);
  process.exit(1);
}
