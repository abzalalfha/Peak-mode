# PEAK MODE: how the app is built (v13.5)

Plain web app (PWA). No build step, no server. Files are served as they are by GitHub Pages. All user data lives in the browser on the device.

## Files
| File | What it does |
|---|---|
| `index.html`, `styles.css`, `extras.css`, `ui.css` | Page structure and styling |
| `logo.js` | Logo shapes (inline SVG and canvas drawing) |
| `app.js` | Core: saved data, migrations, error log, render pipeline, built-in 7-day menu and gym program |
| `extras.js` | Photos (IndexedDB), meal timeline, recipes, charts |
| `music.js` | Themes, playlists, your own MP3s |
| `coach.js` | Daily readiness check-in, calorie and protein targets, weekly report |
| `plan.js` | Gym program follows days/time/experience; home and outdoor plan generator |
| `library.js` | Exercise library and demos (loads an open exercise database when online) |
| `food.js` | Indian food list, portions, search, custom foods |
| `ui.js`, `flow.js` | Today screen, bottom dock, meal swaps and diet/allergy adjustment |
| `run.js` | GPS run, walk, cycle, share image |
| `session.js` | Guided workout (saved as you go, clock-based rest timer) |
| `onboard.js` | First-run setup and profile editor |
| `backup.js` | Safe backup and restore (checks every value before changing anything) |
| `safety.js` | Storage protection and backup reminders |
| `learn-data.js`, `learn.js` | Knowledge tips, quiz, muscle guide, rest-time exercise knowledge |
| `diag.js` | Version display and "Copy diagnostics" in Settings |
| `sw.js`, `manifest.webmanifest`, icons | Offline use and installing to the Home Screen |
| `tests.html`, `tests.js` | Self-test page (see Testing) |

Scripts load in the order listed in `index.html`. Later files may use anything defined by earlier ones.

## Saved data
- Main data: `localStorage`, key `peakModeLifetimeV1`, one JSON object (`db`). Call `save()` after changing `db`.
- Photos and runs: IndexedDB `peakPhotos`. A running workout draft: `peakModeSession`.
- `db.v` is the data format version (`SCHEMA` in `app.js`). Data from a newer version is never overwritten.
- **Changing the shape of saved data:** raise `SCHEMA`, add a step to `MIGRATIONS` in `app.js` (it upgrades data from the previous version), and update the checks in `backup.js` so backups of the new shape are accepted.
- Damaged data never crashes the app: a copy is kept under `peakModeLifetimeV1_corrupt` and the app starts clean.
- Pages opened with `?pmkey=peakTest…` use a separate store. Only names starting with `peakTest` are accepted, so tests cannot touch real data.

## Drawing screens
`renderToday`, `renderGym`, `renderFood` and `renderHistory` draw a base screen and then run extra steps. A module adds a step with `PMR.on('today', fn)` (or `gym`, `food`, `history`). Steps run in script-load order. Do not wrap or replace these functions.

## Content (Learn)
- `PMDATA.QUIZ` and `PMDATA.TIPS` are append-only: add at the end, never reorder or delete (saved answers refer to positions).
- Every quiz item: `[question, correct, wrong1, wrong2, wrong3, explanation, category]`.
- Exercise muscle info is matched by name with `PMDATA.RULES` (first match wins). The self-test fails if an exercise the app can schedule has no rule.

## Testing
- Open `tests.html` (for example `https://YOUR-SITE/tests.html`) and press **Run all tests**. About 30 seconds. Everything must be green before a release.
- Running locally: in the project folder run `python -m http.server 8000`, then open `http://localhost:8000/tests.html`.
- Add a check in `tests.js` with `await check('what should be true', () => { expect(S.ev('code run inside the app') === 1, 'message') })`.

## Release checklist
1. Raise `APP_VER` in `app.js`.
2. Rename the cache in `sw.js` (for example `peak-mode-v13-6`) and add any new files to its list.
3. Add a note to `README.md`.
4. Run `tests.html`. All green.
5. Upload the files. Open the app twice to load the update.
6. Check on a real phone.

## Known limits
- Data is only on the device until accounts and cloud sync exist (Phase 2).
- A web app cannot track GPS in the background or beep on a locked iPhone.
- Allergy and injury matching uses names only.
