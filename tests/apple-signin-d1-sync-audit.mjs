import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { webcrypto } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const indexPath = path.join(root, 'web/index.html');
const iosIndexPath = path.join(root, 'ios/App/App/public/index.html');
const bridgePath = path.join(root, 'web/js/native-bridge.js');
const iosBridgePath = path.join(root, 'ios/App/App/public/js/native-bridge.js');
const workerPath = path.join(root, 'workers/api/src/worker.js');

class MockKV {
  constructor() { this.map = new Map(); }
  async get(k) { return this.map.has(k) ? this.map.get(k) : null; }
  async put(k, v) { this.map.set(k, v); }
  async delete(k) { this.map.delete(k); }
}

class MockD1 {
  constructor() { this.rows = new Map(); }
  prepare(sql) {
    const db = this;
    const normalized = String(sql).replace(/\s+/g, ' ').trim().toLowerCase();
    return {
      args: [],
      bind(...args) { this.args = args; return this; },
      async run() {
        if (normalized.startsWith('create table') || normalized.startsWith('create index')) return { success:true };
        if (normalized.startsWith('insert into facemax_progress')) {
          const [userId, payload, revision, updatedAt] = this.args;
          db.rows.set(userId, { payload, revision, updated_at: updatedAt });
          return { success:true };
        }
        if (normalized.startsWith('delete from facemax_progress')) {
          db.rows.delete(this.args[0]);
          return { success:true };
        }
        throw new Error('Unexpected run SQL: ' + normalized);
      },
      async first() {
        if (normalized.startsWith('select payload, revision, updated_at from facemax_progress')) {
          return db.rows.get(this.args[0]) || null;
        }
        throw new Error('Unexpected first SQL: ' + normalized);
      },
    };
  }
}

async function loadWorker() {
  const source = await fs.readFile(workerPath, 'utf8');
  const temp = path.join(os.tmpdir(), `fm-worker-${process.pid}-${Date.now()}.mjs`);
  await fs.writeFile(temp, source);
  return (await import(pathToFileURL(temp).href + '?v=' + Date.now())).default;
}

async function callWorker(worker, env, pathname, { method='GET', body, token }={}) {
  const headers = {};
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (token) headers.authorization = 'Bearer ' + token;
  const res = await worker.fetch(new Request('https://worker.test' + pathname, {
    method, headers, body: body === undefined ? undefined : JSON.stringify(body),
  }), env);
  return { status:res.status, data:await res.json() };
}

async function testWorkerProgress() {
  const worker = await loadWorker();
  const kv = new MockKV();
  const db = new MockD1();
  const token = 't'.repeat(64);
  const userId = 'apple_test_user';
  await kv.put('authsession:' + token, JSON.stringify({ user_id:userId, created_at:Date.now() }));
  const env = { PREMIUM_KV:kv, PROGRESS_DB:db, APPLE_BUNDLE_ID:'ai.facemax.app' };

  let r = await callWorker(worker, env, '/api/progress', { token });
  assert.equal(r.status, 200);
  assert.equal(r.data.exists, false);

  const payload = { schema:1, keys:{ gu_streak:{ value:'{"count":4,"lastDate":"2026-08-08"}', ts:100, deleted:false } } };
  r = await callWorker(worker, env, '/api/progress', { method:'POST', token, body:{ payload, base_revision:0 } });
  assert.equal(r.status, 200);
  assert.equal(r.data.revision, 1);

  r = await callWorker(worker, env, '/api/progress', { token });
  assert.equal(r.data.exists, true);
  assert.equal(r.data.revision, 1);
  assert.equal(r.data.payload.keys.gu_streak.value, payload.keys.gu_streak.value);

  r = await callWorker(worker, env, '/api/progress', { method:'POST', token, body:{ payload, base_revision:0 } });
  assert.equal(r.status, 409, 'stale device write must conflict instead of overwriting');
  assert.equal(r.data.current.revision, 1);

  r = await callWorker(worker, { PREMIUM_KV:kv }, '/api/progress', { token });
  assert.equal(r.status, 503);
  assert.equal(r.data.error, 'progress_db_not_configured');

  r = await callWorker(worker, env, '/api/delete-account', { method:'POST', body:{ user_id:userId } });
  assert.equal(r.status, 401, 'Apple cloud account deletion requires session');

  r = await callWorker(worker, env, '/api/delete-account', { method:'POST', token, body:{ user_id:userId } });
  assert.equal(r.status, 200);
  assert.equal(db.rows.has(userId), false);
}

