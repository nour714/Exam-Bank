# Deployment Prep

## Local check
1. Run `npm run dev`
2. Open:
   - `http://localhost:3000/index.html`
   - `http://localhost:3000/login.html`

## Required environment
- Local server and Vercel:
  - `AI_API_KEY`
  - optional: `AI_BASE_URL`
  - optional: `AI_MODEL`
- Firebase Functions:
  - secret `AI_API_KEY`

## Vercel deploy
1. Import the GitHub repo into Vercel.
2. Framework preset:
   - `Other`
3. Root directory:
   - `.`
4. Add Environment Variables in Vercel project settings:
   - `AI_API_KEY`
   - optional `AI_BASE_URL`
   - optional `AI_MODEL`
5. Deploy.

## Vercel notes
- Static files are served directly from the repo root and `assets/`.
- Serverless endpoints are in:
  - `api/ai-mentor.js`
  - `api/extract-question-image.js`
  - `api/generate-similar-questions.js`
- Shared AI logic is in:
  - `lib/ai-api.js`

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
- `/api/generate-similar-questions` works locally
- subject images exist in `assets/images/subjects/`
- service worker points to valid cached assets
- `vercel.json` exists for Vercel Functions runtime
