# Product Requirements Document (PRD)

## 1. Product Name
**Exam Bank** (`بنك الأسئلة`) - AI-assisted study and exam practice platform for Arabic-speaking secondary students.

## 2. Product Summary
Exam Bank is a single-page learning app focused on helping students review subjects, solve practice questions, take timed exams, track progress, and collaborate in study groups. The current product is optimized around a fast browser experience with PWA support, offline entry points, and lightweight AI-assisted learning tools.

## 3. Product Goals
- Help students start practicing quickly with minimal friction.
- Provide a subject-first experience for question solving and mock exams.
- Support daily study habits through progress stats, streaks, and review loops.
- Keep core screens available through installable PWA behavior and cached offline access.
- Offer AI help for explanation, OCR extraction, and similar-question generation.

## 4. Target Users
- **Primary users**: Egyptian secondary students, especially `ثالثة ثانوي`.
- **Secondary users**: Students preparing for subject-based revision in science, math, and literary tracks.
- **Internal/QA users**: Testers who need a reliable demo login for automated and manual validation.

## 5. Current Scope

### 5.1 Authentication and Access
- Email/password sign-in with Firebase Auth.
- Google sign-in.
- Registration and password reset.
- QA/demo access path for `test@gmail.com / test123`.
- Local session fallback for demo/offline entry so the app remains reachable when Firebase is unavailable or the user launches the cached app offline.

### 5.2 Home and Dashboard
- Landing home screen with quick actions.
- Progress dashboard showing XP, solved questions, streak, and accuracy.
- Subject browsing through cards for:
  - Physics
  - Chemistry
  - Biology
  - Math
  - Arabic
  - English
  - Geology
  - History
  - Geography

### 5.3 Question Bank and Practice
- Subject-based practice entry from home/dashboard cards.
- Large in-app question bank seeded per subject.
- Instant practice flow inside the exam view.
- Wrong-answer review with AI-assisted explanation and similar-question follow-up.
- Custom question creation and storage in local/Firebase-backed state.

### 5.4 Exam Mode
- Timed exam mode.
- Question navigation map.
- Progress tracking during exams.
- Auto grading and result summary after submission.
- Review mode for mistakes.

### 5.5 AI Features
- AI Mentor conversational flow.
- Similar-question generation endpoint.
- OCR/image extraction endpoint for question capture.
- Subject detection heuristics for AI requests.

### 5.6 Study Groups
- Pre-seeded joinable study groups for first-time users.
- Create-group flow.
- Join/open group interaction.
- Lightweight in-app group chat modal with mock conversation flow.

### 5.7 Settings and Profile
- Profile name/avatar management.
- Dark mode toggle.
- Notification preference toggle.
- Sound effects support.

### 5.8 PWA and Offline
- Installable PWA via manifest + service worker.
- Visible install CTA on the login page.
- Visible offline-entry CTA on the login page.
- Cached static assets and subject images for previously visited/offline use.
- Route-based app launch support such as `?view=qbank`, `?view=dashboard`, and offline/demo source params.

## 6. User Experience Requirements

### 6.1 Login
- Valid Firebase credentials must create a session and route to `index.html`.
- Demo credentials must always route successfully for QA flows.
- Failed login attempts must show a visible inline error and must not create a session.

### 6.2 Navigation
- Clicking a study subject card should open the corresponding subject practice flow.
- Exam and dashboard screens should be reachable without full-page reloads.
- PWA shortcuts and URL query params should deep-link into the right screen when possible.

### 6.3 Offline Experience
- Users should see a clear path to install the app.
- Users should see a clear path to open cached/local experience.
- If the app is launched offline with an allowed local/demo session, the shell should still load instead of forcing a redirect back to login.

## 7. Functional Requirements

### 7.1 Frontend
- SPA built with vanilla HTML, CSS, and JavaScript.
- Responsive RTL-first UI.
- Lucide icon rendering.
- Client-side state persistence using `localStorage`.

### 7.2 Backend and Data
- Firebase Auth for primary authentication.
- Firestore for persisted user state where available.
- AI endpoints exposed through:
  - `/api/ai-mentor`
  - `/api/extract-question-image`
  - `/api/generate-similar-questions`

### 7.3 Development and Deployment
- Local development via `node server.js`.
- Static hosting compatible with Firebase Hosting.
- Serverless API compatibility with Vercel.

## 8. Non-Functional Requirements
- **Performance**: fast first render, no build step required for local development.
- **Resilience**: core app shell should remain usable with cached assets and local session fallback.
- **Accessibility**: keyboard-usable buttons/cards and visible states for primary actions.
- **Responsiveness**: usable on desktop and mobile.
- **Security**: production auth remains Firebase-backed; demo path is explicitly intended for QA/testing.

## 9. Known Product Constraints
- The current product uses a mixed persistence model: local storage first, Firebase second.
- Onboarding is not yet a standalone multi-step guided flow; access currently lands users directly into the app shell/dashboard experience.
- Some social and AI flows are partially mocked or heuristic-based rather than fully real-time collaborative systems.

## 10. Near-Term Priorities
- Stabilize production login and post-login routing.
- Improve QA reliability for E2E test coverage.
- Expand offline-ready cached content beyond shell assets.
- Formalize onboarding if the product needs a distinct first-run experience.
- Document demo/QA behavior and production auth behavior separately.