async function testNativeBridge() {
  const source = await fs.readFile(bridgePath, 'utf8');
  let optionsSeen = null;
  const SignInWithApple = {
    async authorize(options) {
      optionsSeen = options;
      return { response:{ user:'apple-native', identityToken:'jwt-token', authorizationCode:'code' } };
    },
  };
  const classList = { add(){}, remove(){}, toggle(){}, contains(){return false;} };
  const context = {
    console,
    crypto:webcrypto,
    Uint8Array,
    Array,
    Date,
    String,
    Promise,
    navigator:{},
    document:{ readyState:'complete', documentElement:{ classList }, addEventListener(){} },
    setTimeout(fn){ fn(); return 1; },
    clearTimeout(){},
  };
  context.window = {
    Capacitor:{ isNativePlatform:()=>true, getPlatform:()=> 'ios', Plugins:{ SignInWithApple } },
    document:context.document,
    navigator:context.navigator,
    crypto:webcrypto,
    setTimeout:context.setTimeout,
    clearTimeout:context.clearTimeout,
  };
  context.window.window = context.window;
  context.Capacitor = context.window.Capacitor;
  vm.createContext(context);
  vm.runInContext(source, context, { filename:bridgePath });
  const result = await context.window.facemax.signInWithApple();
  assert.equal(result.ok, true);
  assert.equal(result.identityToken, 'jwt-token');
  assert.equal(optionsSeen.scopes, '', 'FaceMax does not request Apple email/name scopes');
  assert.equal(optionsSeen.clientId, 'ai.facemax.app');
}

async function testStaticIntegration() {
  const [web, ios, bridge, iosBridge, pkg, entitlements, privacy, setup, migration] = await Promise.all([
    fs.readFile(indexPath, 'utf8'),
    fs.readFile(iosIndexPath, 'utf8'),
    fs.readFile(bridgePath, 'utf8'),
    fs.readFile(iosBridgePath, 'utf8'),
    fs.readFile(path.join(root, 'package.json'), 'utf8'),
    fs.readFile(path.join(root, 'ios/App/App/App.entitlements'), 'utf8'),
    fs.readFile(path.join(root, 'web/privacy.html'), 'utf8'),
    fs.readFile(path.join(root, 'D1_APPLE_SIGNIN_SETUP.md'), 'utf8'),
    fs.readFile(path.join(root, 'workers/api/migrations/0001_facemax_progress.sql'), 'utf8'),
  ]);
  assert.equal(web, ios, 'web/iOS index mirrors must match');
  assert.equal(bridge, iosBridge, 'web/iOS native bridge mirrors must match');
  assert.match(pkg, /@capacitor-community\/apple-sign-in/);
  assert.match(entitlements, /com\.apple\.developer\.applesignin/);
  assert.match(web, /Keep your progress & Premium/);
  assert.match(web, /Continue with Apple/);
  assert.match(web, /mandatoryAppleGate/);
  assert.doesNotMatch(web, /No account required\. No photo upload yet\./);
  assert.match(web, /Original photos stay on this iPhone/);
  assert.match(web, /small Face\/Food history thumbnails are backed up privately/);
  assert.match(web, /facemax_apple_session_v1/);
  assert.match(web, /delete clean\.thumb/);
  assert.match(web, /delete clean\.photo/);
  assert.match(web, /_fmCloudPreserveLocalMedia/);
  assert.match(web, /Apple Account linked/);
  assert.doesNotMatch(web, /ID: \" \+ uid/);
  assert.match(bridge, /effectiveRevenueCatUserId/);
  assert.match(bridge, /suppressInactiveSync/);
  assert.match(privacy, /Sign in with Apple and Cloud Sync/);
  assert.doesNotMatch(privacy, /Optional Sign in with Apple and Cloud Sync/);
  assert.match(setup, /binding = "PROGRESS_DB"/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS facemax_progress/);
  const worker = await fs.readFile(workerPath, 'utf8');
  assert.match(worker, /reconcileRevenueCatWebhookCustomer/);

}

await testWorkerProgress();
await testNativeBridge();
await testStaticIntegration();
console.log('PASS: Sign in with Apple + D1 progress sync audit');
