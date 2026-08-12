# FaceMax iOS — secrets for the new GitHub repository

Certificate repository used by the project:

`https://github.com/inhyip56-eng/facemax-ai-cert.git`

## Required Repository Secrets for iOS / TestFlight

Add these under:

`Settings → Secrets and variables → Actions → Repository secrets`

1. `APPLE_TEAM_ID`
   - Apple Developer Team ID.

2. `APP_STORE_CONNECT_KEY_ID`
   - Key ID of the App Store Connect API key.

3. `APP_STORE_CONNECT_ISSUER_ID`
   - Issuer ID (UUID) from App Store Connect.

4. `APP_STORE_CONNECT_API_KEY_CONTENT`
   - Paste the RAW contents of the `.p8` key.
   - Keep the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines.
   - Do NOT base64-encode this value.

5. `MATCH_PASSWORD`
   - Password used by fastlane match to encrypt/decrypt signing files.
   - If the new cert repository contains copied existing match files, this MUST be the same old match password.

6. `MATCH_GIT_BASIC_AUTHORIZATION`
   - Base64 of:
     `github_username:personal_access_token`
   - The GitHub token must be able to clone/read the certificate repository.
   - For a writable one-time signing bootstrap, it must also be able to push to that repository.

Example on Windows PowerShell:

`[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("inhyip56-eng:YOUR_PAT"))`

## No secret is needed for MATCH_GIT_URL

The repository URL is already pinned in:
- `.github/workflows/ios-build.yml`
- `.github/workflows/ios-signing-reset.yml`
- `ios/App/fastlane/Fastfile`

to:

`https://github.com/inhyip56-eng/facemax-ai-cert.git`

The branch is currently `main`.

## Only if you also use Web + Worker deploy

Repository secret:
- `CLOUDFLARE_API_TOKEN`

Repository variable (not a secret):
- `CLOUDFLARE_ACCOUNT_ID`

These are not required for the iOS/TestFlight build itself.

## First build with a new empty cert repository

Normal iOS builds run fastlane match in read-only mode.
If the new cert repository is empty, run the `iOS build` workflow manually once with
`bootstrap_signing = true` so match can create/push the signing assets.

Do NOT run `Reset iOS signing` unless you intentionally want to revoke and recreate
the App Store distribution signing assets.
