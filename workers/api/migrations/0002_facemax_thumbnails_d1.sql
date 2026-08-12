CREATE TABLE IF NOT EXISTS facemax_thumbnails (
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  scan_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  image_data BLOB NOT NULL,
  byte_size INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, kind, scan_id)
);

CREATE INDEX IF NOT EXISTS idx_facemax_thumbnails_user_updated
  ON facemax_thumbnails(user_id, updated_at DESC);
