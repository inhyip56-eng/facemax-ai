import assert from 'node:assert/strict';
import worker from '../workers/api/src/worker.js';

class KV {
  constructor(){ this.m = new Map(); }
  async get(k){ return this.m.has(k) ? this.m.get(k) : null; }
  async put(k,v){ this.m.set(k,String(v)); }
  async delete(k){ this.m.delete(k); }
}
const kv = new KV();
await kv.put('premium:user1', JSON.stringify({active:true,premium:true,premium_until:Date.now()+86400000}));
const env = { PREMIUM_KV:kv, OPENROUTER_API_KEY:'test-key' };

let openrouterCalls = 0;
let lastPrompt = '';
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init={}) => {
  const u = String(url);
  if (u.includes('openrouter.ai/api/v1/chat/completions')) {
    openrouterCalls++;
    const b = JSON.parse(init.body || '{}');
    const c = b.messages?.[0]?.content; lastPrompt = Array.isArray(c) ? c.map(x=>x && x.text || '').join('\n') : (c || '');
    return new Response(JSON.stringify({
      id:'test', model:'google/gemini-2.5-flash-lite', provider:'google-vertex/eu',
      choices:[{message:{content:JSON.stringify({
        title:'Skin Plan',
        text:'Your overall score is 72/100 and your skin score is 65/100. Skin is the clearest upgrade target from this scan.',
        steps:['Use a gentle cleanser','Apply SPF 30+','Moisturize consistently','Keep a simple PM routine','Protect the eye area','Review progress after two weeks']
      })}}]
    }), {status:200, headers:{'content-type':'application/json'}});
  }
  throw new Error('Unexpected external fetch: '+u);
};

try {
  const payload = {
    user_id:'user1', local_date:'2026-08-12', scan_id:'scan-abc', regenerate:false,
    face_shape:null, score:72,
    metrics:{skin:65,eye_area:70,jawline:74,harmony:71,symmetry:73,hair:68}, gender:'male'
  };
  let res = await worker.fetch(new Request('https://api.test/api/skin-plan',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)}), env);
  assert.equal(res.status,200);
  let data = await res.json();
  assert.equal(data.ok,true);
  assert.equal(data.cached,false);
  assert.equal(openrouterCalls,1);
  assert.match(lastPrompt,/Overall score: 72\/100/);
  assert.match(lastPrompt,/skin: 65\/100/);
  assert.match(lastPrompt,/Face shape category: unknown/);
  assert.match(lastPrompt,/Never invent, replace or contradict them/);
  assert.equal(await kv.get('dailyusage:ai_skin_plan:user1:2026-08-12'),'1');

  res = await worker.fetch(new Request('https://api.test/api/skin-plan',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)}), env);
  data = await res.json();
  assert.equal(data.ok,true);
  assert.equal(data.cached,true);
  assert.equal(openrouterCalls,1, 'reopening same tool/scan must not regenerate');
  assert.equal(await kv.get('dailyusage:ai_skin_plan:user1:2026-08-12'),'1', 'cached view must not spend daily quota');

  payload.regenerate = true;
  res = await worker.fetch(new Request('https://api.test/api/skin-plan',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)}), env);
  data = await res.json();
  assert.equal(data.ok,true);
  assert.equal(data.cached,false);
  assert.equal(openrouterCalls,2, 'explicit Regenerate must call AI again');
  assert.equal(await kv.get('dailyusage:ai_skin_plan:user1:2026-08-12'),'2');

  console.log('PASS: AI tool runtime cache/grounding/regenerate audit');
} finally {
  globalThis.fetch = realFetch;
}
