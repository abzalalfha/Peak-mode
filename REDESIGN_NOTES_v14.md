# PEAK MODE v14 — Hybrid visual redesign

This is a visual redesign of the existing PEAK MODE v13.4 web/PWA project.

## What changed
- Rebuilt the Today screen hierarchy with a large editorial greeting, photo-led workout feature, daily metric tiles, next-meal card and quick hydration action.
- Reworked the bottom navigation into a labelled five-item dock and restyled the Train, Nutrition, Progress, Coach, Library, Physique and guided-session surfaces.
- Rebuilt the Run / Walk / Cycle screen presentation with activity selection, a route-preview stage, prominent elapsed time, distance and pace metrics, GPS status and history sections.
- Added a dedicated `redesign.css` visual layer and bumped the service-worker cache to `peak-mode-v14-redesign`.

## Functionality preservation
The underlying workout session, exercise library, nutrition calculations, local storage, GPS watchPosition tracking, pause/resume, activity saving, split calculations, route drawing, route PNG export/share, history, backups, onboarding, reminders and settings logic are retained. The existing `flow.js` and `run.js` edits are limited to presentation markup; their event handlers and data operations remain in place.

## Deploy
1. Keep a backup of your current v13.4 repository and data.
2. Extract the contents of this ZIP into the repository root (the `index.html` file should be at the root).
3. Commit and push the files to GitHub Pages.
4. On iPhone, open the site in Safari and refresh. If the old UI remains, remove the Home Screen shortcut, clear the site's website data/cache, reopen the URL, and add it to Home Screen again.

## Notes
- The workout hero uses an externally hosted Unsplash image; it needs an internet connection to load. A dark gradient fallback remains if it cannot load.
- The activity screen continues to use the existing GPS route recording and canvas route preview. It does not add turn-by-turn street navigation or map tiles.
- No workout, running, walking, cycling, nutrition, account or tracking feature has intentionally been removed.
