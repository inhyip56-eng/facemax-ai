import fs from 'node:fs';
import assert from 'node:assert/strict';

const web = fs.readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
const ios = fs.readFileSync(new URL('../ios/App/App/public/index.html', import.meta.url), 'utf8');
const ok = (v,m)=>{assert.ok(v,m); console.log('PASS:',m)};
assert.equal(web, ios, 'web/iOS index must be identical');
console.log('PASS: web and iOS index are identical');

ok(web.includes('if (onbState && onbState.flow === "onboarding") {\n    onbState.pendingScan = true;\n    _quizStaticPhotoScanOnce = true;'), 'second onboarding photo arms the one-shot static scan');
ok(web.includes('showPrePay();\n    return;'), 'second onboarding photo routes directly to the single weekly prePay');
ok(web.includes("openScreen('prePay')"), 'single weekly prePay exists');
ok(web.includes('🎁 Start free trial'), 'quiz paywall retains free-trial CTA');
ok(web.includes('const firstRunOnboarding = !!(onbState && onbState.flow === "onboarding") ||'), 'onboarding detection does not rely only on first-run localStorage state');
ok(web.includes('#loading.fm-quiz-static-photo .scan-photo::after{content:none!important'), 'post-quiz scan removes sweep line from photo');
ok(web.includes('#loading.fm-quiz-static-photo #loadingCanvas{display:none!important'), 'post-quiz scan hides mesh canvas');
ok(web.includes('if (_fmStaticQuizPhotoThisScan) {\n      try { stopMeshAnim(); } catch {}'), 'post-quiz scan does not start mesh animation');
ok(web.includes('if (_fmStaticQuizPhotoThisScan) _quizStaticPhotoScanOnce = false;'), 'static-photo behavior is consumed once');
ok(web.includes('} else {\n      // Existing animation is preserved for every regular Face Scan.'), 'normal scans preserve existing animation');
console.log('Quiz paywall/static first scan audit passed.');
