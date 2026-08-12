import fs from 'node:fs';
import assert from 'node:assert/strict';
const web = fs.readFileSync('web/index.html','utf8');
const ios = fs.readFileSync('ios/App/App/public/index.html','utf8');
const worker = fs.readFileSync('workers/api/src/worker.js','utf8');
assert.equal(web, ios, 'web and bundled iOS HTML must match');
for (const c of [
  'DAILY_FACE_SCAN_LIMIT = 20','DAILY_FOOD_SCAN_LIMIT = 20','DAILY_GLOW_PLAN_LIMIT = 20','DAILY_MEAL_PLAN_LIMIT = 20',
  'DAILY_DATING_PHOTO_LIMIT = 20','DAILY_HAIRCUT_GUIDE_LIMIT = 20','DAILY_SKIN_PLAN_LIMIT = 20','DAILY_JAWLINE_PLAN_LIMIT = 20'
]) assert.ok(worker.includes(c), c);
for (const b of ['ai_face_scan','ai_food_scan','ai_glow_plan','ai_meal_plan','ai_dating_photo','ai_haircut_guide','ai_skin_plan','ai_jawline_plan']) assert.ok(worker.includes(`"${b}"`), b);
assert.ok(worker.includes('incrementDailyUsageAfterSuccess(env, userId'), 'quota must be consumed after success');
assert.ok(web.includes('error === "daily_limit_reached"'), 'client daily-limit branch missing');
assert.ok(web.includes('title: "Daily limit reached"'), 'Face Scan limit modal missing');
assert.ok(web.includes('retry: false'), 'Face Scan must not retry after daily limit');
assert.ok((web.match(/local_date: new Date\(\)\.toLocaleDateString\('en-CA'\)/g) || []).length >= 4, 'non-Glow AI calls should pass normal local calendar date');
assert.ok(web.includes('local_date: _guCycleDateKey()'), 'Glow AI call should use the 06:00 local cycle date');
console.log('PASS: separate 20/day per-user per-feature AI limits and user-facing limit handling');
