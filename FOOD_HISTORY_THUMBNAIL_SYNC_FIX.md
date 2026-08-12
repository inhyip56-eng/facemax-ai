# Food Scan cloud thumbnail persistence fix

- Preserves `photo_key` through every Food Scan history compaction/rewrite.
- Uploads the small Food Scan history thumbnail to private D1 immediately after a successful scan.
- Stores the returned `photo_key` on that exact history item and schedules progress sync.
- Keeps background thumbnail backfill as a fallback for offline/transient failures.
- Merges Food Scan history additively across devices so a valid `photo_key` cannot be erased by another device's empty copy.
- Hydrates Food Scan thumbnails from D1 after Apple-account cloud restore.
- Original/full-resolution meal photos are still not stored in cloud backup.
- No Worker change is required when `/api/thumbnail` is already deployed (the same endpoint used by Face Scan thumbnails supports `kind: "food"`).
