import fs from 'node:fs';

const web = fs.readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
const ios = fs.readFileSync(new URL('../ios/App/App/public/index.html', import.meta.url), 'utf8');

function assert(cond, msg) {
  if (!cond) throw new Error('FAIL: ' + msg);
  console.log('PASS:', msg);
}

assert(web === ios, 'web and iOS index files are identical');
assert(web.includes('function _guCompletedPlanLockKey(last)'), 'completed plan lock key exists');
assert(web.includes('const completedLock = _guLoadCompletedPlanLock(last);'), 'completed lock is checked before normal cache/network flow');
assert(web.includes('if (completedLock) return completedLock;'), 'completed plan bypasses regeneration');
assert(web.includes('_guLockCurrentCompletedPlan();'), '6/6 completion freezes the current plan');
assert(web.includes('before.length >= _guGetPlanTotal()'), 'completed tasks cannot be unchecked/reopened into a mutable state');
const completionFn = web.split('function _guCompleteToday(animate) {')[1]?.split('function _guEnsureCompletionState()')[0] || '';
const alreadyDoneBranch = completionFn.split('if (s.lastDate === today) {')[1]?.split('const count = _guUpdateStreak();')[0] || '';
assert(!alreadyDoneBranch.includes('renderHomeStats(); renderGlowUpPlan();'), 'already-completed render path does not recurse into renderGlowUpPlan');
assert(web.includes('current 06:00 local Glow cycle'), 'lock scope documents the 06:00-only refresh cycle');

console.log('PASS: Glow completion immutability/navigation regression audit');
