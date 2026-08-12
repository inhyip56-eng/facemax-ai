# Quiz paywall + purchase + scan stability fix

Compared against user-provided old working archive `FaceMax_AI_v1.8_mandatory_apple_premium_sync_food_opaque.zip`.

- Restored the old quiz monetisation presentation: one weekly price CTA and a separate `🎁 Start free trial` CTA.
- Both quiz CTAs execute the real weekly RevenueCat/StoreKit purchase path.
- The free-trial button is no longer renamed/hidden based on transient StoreKit eligibility state.
- Restored immediate post-purchase resume semantics from the old build; RevenueCat backend reconciliation remains background work.
- Removed the experimental live pre-pay crop swapping that could cut the lower face and visually flash.
- Quiz paywall portrait is frozen once visible.
- Added single-flight Face Scan locking so purchase/restore/lifecycle callbacks cannot start the same scan concurrently.
- Each real scan gets a stable `scan_uid`; history writes are idempotent by that id.
- Legacy duplicate scans with identical metrics created within 90 seconds are automatically collapsed locally and during cloud merge.
- Existing Apple account isolation, D1 thumbnail sync, KBJU, Smart Daily, AI Features, 20/day limits and the new signing repository remain intact.
