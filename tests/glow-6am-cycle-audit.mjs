import fs from 'node:fs';
import vm from 'node:vm';

const web = fs.readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
const ios = fs.readFileSync(new URL('../ios/App/App/public/index.html', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../workers/api/src/worker.js', import.meta.url), 'utf8');

function assert(cond, msg) {
  if (!cond) throw new Error('FAIL: ' + msg);
  console.log('PASS:', msg);
}

assert(web === ios, 'web and iOS index files are identical');
assert(web.includes('const GU_PLAN_REFRESH_HOUR = 6;'), 'Glow refresh hour is fixed at local 06:00');
assert(web.includes('fm_glowplan_cycle_'), 'plan cache is cycle-based');

const keyBlock = web.split('function _guDailyPlanKey(last) {')[1]?.split('function _guCompletedPlanLockKey(last)')[0] || '';
assert(!keyBlock.includes('last.date'), 'daily plan key no longer depends on latest scan');
assert(!keyBlock.includes('_fmPreferenceSignature'), 'daily plan key no longer depends on preferences');

const prefBlock = web.split('window.saveGoalPreferences = function(){')[1]?.split('refreshGoalPreferencesSummary();')[0] || '';
assert(!prefBlock.includes('removeItem(progressKey)'), 'saving preferences does not reset current Glow progress');
assert(!prefBlock.includes('_guAiPlanCache = {}'), 'saving preferences does not regenerate current Glow plan');

assert(web.includes('gu_progress_cycle_'), 'task progress uses the same 06:00 cycle');
assert(web.includes('Updates at 6:00 AM'), 'countdown explicitly targets 06:00');
assert(web.includes('completed-locked'), '6/6 task cards have a physical locked state');
assert(web.includes('before.length >= _guGetPlanTotal()'), '6/6 completion also has a logic-level mutation guard');
assert(web.includes('Locked until 6:00 AM.'), 'completion UI tells the user when tasks unlock');
assert(web.includes('_guMaybeHandleCycleBoundary(); _guGetStreak();'), 'foreground resume notices a crossed 06:00 boundary');

assert(worker.includes('glowCycleDateForTimeZone(body.local_timezone)'), 'worker mirrors the 06:00 boundary using device IANA time zone');
assert(worker.includes('glowplan-cycle-v12:'), 'worker caches one plan per user/cycle');
assert(worker.includes('cached: true'), 'worker returns the cached plan without regeneration inside the cycle');

// Execute the actual client helper block under two time zones to verify 05:59/06:00.
const helperSrc = web.split('const GU_PLAN_REFRESH_HOUR = 6;')[1]?.split('function _guCompletedPlanLockKey(last)')[0];
if (!helperSrc) throw new Error('FAIL: could not extract 06:00 helper block');
const code = `const GU_PLAN_REFRESH_HOUR = 6;${helperSrc}\nthis.helpers={_guCycleDateKey,_guNextPlanRefreshAt};`;
const ctx = { Date, Intl, currentUserId: () => 'test-user', encodeURIComponent };
vm.createContext(ctx);
vm.runInContext(code, ctx);

function checkTz(tz, beforeIso, afterIso, expectedPrev, expectedNext) {
  process.env.TZ = tz;
  assert(ctx.helpers._guCycleDateKey(new Date(beforeIso)) === expectedPrev, `${tz}: 05:59 stays in previous Glow cycle`);
  assert(ctx.helpers._guCycleDateKey(new Date(afterIso)) === expectedNext, `${tz}: 06:00 starts the new Glow cycle`);
  const next = ctx.helpers._guNextPlanRefreshAt(new Date(afterIso));
  assert(next.getHours() === 6, `${tz}: next refresh is at local 06:00`);
}

checkTz('America/New_York', '2026-08-12T09:59:00Z', '2026-08-12T10:00:00Z', '2026-08-11', '2026-08-12');
checkTz('Asia/Tokyo', '2026-08-11T20:59:00Z', '2026-08-11T21:00:00Z', '2026-08-11', '2026-08-12');


// Execute the worker's own timezone helper too; client and server must agree.
const workerHelperSrc = worker.split('function glowCycleDateForTimeZone(timeZone, now = new Date()) {')[1]?.split('function isCacheableGlowPlanData(data)')[0];
if (!workerHelperSrc) throw new Error('FAIL: could not extract worker 06:00 helper');
const wctx = { Date, Intl, Object, Number, String };
vm.createContext(wctx);
vm.runInContext(`function glowCycleDateForTimeZone(timeZone, now = new Date()) {${workerHelperSrc}\nthis.fn=glowCycleDateForTimeZone;`, wctx);
assert(wctx.fn('America/New_York', new Date('2026-08-12T09:59:00Z')) === '2026-08-11', 'worker New York 05:59 stays in previous cycle');
assert(wctx.fn('America/New_York', new Date('2026-08-12T10:00:00Z')) === '2026-08-12', 'worker New York 06:00 starts new cycle');
assert(wctx.fn('Asia/Tokyo', new Date('2026-08-11T20:59:00Z')) === '2026-08-11', 'worker Tokyo 05:59 stays in previous cycle');
assert(wctx.fn('Asia/Tokyo', new Date('2026-08-11T21:00:00Z')) === '2026-08-12', 'worker Tokyo 06:00 starts new cycle');

console.log('PASS: Glow 06:00 local-cycle audit');
