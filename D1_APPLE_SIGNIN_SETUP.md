# FaceMax — Sign in with Apple + D1 progress sync setup

The app code requires Sign in with Apple before the signed-in iOS app experience / Premium purchase flow and uses D1 for cloud progress sync.
One Cloudflare D1 database must be created and bound to the existing `facemax-api` Worker.

## 1. Create D1

Cloudflare Dashboard → **Storage & Databases** → **D1 SQL Database** → **Create**.

Name it:

`facemax-progress`

Copy the database ID shown by Cloudflare.

## 2. Bind D1 to the Worker

In `workers/api/wrangler.toml`, add:

```toml
[[d1_databases]]
binding = "PROGRESS_DB"
database_name = "facemax-progress"
database_id = "YOUR_REAL_DATABASE_ID"
```

The binding name must be exactly `PROGRESS_DB` because the Worker reads `env.PROGRESS_DB`.

## 3. Create the table

From the repository root:

```bash
cd workers/api
npx wrangler@latest d1 execute facemax-progress --remote --file=./migrations/0001_facemax_progress.sql
```

The Worker also runs `CREATE TABLE IF NOT EXISTS` defensively on first sync, so the migration is safe to run more than once.

## 4. Enable Sign in with Apple for the App ID

Apple Developer → Certificates, Identifiers & Profiles → Identifiers → `ai.facemax.app` → enable **Sign in with Apple**.

`ios/App/App/App.entitlements` already contains:

`com.apple.developer.applesignin = Default`

The project already includes `@capacitor-community/apple-sign-in`, and `npx cap sync ios` will install/register it for the iOS build.

If your App Store provisioning profile was created before the capability was enabled, regenerate the App Store profile (your Fastlane/match signing reset can create a fresh one).

## 5. Deploy

Deploy the Worker after the D1 binding is present, then build the iOS app normally.

## What gets synced

Scores/metrics, scan-history metadata, quiz/goals, Glow Plan state, streaks, achievements, Meal Plan cache/profile, food-log progress and notification inbox state. R2 object keys for small history thumbnails may also be included in D1 metadata.

Original/full-resolution image bytes are excluded from cloud backup. Small compressed Face/Food history thumbnails are stored in a separate private D1 BLOB table using the existing `PROGRESS_DB` binding; the profile picture is not backed up.

## Behavior

- FaceMax still works with no account.
- New users sign in with Apple on the final quiz step; returning unsigned installs are gated until Apple sign-in. Profile → Account & sync shows sync status.
- Existing local progress is uploaded on first sign-in if the Apple account has no cloud backup.
- If a backup already exists, histories/achievements are merged and revision checks prevent one device from silently overwriting another.
- Sign out stops sync but keeps local progress.
- Delete Account removes the D1 progress row for Apple-linked accounts when a valid Apple session is supplied.
