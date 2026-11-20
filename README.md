# PEAK MODE — Lifetime Fitness PWA

## Publish on GitHub Pages
1. Create a GitHub repository named `peak-mode`.
2. Extract this ZIP and upload the **contents** to the repository root (not the ZIP alone).
3. Open repository **Settings → Pages**.
4. Choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then Save.
5. Open the published URL, typically `https://YOUR-USERNAME.github.io/peak-mode/`.

## Install on iPhone
1. Open the published URL in Safari.
2. Tap Share → Add to Home Screen.
3. Enable Open as Web App if offered, then Add.

On Windows, open the same URL in Edge/Chrome and choose Install this site as an app.

## Features
Daily dashboard, rotating 7-day Kerala-inspired meal cycle, portion guidance, meal preparation, grocery list, 6-day strength and athletic plan, progression guidance, water/checklist tracking, body and strength logs, backup export/import, offline app shell.

## Notifications and sync limitations
This static GitHub Pages app can show reminders while open and running. It cannot guarantee scheduled notifications after iOS suspends/closes it. Reliable background push requires a push service/backend. Data is stored in local browser storage and does not automatically sync between iPhone and Windows. Use Progress → Export backup / Import backup to transfer records. Back up regularly.

## Nutrition and training
2,500 kcal and 180 g protein are initial estimates, not exact laboratory calculations. Food values vary with recipes, fish species, edible portions, coconut and oil. Adjust after 2–3 weeks using average weight, waist, recovery and performance. Start lifting conservatively after your training break; this is a general plan, not medical advice.

## v2 upgrades
- **Physique tab:** daily Front/Side/Back photo, start-vs-latest comparison, timeline, delete. Photos are compressed and stored in IndexedDB on the device.
- **Meal log:** tick meals as eaten, live calories and protein vs target, add extra meals, attach a photo to any meal.
- **Easy meals:** every dish has a "How to make it" button with total minutes and shortcuts, plus a 90-minute Sunday prep checklist.
- **Workout:** exercise ticks (all done auto-ticks the checklist), rest timer, personal-best toast.
- **Progress:** weight trend chart, backups now include photos, reminder when no backup in 7 days.
- **Fixes:** page markup typo, day rollover now uses local time (before 5:30 am IST it used yesterday's date), water interval setting now works, editable calorie/protein targets, offline cache updates itself.

After uploading v2 to GitHub, close and reopen the app once or twice so the new version loads.

## v3: themes and music
- **Themes:** Ember (default), Ocean, Violet, Light. Change under the ⚙ settings button → Theme.
- **Workout music:** Workout tab → paste a Spotify or YouTube playlist link to play it inside the app, or add your own songs (MP3/M4A) to play offline with lock-screen controls. Songs stay on the device and are not included in backups.
