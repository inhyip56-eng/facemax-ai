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
ok(web.includes('showPrePay();') && web.includes('onbState.pendingScan = true;'), 'second onboarding photo always presents the single weekly prePay');
ok(web.includes('id="prePayTrialBtn"') && web.includes('🎁 Start free trial'), 'gift free-trial CTA is visible in quiz prePay');
ok(web.includes('onclick="quizHaptic();prePayWeeklyAction()"'), 'quiz prePay CTAs are real actions rather than decorative buttons');
ok(/async function prePayWeeklyAction\(\)[\s\S]*quizBuyPlan\("weekly"\)/.test(web), 'quiz prePay always targets the weekly product');
ok(/async function quizCheckout\(\)[\s\S]*await window\.handlePurchase\(_quizSelectedPlan\)[\s\S]*quizResumePendingScan/.test(web), 'RevenueCat/StoreKit confirmation resumes the pending scan without blocking on backend mirror');
ok(bridge.includes('syncServerPremiumBackground(userId, revenueCatAppUserId, true)'), 'native purchase keeps RevenueCat-to-backend reconciliation in the background');
ok(web.includes('window.startScan(true)'), 'paid pending scan resumes without a second paywall check');
ok(web.includes('let _fmFaceScanActiveRunId = null;'), 'Face Scan has a single-flight lock');
ok(web.includes('[facemax] duplicate startScan suppressed'), 'duplicate purchase/lifecycle scan resumes are suppressed');
ok(web.includes('scan_uid: _fmScanRunId'), 'one Face Scan run gets a stable history id');
ok(web.includes('function _fmDedupeScanHistory(arr)'), 'history includes duplicate-burst cleanup');
ok(web.includes('merged.thumb = newer.thumb || older.thumb || null;'), 'duplicate cleanup preserves an existing scan thumbnail');
ok(web.includes('_fmScanPayloadPrepared'), 'photo resize can be prepared without blocking the visible scan screen');
ok(web.includes('#loading .scan-photo::after{content:none!important'), 'horizontal scan sweep line is disabled');
ok(web.includes('scan-status-live'), 'scan status remains live while AI is pending');
ok(web.includes('_runFakeMeshAnim'), 'regular non-quiz scans can retain face mesh animation');
ok(web.includes('b.pct.textContent = "100%"'), '100% is reserved for completed AI response');
ok(web.includes('function onbAnimateUpload(){') && !/function onbAnimateUpload\(\)[\s\S]{0,500}setInterval\(/.test(web), 'legacy competing upload percentage timer is disabled');
console.log('\nQuiz scan purchase UX audit passed.');
