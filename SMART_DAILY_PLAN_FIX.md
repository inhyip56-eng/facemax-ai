# Smart Daily Plan

## What changed
- Water Tracker is not listed inside AI Features / Nutrition AI output. It remains a Daily tool.
- Added a new adaptive `TODAY'S PLAN` block at the very top of Daily.
- The block gives 3–7 tasks per day instead of a fixed count.
- The exact task list is frozen for the calendar day and does not reshuffle when the screen is reopened.

## Personalization inputs
The planner uses only existing app data:
- latest successful Face Scan metrics (skin, jawline, eye area, hair, photo angle, symmetry, harmony, cheekbones),
- questionnaire goals and concerns,
- self-selected daily time commitment,
- yesterday / recent 3-day completion,
- Glow Up streak,
- age of the latest Face Scan.

Face Scan scores remain authoritative; the daily planner never changes or invents scan metrics.

## Progressive load
- 5 min commitment: starts around 3 tasks.
- 10 min: around 4 tasks.
- 20 min: around 5 tasks.
- 30+ min: around 6 tasks.
- Recent completion below 50% => a lighter RESET day.
- Recent completion at or above 85%, or a strong streak => PROGRESS mode and up to 7 tasks.
- Targets inside tracked tasks (Glow steps, meals logged, water, exercises, routine steps) scale with consistency.

## Live completion
Tasks connected to existing trackers complete automatically:
- Glow Up Plan steps,
- Water Tracker,
- food log,
- Exercise Program,
- Morning Routine,
- a fresh Face Scan when requested.

Targeted grooming / skincare / photo / recovery actions are manual check-offs.

## Reliability
This Daily planner is deterministic and local on purpose. It does not make another OpenRouter call and therefore:
- opens instantly,
- consumes zero AI generation quota,
- cannot change because an AI response changed,
- still progresses based on real app data.

## Preserved
- App version 1.8.
- OpenRouter -> Gemini 2.5 Flash-Lite -> google-vertex/eu.
- Existing AI feature limits.
- Glow Up Plan 06:00 cycle and 6/6 lock.
- Current paywall / scan fixes and KBJU Meal Plan.
