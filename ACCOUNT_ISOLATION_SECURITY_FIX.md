# Apple-account data isolation fix

- D1 progress rows are keyed by authenticated Apple `user_id`.
- Face/Food thumbnails are keyed by `(user_id, kind, scan_id)` and GET/POST require the authenticated Apple session.
- Client remembers which Apple account owns the local offline state.
- When a different Apple account signs in on the same iPhone, account-scoped local scans, food history, plans, streak/progress, notifications and AI caches are cleared before the new account cloud merge.
- Anonymous-install migration is claimed by the first Apple account and cannot be copied into a different Apple account later.
- Same-account sign-out/sign-in does not trigger the switch reset.
