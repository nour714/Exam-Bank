# Product Requirements Document (PRD)

## 1. Project Overview
**Product Name:** Exam-Bank AI Mentor
**Description:** An AI-powered educational platform and Progressive Web App (PWA) designed to assist students in studying for exams. It features interactive AI mentorship, question extraction from images (OCR), and dynamic generation of similar practice questions.

## 2. Target Audience
- Students needing interactive study assistance and practice materials.
- Educators looking to digitize exam questions and generate variations.

## 3. Core Features
- **User Authentication:** Secure login and registration functionality.
- **AI Mentor:** A conversational AI assistant to help users solve problems and explain concepts.
- **Question Extraction (OCR):** Ability to upload images of exam questions and automatically extract the text/data.
- **Similar Question Generation:** AI-driven capability to generate related questions based on existing ones to provide extra practice.
- **PWA Capabilities:** 
  - Installable application for desktop and mobile.
  - Offline mode with caching via Service Workers.
  - Push notifications with custom badges and sound effects.
- **Subject Categorization:** Organized subjects with dedicated thumbnails and categorization.

## 4. Technical Architecture
### Frontend
- **Framework:** Single Page Application (SPA) using HTML, CSS, and Vanilla JavaScript.
- **PWA Assets:** `manifest.json`, `service-worker.js` (at root for global scope), and icons (`icon-192.svg`, `badge-72.svg`).

### Backend & API
- **Local / Self-hosted Environment:** Node.js Express server (`server.js`) with Prisma ORM and Socket.io for real-time functionality.
- **Serverless Environments:**
  - **Vercel Functions:** Serverless endpoints in `api/` directory (e.g., `ai-mentor.js`, `extract-question-image.js`).
  - **Firebase:** Functions integrated via `firebase.json` routing, with Firestore security rules (`firestore.rules`) for database operations.
- **AI Logic:** Shared AI processing library (`lib/ai-api.js`) utilized by both local and serverless deployments.

## 5. Non-Functional Requirements
- **Reliability:** Service worker implementation ensures core functionalities are accessible offline or in low-network conditions.
- **Scalability:** Support for multiple deployment environments (Vercel, Firebase) allowing the app to scale serverless compute easily.
- **Security:** Robust authentication with JWT/bcrypt, coupled with strict Firestore rules for secure database access.

## 6. Future Enhancements
- Expanded subject coverage.
- Enhanced analytics on user performance and AI interactions.
- Collaborative study rooms using real-time sockets.
