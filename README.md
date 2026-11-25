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

## v4: adaptive engine (first slice)
- **Coach tab:** profile (age, height, weight, activity, goal) gives calorie and protein targets (Mifflin-St Jeor); you confirm before they are applied.
- **Morning check-in:** readiness score from your own answers plus training streak, with a visible factor breakdown and a recommendation. Pain or illness overrides the score.
- **Weekly report:** intake, workouts, readiness and weight trend (regression over 21 days), with rule-based suggestions. Calorie changes are only applied when you confirm.
- Not included yet: cloud sync, Apple Health (needs a native iOS wrapper), AI chat coach (needs a server and API key), food database, exercise library.

## v5: training setup
- First launch asks where you train (gym, home, outdoors), equipment, workout types (strength, HIIT, running, mobility), days per week, session length and experience, then builds your week. Change it any time on the Workout tab.
- Gym with strength keeps the original weekly program. Home and outdoor plans are generated from your equipment, with rest days and cardio slots.

## v6: exercise library
- **Library tab:** search plus muscle, equipment and level filters over the Free Exercise DB (870+ exercises, public domain/Unlicense). The data and images load from GitHub at runtime and are cached for offline use after first view. Nothing is copied into this repo.
- **Demos in workouts:** every exercise in Today and Workout has a ▶ Demo button. Names are matched strictly; if there is no exact match, no demo is shown.
- Each demo alternates start/end positions with play, pause, replay and full screen, plus steps, muscles, equipment, previous performance, set logging, and alternatives (easier, harder, and with your equipment).
- This dataset has images, not video or GIFs. For video you would need a licensed API such as ExerciseDB (API key) or a paid pack.

## v7: Indian food database
- Today → **+ Search food**: about 70 foods from across India (South, North, West, East, North-East, pan-India) with household portions (katori, roti, idli, glass, handful) or grams. Adds calories, protein, carbs and fat to today's intake.
- Values are approximate typical home-style figures, not an official dataset. Use **custom food** for exact numbers from a label or your own recipe.

## v8: new interface
- Redesigned look: bento cards, week strip, calorie ring, weekly consistency bars, floating bottom dock (Home, Train, Nutrition, Coach, More).
- New default theme **Volt** (dark with lime and lavender); **Sunset** (light, orange) is available in Settings → Theme, along with Ember, Ocean, Violet and Light. Add your name in Settings for the greeting.
- All existing features and data are unchanged.

## v9: first-run setup
- On first open the app asks about you, goals, training, food and any limitations, then builds your plan and targets. No account yet: everything is saved on the device.
- Change any answer later: More → Profile & preferences (or ⚙ Settings → Edit profile & preferences).
- Diet and region choices filter the food search. Meal-plan menus and exercise selection do not adapt to diet or injuries yet.

## v10: Run tab
- GPS tracking for run, walk and cycle: time, distance, current and average pace, km splits, route drawing, calorie estimate, history, weekly distance.
- Share image with route, distance, time and pace. The first and last 200 m can be hidden to protect your home location.
- Web limits: keep the screen on (iPhone cannot track in the background), plain route drawing (no street map). Activities are saved on this device and included in backups.

## v11: calm Today, guided sessions, 4 tabs
- **Today:** one workout card with Start, the next meal, and thin calorie, protein and water lines. Streak, weekly bars, checklist and hydration moved to You → Progress.
- **Guided session:** one exercise at a time with demo, set counter, weight and reps steppers, Done set, automatic 90 s rest, summary (time, volume, personal bests). Logs to history.
- **Eat:** the day as a timeline (tick, next highlighted, later faded). Swipe right to mark eaten. Swap suggests a dish with similar protein (diet-aware).
- **Tabs:** Today, Train (Plan, Library, Run), Eat, You (Progress, Photos, Coach). Settings stay under the gear button.
- **Music:** floating button on every screen, opens the music sheet.
- Not included: accounts, cloud sync, background push reminders, AI chat coach. These need a backend.

## v12
- Run is a main tab again (Today, Train, Run, Eat, You), always visible.
- Run PNG: your route, PEAK MODE logo, distance, time and pace. Choose dark, light or transparent background. Download PNG or Share.

## v13.1 — Phase 1, Step 1: security and safe backup/restore
- **Security fix:** all text you type (meal names, food names, notes, lift names) is now shown as plain text and can no longer run as code. This also protects against a hostile backup file.
- **Restore is now safe:** a backup file is fully checked before anything changes. Wrong or damaged files are rejected with a clear message and your data stays untouched. Valid files show a summary and ask for confirmation. Your settings and logs are replaced by the backup. Photos and activities in the backup are added to the ones already on the device.
- A safety copy of your previous settings and logs is kept on the device (`peakModeLifetimeV1_beforeRestore`) in case a restore was a mistake.
- Backups now carry a format marker and app version. Backups made with v13 or earlier still restore.
- Offline cache renamed `peak-mode-v13-1`, so devices pick up the update. Close and reopen the app twice after publishing.
