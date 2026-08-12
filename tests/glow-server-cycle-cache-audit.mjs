import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

class FakeKV {
  constructor(){ this.map = new Map(); }
  async get(k){ return this.map.has(k) ? this.map.get(k) : null; }
  async put(k,v){ this.map.set(k,String(v)); }
  async delete(k){ this.map.delete(k); }
}
const user = 'glow_cycle_cache_user';
const kv = new FakeKV();
kv.map.set(`premium:${user}`, JSON.stringify({user_id:user,premium_until:Date.now()+86400000,source:'test'}));
const env = { PREMIUM_KV: kv, OPENROUTER_API_KEY: 'test-key' };
const worker = (await import(pathToFileURL(path.resolve('workers/api/src/worker.js')).href + '?t=' + Date.now())).default;

const metrics = { jawline:61, skin:58, eyes:67, cheekbones:70, nose:71, symmetry:74, harmony:68 };
const chips = [
  ['Jawline',61], ['Potential',76], ['Cheekbones',70], ['Eyes',67],
  ['Nose',71], ['Skin',58], ['Symmetry',74], ['Harmony',68],
].map(([label,score]) => ({label,score,note:`Your ${label.toLowerCase()} is part of today's scan context. Keep one specific low-risk routine step consistent today.`}));
const payload = {
  focus:'Skin recovery and jaw definition',
  motivation:'Skin is the clearest modifiable priority today.',
  steps:[
    {e:'☀️',label:'Apply broad-spectrum SPF this morning',sub:'Protect the skin metric today',area:'skin'},
    {e:'🧴',label:'Use a gentle evening cleanser',sub:'Keep irritation risk lower',area:'skin'},
    {e:'🧂',label:'Keep dinner sodium moderate tonight',sub:'Limit temporary morning puffiness',area:'depuff'},
    {e:'🧍',label:'Do a two-minute posture reset',sub:'Improve visible neck-jaw alignment',area:'jawline'},
    {e:'📵',label:'Take a screen break before bed',sub:'Support the eye area',area:'eyes'},
    {e:'🫐',label:'Add berries to one meal',sub:'Simple nutrition support today',area:'nutrition'},
  ], chips,
  food_tip:'🫐 Add berries to one meal today.',
  face_tip:'🧍 Keep your neck posture neutral today.',
  skin_tip:'☀️ Use broad-spectrum SPF this morning.'
};
let upstreamCalls = 0;
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => {
  upstreamCalls++;
  return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(payload)}}]}), {status:200,headers:{'content-type':'application/json'}});
};

async function call(){
  const req = new Request('https://api.test/api/glow-plan',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
    user_id:user, metrics, overall_score:67, local_timezone:'Europe/Budapest', local_date:'2099-01-01', glow_cycle_date:'2099-01-01'
  })});
  const res = await worker.fetch(req,env,{});
  return {res,data:await res.json()};
}
try {
  const a = await call();
  assert.equal(a.res.status,200);
  assert.equal(a.data.cached,false);
  const b = await call();
  assert.equal(b.res.status,200);
  assert.equal(b.data.cached,true);
  assert.deepEqual(b.data.data,a.data.data);
  assert.equal(upstreamCalls,1,'second call in same cycle must not regenerate upstream');
  console.log('PASS: worker returns one stable Glow plan per user/06:00 cycle');
} finally {
  globalThis.fetch = originalFetch;
}
