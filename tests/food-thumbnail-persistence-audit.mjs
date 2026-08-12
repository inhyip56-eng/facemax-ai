import fs from 'node:fs';
import assert from 'node:assert/strict';

for (const rel of ['web/index.html','ios/App/App/public/index.html']) {
  const src = fs.readFileSync(new URL('../'+rel, import.meta.url), 'utf8');
  assert.match(src, /photo_key:\s*entry\.photo_key\s*\?\s*String\(entry\.photo_key\)\s*:\s*""/, `${rel}: compact Food Scan entry must preserve photo_key`);
  assert.match(src, /_fmThumbUpload\("food",\s*ts,\s*photo\)/, `${rel}: Food Scan must upload thumbnail immediately`);
  assert.match(src, /entry\.photo_key\s*=\s*key/, `${rel}: upload key must be persisted on history entry`);
  assert.match(src, /key === "facemax_food_scans"[\s\S]{0,500}_fmCloudMergeFoodHistory/, `${rel}: cloud merge must be additive for food history`);
  assert.match(src, /next\.photo_key\s*=\s*String\(x\.photo_key \|\| prev\.photo_key \|\| ""\)/, `${rel}: food merge must never erase a valid photo_key with an empty value`);
  assert.match(src, /food\.slice\(0,12\)[\s\S]{0,300}entry\.photo_key/, `${rel}: Food Scan hydrate must request saved photo_key`);
}
console.log('PASS: Food Scan photo_key survives compaction and rewrites');
console.log('PASS: Food thumbnails upload immediately after scan');
console.log('PASS: Food history cloud merge preserves thumbnail keys');
console.log('PASS: Food thumbnails hydrate on another signed-in device');
