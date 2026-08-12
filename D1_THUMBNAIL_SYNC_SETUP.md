# FaceMax — D1 thumbnail sync

No new Cloudflare product or payment method is required.

The existing binding is enough:

- `PROGRESS_DB` -> `facemax-progress`

The Worker creates `facemax_thumbnails` automatically on the first thumbnail upload/read using `CREATE TABLE IF NOT EXISTS`.

Optional manual migration:

```bash
npx wrangler@latest d1 execute facemax-progress --remote --file=./workers/api/migrations/0002_facemax_thumbnails_d1.sql
```

Thumbnail design:

- Original Face/Food photos remain local on the iPhone.
- Only a small compressed thumbnail is stored in D1 as a BLOB.
- The normal progress row stores only `thumb_key` / `photo_key`.
- GET/POST `/api/thumbnail` requires the FaceMax Apple session.
- Delete Account removes both the progress row and all thumbnail rows for that account.

Do not create an R2 bucket and do not add `THUMBNAILS_BUCKET`.
