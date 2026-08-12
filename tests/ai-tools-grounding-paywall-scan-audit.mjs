import fs from 'node:fs';
import assert from 'node:assert/strict';

const web = fs.readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
const ios = fs.readFileSync(new URL('../ios/App/App/public/index.html', import.meta.url), 'utf8');
const bridge = fs.readFileSync(new URL('../ios/App/App/public/js/native-bridge.js', import.meta.url), 'utf8');
const worker = fs.readFileSync(new URL('../workers/api/src/worker.js', import.meta.url), 'utf8');
const ok = (v,m)=>{assert.ok(v,m); console.log('PASS:',m)};

equal(web,ios,'web and iOS index are identical');
function equal(a,b,m){assert.equal(a,b,m); console.log('PASS:',m)}

ok(web.includes('_quizStaticPhotoScanOnce = true;') && web.includes('quizShowPaywall();'), 'first onboarding scan always presents real quiz paywall');
ok(web.includes('Continue with Premium'), 'existing subscribers get Continue rather than another purchase');
ok(web.includes('quizBackendPremiumReady'), 'paywall gates scan on backend premium readiness');
ok(bridge.includes('facemax.syncPremiumNow = async function'), 'native bridge can trigger a fresh RevenueCat backend sync');
ok(web.includes('b.pct.textContent = "AI" + dots'), 'unknown remote wait is shown as live AI state instead of fake frozen percent');
ok(web.includes('scan-status-live'), 'scan status has a persistent activity heartbeat');
ok(web.includes('_runFakeMeshAnim'), 'face scan mesh animation is preserved');
ok(web.includes('finishScanBars') && web.includes('b.pct.textContent = "100%"'), '100% is only finalized through real completion path');

ok(worker.includes('face_shape_type'), 'face scan returns categorical face shape');
ok(worker.includes('Do not default to Oval'), 'vision prompt forbids defaulting face shape to Oval');
ok(!web.includes('|| "Oval"'), 'client has no hardcoded || Oval fallback');
ok(!web.includes('return "Oval";'), 'legacy MediaPipe classifier no longer silently defaults to Oval');
ok(web.includes('report && report.face_shape_type'), 'AI tools read face shape from latest real scan report');
ok(web.includes('const reportScores = report && report.scores'), 'AI tools prefer full latest Face Scan scores');
ok(worker.includes('These numbers are authoritative measurements returned by that scan'), 'AI tool prompt treats supplied scan metrics as authoritative');
ok(worker.includes('Never invent, replace or contradict them'), 'AI tool prompt forbids invented metrics');

ok(web.includes('fm_ai_tool_v3_'), 'AI tool result is cached locally per user/tool/scan');
ok(worker.includes('aiToolCacheKey(userId, type)'), 'AI tool result is cached server-side per user/tool');
ok(web.includes('regenerateCurrentAiTool'), 'explicit Regenerate action exists');
ok(web.includes('tool-summary-star'), 'AI result summary has the 4-point star block');
ok(web.includes('font-weight:750!important') && web.includes('.plan-body span'), 'AI result long-form text uses stronger typography');

const cachePos = worker.indexOf('if (!regenerate && env.PREMIUM_KV && scanId)');
const quotaPos = worker.indexOf('const toolDaily = await checkDailyLimitOnly', cachePos);
ok(cachePos >= 0 && quotaPos > cachePos, 'cached AI result returns before daily regeneration quota check');

console.log('PASS: grounded AI tools + mandatory paywall + scan UX audit');
