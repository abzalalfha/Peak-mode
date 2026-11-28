# PEAK MODE v15 — Full Cinematic Visual System

This is a complete visual system upgrade on top of v14.

## What changed

### Design system
- Deeper pure-black base (`#050505`) with richer radial glows
- Stronger glassmorphism on cards, dock, and header (backdrop-filter + soft borders)
- Refined neon lime (`#c8ff38`) with better glow and shadow treatment
- Improved card radius, padding, and elevation hierarchy
- Cleaner typography scale and tighter letter-spacing

### Home / Today
- Larger, more cinematic hero workout card
- Stronger metric tiles with progress lines
- Premium next-meal card treatment
- Better intro hierarchy and “PM” mark

### Navigation
- Floating glass dock with clearer labels and stronger active state
- Subnav chips with glow on active

### Other surfaces
- Activity / Run screen cards and stats polished
- Nutrition, Library, Coach, Progress cards aligned to the new system
- Dialogs and onboarding updated to match

### Technical
- Service worker cache bumped to `peak-mode-v15-cinematic`
- All previous functionality retained (workouts, GPS, meals, backups, etc.)

## Deploy
1. Keep a backup of your current version.
2. Replace the files in your GitHub Pages repo with the contents of this package.
3. Push to main.
4. On iPhone: open the site in Safari → clear website data for the domain (or remove + re-add Home Screen shortcut) so the new cache loads.

## Notes
- The workout hero still uses an external Unsplash image (requires network). Dark fallback remains if it fails.
- No features were removed. This is a pure presentation upgrade.
