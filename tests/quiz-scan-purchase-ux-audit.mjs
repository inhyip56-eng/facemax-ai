import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const web = fs.readFileSync(path.join(root, 'web/index.html'), 'utf8');
const ios = fs.readFileSync(path.join(root, 'ios/App/App/public/index.html'), 'utf8');
const bridge = fs.readFileSync(path.join(root, 'web/js/native-bridge.js'), 'utf8');
function ok(cond, msg){ if(!cond) throw new Error(msg); console.log('PASS:', msg); }

ok(web === ios, 'web and bundled iOS index.html are identical');
ok(web.includes('type: "signin"'), 'quiz contains mandatory Sign in with Apple step');
ok(web.includes('function quizRequireAppleSignIn()'), 'mandatory Apple guard exists');
ok(web.includes('if (!quizRequireAppleSignIn()) return;'), 'protected quiz/scan/paywall flow uses Apple guard');
ok(web.includes('class="apple-mark-svg"'), 'Sign in with Apple uses non-clipped SVG mark');
ok(!web.includes('<span class="apple-mark"></span>'), 'legacy clipped Apple glyph removed from sign-in buttons');
ok(web.includes('showPrePay();') && web.includes('onbState.pendingScan = true;'), 'first onboarding scan always presents the paywall path, including existing Premium users');
ok(web.includes('Continue with Premium'), 'existing Premium user sees Continue CTA instead of a second purchase');
ok(web.includes('async function quizBackendPremiumReady'), 'checkout can verify backend Premium before scanning');
ok(web.includes('await quizBackendPremiumReady(18000);'), 'fresh purchase waits on paywall for backend access');
ok(web.includes('await quizBackendPremiumReady(12000);'), 'existing Premium Continue also verifies backend access');
ok(bridge.includes('facemax.syncPremiumNow = async function'), 'paywall can trigger fresh RevenueCat->backend reconciliation');
ok(bridge.includes('syncServerPremium(userId, rcAppUserId, !!expectActive)'), 'fresh sync uses the actual RevenueCat app user id');
ok(web.includes('window.startScan(true)'), 'paid pending scan resumes without a second paywall check');
ok(web.includes('pollAttempt < 2'), 'scan-side 402 recovery is only a short safety net');
ok(web.includes('setTimeout(r, 500)'), 'scan-side premium safety poll is short');
ok(web.includes('Activating Premium & preparing your scan…'), 'paywall shows premium activation state before scan');
ok(web.includes('_fmScanPayloadPrepared'), 'photo resize is prepared before the animated scan screen');
ok(web.includes('fmCompositorScanSweep'), 'scan has a CSS compositor-driven sweep independent of JS progress');
ok(web.includes('b.pct.textContent = "AI" + dots'), 'remote AI tail is indeterminate and visibly live instead of fake 89-99%');
ok(web.includes('scan-status-live'), 'scan status has a heartbeat while AI is pending');
ok(web.includes('_runFakeMeshAnim'), 'face mesh animation remains enabled');
ok(web.includes('b.pct.textContent = "100%"'), '100% is reserved for completed AI response');
ok(web.includes('function onbAnimateUpload(){') && !/function onbAnimateUpload\(\)[\s\S]{0,500}setInterval\(/.test(web), 'legacy competing upload percentage timer is disabled');
console.log('\nQuiz scan purchase UX audit passed.');
