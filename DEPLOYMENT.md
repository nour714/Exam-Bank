# Deployment Prep

## Local check
1. Run `npm run dev`
2. Open:
   - `http://localhost:3000/index.html`
   - `http://localhost:3000/login.html`

## Required environment
- Local server:
  - `AI_API_KEY`
  - optional: `AI_BASE_URL`
  - optional: `AI_MODEL`
- Firebase Functions:
  - secret `AI_API_KEY`

## Firebase deploy
1. Login: `firebase login`
2. Set functions secret:
   - `firebase functions:secrets:set AI_API_KEY`
3. Deploy:
   - `firebase deploy --only hosting,functions,firestore:rules`

## Final checklist
- `index.html` loads styles/scripts from `assets/`
- `login.html` loads auth assets correctly
- `/api/ai-mentor` works locally
- `/api/generate-similar-questions` has a Firebase rewrite
- subject images exist in `assets/images/subjects/`
- service worker points to valid cached assets
