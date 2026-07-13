# Exam Bank — Development Roadmap

> **Status**: Pending Approval  
> Review the proposals below. Once you approve the features you want, a technical implementation plan will be generated with exact files to modify and the order of changes.

---

## 1. Grade Expansion (1st & 2nd Secondary)

The first priority is expanding the platform beyond 3rd Secondary to cover all high school grades, aligned with the **2026 Egyptian Baccalaureate system**.

### What needs to be built

**Grade & Pathway Selection Screen**
A welcome screen shown on first login (also accessible from settings) where the student selects:
- **Grade**: 1st Secondary, 2nd Secondary, or 3rd Secondary
- **Pathway** (for 2nd and 3rd only): Medicine & Life Sciences, Engineering & Computer Science, Business, or Arts & Humanities

**Dynamic Subject Filtering**
The dashboard only shows subjects relevant to the student's grade and pathway. For example, a 1st Secondary student won't see Geology or Statistics.

**Question Bank Schema Update**
Every question in the database gets two fields:
- `grade` — which grade the question belongs to
- `pathway` — which pathway (or `"all"` if shared across pathways)

**Exam Attempt History**
Students can sit official exams multiple times. All attempts are stored and accessible for review and progress tracking.

### Tech changes required
- `index.html` / `login.html` — Add grade & pathway selection modal on first login
- `app.js` — Save `grade` and `pathway` to `localStorage` and manage user state
- `server.js` (Node.js) — Add API endpoints to filter questions, exams, and analytics by `grade` and `pathway`
- Subject cards — Built dynamically via JS based on stored grade/pathway instead of hardcoded

---

## 2. Core Learning Features (Phase 2)

> These directly improve how students learn and should come before any engagement features.

### Exam Mode
A dedicated exam interface with: no sidebar, no hints, a countdown timer, and the ability to flag questions for review. This simulates the real exam environment.

### Post-Exam Review
After finishing an exam, the student sees every question they got wrong along with the correct answer and explanation. This is the most impactful learning feature on the platform.

### Advanced Question Filtering
Students can filter questions by:
- Exam year
- Source (textbook / past papers)
- Difficulty (Easy / Medium / Hard)

---

## 3. Retention & Engagement Features (Phase 3)

> These features bring students back daily and build habits.

### Daily Challenges
5 quick questions every day. Completing the challenge awards XP and maintains a daily streak. Missing a day resets the streak — a proven motivator.

### Spaced Repetition System
Questions the student answered incorrectly are automatically re-queued at increasing intervals (Day 1 → Day 3 → Day 7 → Day 14). This is the most evidence-backed study method and significantly outperforms passive re-reading.

### Leaderboards
Weekly and monthly rankings by grade, showing top students by XP. Filtered per grade so 1st Secondary students compete among themselves.

### Badge System
Virtual badges unlocked by achievements, such as:
- Solved 100 Physics questions
- Scored 100% on 5 exams
- Maintained a 7-day streak
- Completed every subject in a week

---

## 4. AI-Powered Features (Phase 4)

> These add the most "wow factor" but require a solid data foundation first (phases 1–3).

### Weakness Detection
The system analyzes the student's wrong answers across sessions and identifies which chapters or topics they consistently struggle with. It then generates a custom quiz targeting exactly those weak points.

### AI Mock Exams
A single button that generates a full exam matching the official end-of-year format — randomized questions at a progressively increasing difficulty level. Built using the existing question bank, structured by the AI.

---

## 5. Social & Productivity Features (Phase 5)

> Nice-to-have. Build last after the core platform is solid.

### Study Groups — Competitive Mode
Groups can start a shared exam at the same time. All members see each other's scores at the end, turning studying into a group activity.

### Pomodoro Timer
A built-in focus timer (25 min study / 5 min break) with optional ambient sounds (lofi / white noise).

---

## Recommended Implementation Order

| Phase | Focus | Priority |
|-------|-------|----------|
| **1** | Grade expansion + Dynamic subjects (Baccalaureate pathways) | 🔴 Start here |
| **2** | Exam Mode + Post-Exam Review + Filtering | 🔴 Core value |
| **3** | Daily Challenges + Spaced Repetition + Gamification | 🟠 Retention |
| **4** | AI Weakness Detection + AI Mock Exams | 🟡 Growth |
| **5** | Study Groups + Pomodoro Timer | 🟢 Nice to have |
