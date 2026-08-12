import fs from 'node:fs';
const web = fs.readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
const ios = fs.readFileSync(new URL('../ios/App/App/public/index.html', import.meta.url), 'utf8');
function ok(cond, msg){ if(!cond) throw new Error(msg); }
ok(web === ios, 'web and iOS public index.html must stay in sync');
ok(web.includes('id="aiFeatures"'), 'AI Features screen missing');
ok(web.includes('<div class="tool-text"><b>AI Features</b></div>'), 'Home AI Features tile missing');
for (const needle of [
  "openAiFeatureTool('skin')", "openAiFeatureTool('haircut')", "openAiFeatureTool('jawline')", "openAiFeatureTool('photo')",
  'openAiFeatureNutrition()', 'openAiFeatureFoodScanner()', 'openAiFeatureCompare()'
]) ok(web.includes(needle), `AI feature missing: ${needle}`);
ok(web.includes('id="ghMetricsGrid"'), 'Numeric Glow metrics were removed');
ok(!web.includes('id="ghMetricsTips"'), 'Text Glow metric cards still present');
ok(web.includes('haircut:"Haircut"') && web.includes('photo:"Profile Photo"'), 'Haircut/Profile Photo titles not enabled');
ok(web.includes('Math.min(99.4, scanLoadingProgress(elapsed))'), 'continuous scan loading tail missing');
ok(web.includes('@keyframes scanSheen'), 'scan shimmer animation missing');
console.log('AI features hub audit: PASS');
