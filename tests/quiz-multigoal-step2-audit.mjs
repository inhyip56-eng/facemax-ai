import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
const ios = fs.readFileSync(new URL('../ios/App/App/public/index.html', import.meta.url), 'utf8');

assert.equal(html, ios, 'web/index.html and iOS public/index.html must stay identical');
assert.ok(html.includes('const QUIZ_STEPS = ['), 'QUIZ_STEPS definition missing');
assert.ok(!html.includes('quizSteps[quizState.step]'), 'broken lowercase quizSteps reference returned');
assert.ok(html.includes('const step = QUIZ_STEPS[quizState.step];'), 'multi-select must read current QUIZ_STEPS entry');

const goalPos = html.indexOf('key: "goals"');
assert.ok(goalPos > 0, 'goals quiz step missing');
const goalChunk = html.slice(Math.max(0, goalPos - 180), goalPos + 900);
assert.ok(goalChunk.includes('type: "multi"'), 'Step 2 goals must be multi-select');
assert.ok(goalChunk.includes('maxSelect: 3'), 'Step 2 goals must be capped at 3');
assert.ok(goalChunk.includes('Overall glow-up'), 'Overall glow-up option missing');
assert.ok(html.includes('if (key === "goals") quizState.answers.goal = cur[0] || null;'), 'legacy primary goal sync missing');
console.log('quiz multi-goal Step 2 audit: OK');
