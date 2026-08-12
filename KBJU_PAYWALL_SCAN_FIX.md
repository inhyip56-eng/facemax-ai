# FaceMax AI v1.8 — KBJU / Paywall / Scan fixes

- Meal Plan schema v4 adds daily and per-meal Calories / Protein / Fat / Carbs.
- `en-US` defaults the body-profile form to ft/in/lb; other locales default metric. Internally the backend keeps canonical cm/kg.
- Existing Water Tracker is linked from the Meal Plan.
- The quiz weekly paywall refreshes the actual RevenueCat/StoreKit weekly `priceString` every time it opens after Apple Sign-In.
- Its free-trial copy uses RevenueCat iOS introductory-offer eligibility when available; both weekly CTAs execute the real weekly purchase path.
- Quiz paywall portrait uses a dedicated generous crop instead of the avatar crop, avoiding chin/lower-face clipping.
- Removed the horizontal scan-line overlay globally.
- Exactly one post-quiz/paywall scan has a completely static photo; regular later scans retain the original mesh/canvas animation but never the horizontal line.
- Scan payload is preprocessed in the background and the loading screen paints before fallback work, removing the blank wait after tapping scan.
- Lower loading rows use numeric percentages instead of `AI...`.
- OpenRouter Gemini/Vertex EU routing and the separate 20/day per-user/per-feature limits are preserved.
