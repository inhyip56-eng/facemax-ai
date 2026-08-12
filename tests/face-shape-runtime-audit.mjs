import assert from 'node:assert/strict';
import worker from '../workers/api/src/worker.js';
class KV{constructor(){this.m=new Map()} async get(k){return this.m.get(k)??null} async put(k,v){this.m.set(k,String(v))}}
const kv=new KV(); await kv.put('premium:u1',JSON.stringify({active:true,premium:true,premium_until:Date.now()+86400000}));
const env={PREMIUM_KV:kv,OPENROUTER_API_KEY:'x'};
let sentBody=null; const orig=globalThis.fetch;
globalThis.fetch=async(url,init={})=>{
 if(!String(url).includes('openrouter.ai/api/v1/chat/completions')) throw new Error('unexpected fetch '+url);
 sentBody=JSON.parse(init.body);
 const scores={jawline:72,skin:65,hair:71,eye_area:68,lips:70,nose:69,face_shape:74,photo_angle:66,symmetry:73,cheekbones:75,harmony:72,improvement_potential:84};
 const card=(t)=>({title:t,text:'Specific scan-grounded note.'});
 const data={no_face:false,reason:'',overall_score:72,face_shape_type:'Diamond',photo_check:'Clear photo.',summary:'Summary grounded in this photo.',fastest_upgrade:card('Fastest upgrade'),scores,strengths:[card('S1'),card('S2'),card('S3')],weak_points:[card('W1'),card('W2'),card('W3')],haircut:'Haircut guidance.',jawline:'Jawline guidance.',skin:'Skin guidance.',photo_angle:'Photo guidance.',key_points:['Skin 65 | Use SPF daily','Angle 66 | Raise camera slightly','Jawline 72 | Reduce bloating']};
 return new Response(JSON.stringify({id:'r',model:'google/gemini-2.5-flash-lite',provider:'google-vertex/eu',choices:[{message:{content:JSON.stringify(data)}}]}),{status:200,headers:{'content-type':'application/json'}})
};
try{
 const image='data:image/jpeg;base64,'+'A'.repeat(220);
 const res=await worker.fetch(new Request('https://x/api/full-report',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({user_id:'u1',image,visual_scan:true,gender:'male',local_date:'2026-08-12'})}),env);
 assert.equal(res.status,200); const out=await res.json(); assert.equal(out.ok,true); assert.equal(out.data.face_shape_type,'Diamond');
 assert.equal(sentBody.provider.order[0],'google-vertex/eu'); assert.equal(sentBody.provider.allow_fallbacks,false);
 const rf=sentBody.response_format; assert.ok(rf && JSON.stringify(rf).includes('face_shape_type'));
 const promptText=JSON.stringify(sentBody.messages); assert.match(promptText,/Do not default to Oval/);
 console.log('PASS: Face Scan categorical shape runtime audit');
}finally{globalThis.fetch=orig}
