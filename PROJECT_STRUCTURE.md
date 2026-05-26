# Project Structure

## Root
- `index.html`: main single-page app entry.
- `login.html`: login and registration page.
- `manifest.json`: PWA manifest.
- `service-worker.js`: offline cache and notification worker.
- `server.js`: local development server and local AI endpoints.
- `firebase.json`: Firebase Hosting and Functions routing.
- `firestore.rules`: Firestore security rules.
- `.env.example`: local environment template.

## Assets
- `assets/css/`
  - `style.css`: main application styles.
  - `login.css`: auth page styles.
- `assets/js/`
  - `app.js`: main SPA logic.
  - `firebase-init.js`: Firebase bootstrap.
  - `sound-effects.js`: sound helpers.
- `assets/images/`
  - `subjects/`: subject thumbnails.
  - `icon-192.svg`: notification/PWA icon.
  - `badge-72.svg`: notification badge.

## Backend
- `functions/`
  - `index.js`: Firebase Functions endpoints for AI features.
  - `package.json`: Functions runtime dependencies.

## Notes
- Frontend static files are organized under `assets/`.
- `service-worker.js` remains at the root so its scope covers the whole app.
- Firebase deploy depends on the rewrites in `firebase.json` for:
  - `/api/ai-mentor`
  - `/api/extract-question-image`
  - `/api/generate-similar-questions`
