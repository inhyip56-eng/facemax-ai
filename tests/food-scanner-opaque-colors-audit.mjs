import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const web = await fs.readFile(path.join(root, 'web/index.html'), 'utf8');
const ios = await fs.readFile(path.join(root, 'ios/App/App/public/index.html'), 'utf8');
assert.equal(web, ios, 'web/iOS index mirrors must match');

const selectors = [
  '.fs-metric-card.status-good', '.fs-metric-card.status-moderate', '.fs-metric-card.status-bad',
  '.fs-fe-card.good', '.fs-fe-card.warn', '.fs-fe-card.bad',
  '.fs-ing-row.impact-low', '.fs-ing-row.impact-medium', '.fs-ing-row.impact-high',
  '.fs-mc-pill.good', '.fs-mc-pill.moderate', '.fs-mc-pill.bad',
  '.fs-ing-badge.ok', '.fs-ing-badge.warn', '.fs-ing-badge.bad',
  '.fs-swap-card', '.fs-time-card', '.fs-time-slot.active', '.fs-time-slot.inactive',
];
for (const selector of selectors) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = web.match(new RegExp(escaped + '\\{([^}]*)\\}'));
  assert.ok(m, `missing ${selector}`);
  const css = m[1];
  assert.match(css, /background-color:\s*#[0-9a-f]{6}!important/i, `${selector} must use a solid opaque background`);
  assert.doesNotMatch(css, /background(?:-color)?:[^;]*rgba\(/i, `${selector} must not use rgba transparency`);
  assert.match(css, /opacity:\s*1!important/i, `${selector} must force full opacity`);
}
console.log('PASS: Food Scanner status cards/pills use fully opaque colors');
