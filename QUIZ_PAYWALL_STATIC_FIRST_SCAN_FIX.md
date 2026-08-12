# Quiz paywall + first-scan photo animation fix

## Required flow

- In onboarding/quiz, completing the second photo always opens the real `quizPaywall` screen.
- The paywall presentation is never skipped merely because Premium is already active or onboarding was completed previously on the install.
- Existing Premium changes the paywall CTA to Continue; it does not suppress the paywall screen.
- The single Face Scan started after that quiz paywall keeps the photo completely static:
  - no sweep line;
  - no mesh/landmarks canvas;
  - no animation/filter/transform on the photo itself.
- Loading status and metric progress below the photo remain animated/alive.
- Every later Face Scan outside that one post-quiz-paywall scan keeps the normal Face Scan photo animation.

## Scope

Client only (`web/index.html` + bundled iOS `public/index.html`). Worker/API behavior is unchanged.
