# FaceMax v1.8 — Apple account / Premium sync fix

## User-facing changes
- Sign in with Apple is required on iOS before entering the signed-in app experience or purchasing Premium.
- New users get a final quiz step: “Keep your progress & Premium” → Continue with Apple.
- Returning unsigned installs see a mandatory Apple account gate.
- Profile no longer displays the raw `apple_...` internal identifier; it shows “Apple Account linked”.
- D1 backup stores progress only. Face photos, meal photos and profile images are excluded.
- Local scan/food thumbnails are preserved on the current iPhone during cloud sync. With the existing D1 progress binding, a new iPhone restores both history metadata and small Face/Food history thumbnails; originals are not backed up.
- Food Scanner status cards/pills use fully opaque solid green / amber / red backgrounds.

## Existing subscriber migration
Old builds could configure RevenueCat under the pre-account install ID. Switching directly to a new Apple-backed custom ID can make CustomerInfo look inactive because RevenueCat does not merge one custom ID into another via `logIn()` alone.

This build:
1. switches to the Apple-backed FaceMax ID;
2. automatically restores purchases to transfer the StoreKit receipt to that account;
3. falls back to the verified legacy RevenueCat customer on the existing device if transfer is temporarily unavailable;
4. keeps webhook renewals/expirations pointed at the linked Apple FaceMax owner.

RevenueCat Project Restore Behavior should be **Transfer to new App User ID**.

## Cloudflare
D1 database: `facemax-progress`
Binding: `PROGRESS_DB`
The production D1 database ID is included in `workers/api/wrangler.toml`.

## Files changed
- `web/index.html`
- `web/js/native-bridge.js`
- `web/privacy.html`
- `web/privacy/index.html`
- iOS public mirrors of those web files
- `workers/api/src/worker.js`
- `workers/api/wrangler.toml`
- tests/docs

`.github` workflows are unchanged.
