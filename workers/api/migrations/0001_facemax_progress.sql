CREATE TABLE IF NOT EXISTS facemax_progress (
  user_id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_facemax_progress_updated_at
  ON facemax_progress(updated_at);
