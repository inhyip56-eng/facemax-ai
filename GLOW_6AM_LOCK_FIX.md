# Glow Up Plan — 06:00 local cycle + 6/6 lock

- Glow cycle is 06:00–05:59 in the device's current local time zone.
- Plan cache no longer depends on scan id or Goals & Preferences.
- New scans/settings do not regenerate the active plan.
- Crossing local 06:00 is the only automatic regeneration boundary.
- If app is closed at 06:00, the new plan loads on first open after the boundary.
- 6/6 completion physically and logically locks all six task cards until next cycle.
- Streak/progress/week completion use the same 06:00 cycle boundary.
- Worker also caches one Glow plan per user/cycle in PREMIUM_KV for cross-device stability.
- Existing valid current-day cache/progress is migrated where possible to avoid a surprise refresh on upgrade.
