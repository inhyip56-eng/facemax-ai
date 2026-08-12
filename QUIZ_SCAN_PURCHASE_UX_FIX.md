# Quiz purchase -> Face Scan UX fix

## Fixed
- Mandatory Sign in with Apple is enforced before onboarding capture/paywall/checkout.
- Apple sign-in buttons use a full SVG Apple mark instead of a clipped font glyph.
- After a successful StoreKit / RevenueCat purchase or trial, FaceMax waits briefly for the backend Premium mirror before opening the scan loading screen.
- A transient RevenueCat `no_active_premium_entitlement` immediately after a confirmed purchase is treated as propagation delay and retried, rather than as a terminal inactive result.
- The scan-side Premium 402 fallback is now short and bounded.
- Removed the hidden 10-second post-checkout polling path after cancellation/failure.
- Paywall shows `Activating Premium & preparing your scan...` while the backend is being synchronized.
- Scan loading progress no longer parks at 89/91/98/99:
  - it moves continuously toward 99.4%;
  - high percentages use decimal precision;
  - shimmer/status text continues changing;
  - 100% is shown only when the real AI response has arrived.
- Removed the competing fake upload-percentage timer.

## Preserved
- OpenRouter -> google/gemini-2.5-flash-lite -> google-vertex/eu.
- Separate 20/day successful AI limits per user and per AI feature.
- Glow Up Plan 06:00 local-time cycle.
- 6/6 Glow task completion lock.
- Yellow-only streak presentation.
- Notification inbox/bell behavior.

## Validation
- Inline JavaScript syntax parsed successfully.
- native-bridge.js passes node --check.
- Quiz purchase/scan UX audit passes.
- Sign in with Apple/D1 audit passes.
- Quiz pre-pay transition audit passes.
- 20/day limit regression audit passes.
- Glow 06:00 and 6/6 lock regression audits pass.
- Streak and notification regression audits pass.
