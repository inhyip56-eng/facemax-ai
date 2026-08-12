# FaceMax AI v1.8 — grounded AI tools + quiz paywall + scan UX

## Quiz / Premium flow
- The onboarding paywall is a mandatory presentation step even when the Apple account already owns Premium.
- Existing subscribers see the paywall but plan cards are disabled and the CTA becomes `Continue with Premium`; they are never charged again.
- Before Face Scan starts, the app triggers a fresh RevenueCat -> backend reconciliation and verifies `/api/premium-status`.
- Fresh purchase/trial waits on the paywall for backend Premium propagation instead of moving that wait onto the Face Scan loading screen.

## Face Scan loading UX
- The face mesh animation remains enabled.
- Added a CSS compositor-driven scan sweep so there is visible motion even if JavaScript briefly stalls.
- CPU-heavy image resize/canvas encoding happens before the loading screen opens and the prepared image is reused for retries.
- At the unknowable remote-AI tail, fake 89–99% values are replaced by a live `AI…` state + pulsing bar/status.
- 100% appears only after the real AI response arrives.

## AI Features grounding
- Face Scan now returns `face_shape_type`: Oval / Round / Square / Heart / Diamond / Oblong / Pear / Unknown.
- Removed all silent `Oval` fallbacks. Missing shape remains unknown.
- Skin / Haircut / Jawline / Profile Photo use the latest successful Face Scan report and its real saved scores.
- The AI tool prompt explicitly treats supplied scan scores as authoritative and forbids inventing or replacing metrics.
- Haircut/Jawline only receive a categorical face shape when the latest scan actually returned one.

## AI Features persistence / UI
- First successful generation is cached locally and server-side for that user + tool + scan.
- Reopening a tool shows the same saved result and does not spend another daily generation.
- `Regenerate` explicitly creates a new answer and counts as a new successful AI generation.
- Stronger typography matches the removed Glow Up text cards.
- Summary is now a highlighted dark card with a white four-point AI sparkle.
- Action cards use bold text and numbered purple tiles.

## Preserved
- iOS marketing version 1.8.
- Match repo: https://github.com/inhyip56-eng/facemax-ai-cert.git
- OpenRouter -> google/gemini-2.5-flash-lite -> google-vertex/eu.
- `allow_fallbacks: false`, `data_collection: deny`.
- Separate 20/day successful AI quotas per user and per feature.
- Glow Up Plan 06:00 local-time cycle, 6/6 lock, yellow streak.
