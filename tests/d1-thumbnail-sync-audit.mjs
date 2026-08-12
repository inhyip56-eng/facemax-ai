import fs from 'node:fs';
const worker = fs.readFileSync(new URL('../workers/api/src/worker.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
const wrangler = fs.readFileSync(new URL('../workers/api/wrangler.toml', import.meta.url), 'utf8');
const migration = fs.readFileSync(new URL('../workers/api/migrations/0002_facemax_thumbnails_d1.sql', import.meta.url), 'utf8');
function ok(cond, msg){ if(!cond){ console.error('FAIL:', msg); process.exitCode=1; } else console.log('PASS:', msg); }
ok(worker.includes('CREATE TABLE IF NOT EXISTS facemax_thumbnails'), 'Worker self-creates D1 thumbnail table');
ok(worker.includes('image_data BLOB NOT NULL'), 'D1 thumbnail data uses BLOB');
ok(worker.includes('INSERT INTO facemax_thumbnails'), 'thumbnail POST writes D1');
ok(worker.includes('FROM facemax_thumbnails'), 'thumbnail GET reads D1');
ok(worker.includes('DELETE FROM facemax_thumbnails WHERE user_id = ?'), 'Delete Account removes D1 thumbnails');
ok(!worker.includes('THUMBNAILS_BUCKET'), 'Worker has no R2 thumbnail binding dependency');
ok(!wrangler.includes('r2_buckets') && !wrangler.includes('THUMBNAILS_BUCKET'), 'Wrangler has no R2 configuration');
ok(wrangler.includes('binding = "PROGRESS_DB"'), 'Existing D1 binding retained');
ok(migration.includes('facemax_thumbnails'), 'D1 migration included');
ok(html.includes('dedicated private D1 BLOB table'), 'Client comments match D1 storage');
ok(html.includes('downscaleImage(dataUrl, 260, 0.62)') && html.includes('downscaleImage(dataUrl, 220, 0.64)'), 'Cloud thumbnails are aggressively downsized');
ok(!html.includes('R2 backup') && !html.includes('goes to R2'), 'Client no longer claims R2 storage');
