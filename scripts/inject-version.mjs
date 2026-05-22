/**
 * Génère src/Version.gs à partir de la version de package.json.
 * Dérive le tag affiché « vMAJEUR.MINEUR » (ex. 3.3.0 → v3.3).
 * Lancé automatiquement avant `clasp push` (cf. script npm "push").
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const [major, minor] = pkg.version.split('.');
const tag = `v${major}.${minor}`;

const content =
  '/**\n' +
  ' * @file Version.gs\n' +
  ' * GÉNÉRÉ AUTOMATIQUEMENT par scripts/inject-version.mjs depuis package.json.\n' +
  ' * Ne pas éditer à la main — relancer `npm run push` pour régénérer.\n' +
  ' */\n' +
  `const APP_VERSION = '${tag}';\n`;

writeFileSync(join(root, 'src/Version.gs'), content);
console.log(`Version.gs → ${tag}`);
