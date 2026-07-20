# Legacy-UI Migration Audit Report

**Audit Date:** 2026-07-20  
**Legacy Source:** `frontend/legacy-ui/` (3 HTML + 3 JS + 2 CSS + 1 data + 18 images)  
**Target:** `frontend/src/` (SPA) + `frontend/public/index.html`

---

## Executive Summary

| Metric | Count |
|--------|-------|
| **Total Features Audited** | 157 |
| **Fully Migrated** | 23 (15%) |
| **Partially Migrated** | 27 (17%) |
| **Not Migrated** | 107 (68%) |

The SPA has migrated the core authentication flow, dashboard widgets, question bank hierarchy, and basic layout shell. **Four entire views are completely missing**: Exams, Study Groups, Settings, and Admin Panel. The login page is missing registration and forgot-password flows. The admin panel (PDF/image AI extraction, bulk question management) has zero SPA counterpart.

---

## Per-File Breakdown

### `frontend/legacy-ui/index.html` (1768 lines)

#### Global Shell

| Feature | Status | Notes |
|---------|--------|-------|
| Animated Background (mesh, aurora, 6 orbs, particles, stars) | **NOT MIGRATED** | SPA shell has no animated background |
| App Skeleton Loading Screen (elaborate multi-row layout) | **PARTIAL** | SPA has basic spinner only |
| Dark Mode Init (localStorage pre-render flash prevention) | **PARTIAL** | SPA uses CSS classes, no flash prevention |

#### Sidebar Navigation

| Feature | Status | SPA File |
|---------|--------|----------|
| Sidebar Shell (brand logo + name) | **FULL** | `sidebar.js` |
| User Profile Widget (avatar, name, role badge) | **FULL** | `sidebar.js` |
| Home Menu Item | **PARTIAL** | Maps to `/dashboard`, no separate home view |
| Progress/Dashboard Menu Item | **FULL** | `sidebar.js`, `dashboard.js` |
| Question Bank Menu Item | **FULL** | `sidebar.js`, `subjects.js` |
| Exams Menu Item | **NOT MIGRATED** | Link exists but no route/page |
| Study Groups Menu Item | **NOT MIGRATED** | Link exists but no route/page |
| Settings Menu Item | **NOT MIGRATED** | Link exists but no route/page |
| Admin Panel Menu Item | **NOT MIGRATED** | Link exists but no route/page |
| Logout Button | **FULL** | `sidebar.js` |
| Mobile Sidebar Overlay | **PARTIAL** | CSS-based, no dedicated overlay div |

#### Header

| Feature | Status | SPA File |
|---------|--------|----------|
| Hamburger Menu Toggle | **FULL** | `header.js` |
| Mobile Header Logo | **FULL** | `header.js` |
| Global Search Bar | **FULL** | `header.js` |
| Notification Bell Icon | **PARTIAL** | Badge is static |
| Notification Dropdown (items, clear, timestamps) | **NOT MIGRATED** | No dropdown panel |

#### Home View (الرئيسية)

| Feature | Status | Notes |
|---------|--------|-------|
| Hero Banner (title, subtitle, SVG illustration) | **NOT MIGRATED** | No home/landing view in SPA |
| CTA: "ابدأ المذاكرة" | **PARTIAL** | Dashboard QuickActions has equivalent |
| CTA: "حل امتحان الآن" | **PARTIAL** | QuickActions has "اختبار جديد" |
| Features Section (3 feature cards) | **NOT MIGRATED** | No feature showcase |
| Subjects Showcase (9 subject mini-cards) | **PARTIAL** | `subjects.js` uses HierarchyBrowser |

#### Dashboard View (تقدمي)

| Feature | Status | SPA File |
|---------|--------|----------|
| Welcome Header (greeting + username) | **FULL** | `welcome-card.js` |
| "اسأل المعلم الذكي" Button | **NOT MIGRATED** | No AI mentor chat |
| XP Points Stat | **NOT MIGRATED** | SPA shows "Completed Exams" |
| Questions Solved Stat | **NOT MIGRATED** | SPA shows "Average Score" |
| Study Streak Stat | **FULL** | `stats-row.js` |
| Accuracy Circular Progress Ring | **NOT MIGRATED** | SPA has flat stat card |
| Weekly Activity Bar Chart | **PARTIAL** | SPA has line chart, not bar |
| Chart Legend | **NOT MIGRATED** | N/A |
| Subjects Strength Column (progress bars) | **NOT MIGRATED** | No per-subject strength widget |
| Quick Actions (3 actions) | **PARTIAL** | SPA has 4 different actions |

#### Question Bank View

| Feature | Status | SPA File |
|---------|--------|----------|
| View Header (breadcrumb, title, add button) | **FULL** | `layout.js` |
| Grade Badge ("الصف الثالث الثانوي") | **NOT MIGRATED** | N/A |
| Category Filter (scientific/literary tracks) | **NOT MIGRATED** | N/A |
| Subject Search Input | **PARTIAL** | SearchBox searches questions |
| Subject Cards Grid (9 cards with images) | **PARTIAL** | HierarchyBrowser, no images |
| Subject Card Images | **NOT MIGRATED** | No subject images in SPA |

#### Exams View

| Feature | Status |
|---------|--------|
| Exams Header | **NOT MIGRATED** |
| Exam Intro Banner | **NOT MIGRATED** |
| Exam Cards Grid (9 subject exams) | **NOT MIGRATED** |

#### Study Groups View

| Feature | Status |
|---------|--------|
| Groups Header + Create Button | **NOT MIGRATED** |
| Groups Filter/Tag Buttons | **NOT MIGRATED** |
| Groups Search Input | **NOT MIGRATED** |
| Groups Grid | **NOT MIGRATED** |

#### Settings View

| Feature | Status |
|---------|--------|
| Settings Header | **NOT MIGRATED** |
| Profile Section (avatar, name, email) | **NOT MIGRATED** |
| Grade & Pathway Selectors | **NOT MIGRATED** |
| Dark Mode Toggle | **NOT MIGRATED** |
| Email Notifications Toggle | **NOT MIGRATED** |
| Save Settings Button | **NOT MIGRATED** |

#### Exam Interactive View

| Feature | Status |
|---------|--------|
| Exam Header (timer, exit) | **NOT MIGRATED** |
| Questions Navigation Sidebar (progress, grid map) | **NOT MIGRATED** |
| Question Pane (number, badge, text) | **NOT MIGRATED** |
| Circuit SVG Diagram | **NOT MIGRATED** |
| MCQ Options (Arabic letters) | **NOT MIGRATED** |
| Prev/Next Navigation Buttons | **NOT MIGRATED** |

#### Modals

| Feature | Status | Notes |
|---------|--------|-------|
| Setup Grade & Pathway Modal | **NOT MIGRATED** | |
| Create Study Group Modal | **NOT MIGRATED** | |
| Exam Attempts History Modal | **NOT MIGRATED** | |
| Exam Results Modal | **NOT MIGRATED** | |
| Study Group Chat Modal | **NOT MIGRATED** | |
| AI Mentor Chat Modal | **NOT MIGRATED** | SPA has AI Generator, different feature |
| Study Notes Modal | **NOT MIGRATED** | No notes feature |
| Custom Question Creation | **MIGRATED** | As full page in `question-editor.js` |
| Custom Confirmation Modal | **PARTIAL** | SPA uses native `confirm()` |
| AI Review Modal (Explain + Similar) | **NOT MIGRATED** | |

#### Mobile Bottom Navigation

| Feature | Status |
|---------|--------|
| Bottom Nav (5 tabs) | **NOT MIGRATED** |
| More Menu (popup with settings, groups, admin) | **NOT MIGRATED** |
| Mobile Profile Picture Sync | **NOT MIGRATED** |
| More Menu Toggle Logic | **NOT MIGRATED** |
| Mobile Logout Handler | **NOT MIGRATED** |

#### Infrastructure

| Feature | Status | SPA File |
|---------|--------|----------|
| Sound Effects Module | **NOT MIGRATED** | |
| Service Worker + Auto-update | **PARTIAL** | `app.js` has basic registration only |
| Socket.io → WebSocket | **MIGRATED** | `ws-client.js` |
| Lucide Icons | **FULL** | `public/index.html` |
| Google Fonts (Tajawal) | **FULL** | `public/index.html` |
| PWA Manifest & Meta | **FULL** | `public/index.html` |

---

### `frontend/legacy-ui/login.html` (575 lines)

| Feature | Status | SPA File |
|---------|--------|----------|
| Dynamic Particles Background | **NOT MIGRATED** | SPA has static CSS particles |
| Glow Orbs | **FULL** | `auth-layout.js` |
| Toast Container | **FULL** | `toast.js` |
| Branding Panel (logo, headline, stats, features) | **NOT MIGRATED** | SPA is centered card layout |
| Brand Logo SVG (gradient) | **PARTIAL** | `auth-card.js` uses shield icon |
| Brand Headline | **NOT MIGRATED** | |
| Stats Pills (+5000, 9, AI) | **NOT MIGRATED** | |
| Feature List (4 items) | **NOT MIGRATED** | |
| Mobile Logo | **NOT MIGRATED** | |
| Login/Register Tab Switcher | **NOT MIGRATED** | SPA has login only |
| PWA Install Button | **NOT MIGRATED** | |
| Login Email Field | **FULL** | `login.js`, `form-field.js` |
| Login Password Field (eye toggle) | **FULL** | `password-field.js` |
| Remember Me Checkbox | **FULL** | `remember-me.js` |
| Forgot Password Link | **PARTIAL** | Button exists, no `/forgot-password` route |
| Login Submit Button (spinner) | **FULL** | `loading-button.js` |
| Register Form (name, email, password, confirm) | **NOT MIGRATED** | No register page |
| Password Strength Meter | **NOT MIGRATED** | |
| Forgot Password Form | **NOT MIGRATED** | No route |
| Demo Account Login | **NOT MIGRATED** | SPA uses real API only |
| API Login | **FULL** | `auth.service.js` |
| API Register | **NOT MIGRATED** | |
| API Forgot Password | **NOT MIGRATED** | |
| Session Persistence | **PARTIAL** | Different localStorage keys |
| Service Worker Registration | **FULL** | `app.js` |
| PWA beforeinstallprompt | **NOT MIGRATED** | |
| Password Eye Toggle Logic | **FULL** | `password-field.js` |
| Tab Switch Logic | **NOT MIGRATED** | |
| Password Strength Logic | **NOT MIGRATED** | |
| Remember Me Pre-fill | **PARTIAL** | No localStorage restore |

---

### `frontend/legacy-ui/admin.html` (1587 lines)

**Status: NOT MIGRATED** — The entire admin panel has no SPA equivalent.

| Feature | Status |
|---------|--------|
| Admin Login/Permission Check | **NOT MIGRATED** |
| Admin Header (Firebase status, ADMIN badge) | **NOT MIGRATED** |
| Tab Navigation (Extract / Manage) | **NOT MIGRATED** |
| Stats Bar (5 cards) | **NOT MIGRATED** |
| File Upload Zone (drag-drop, multi-file) | **NOT MIGRATED** |
| PDF.js Integration | **NOT MIGRATED** |
| Image Compression (scale + JPEG) | **NOT MIGRATED** |
| Control Buttons (Extract, Add All, Export, Clear) | **NOT MIGRATED** |
| Progress Wrapper | **NOT MIGRATED** |
| Pages List (thumbnails, status badges) | **NOT MIGRATED** |
| Page Card Rendering | **NOT MIGRATED** |
| Question Table (options grid, correct highlight) | **NOT MIGRATED** |
| Gemini Vision API Integration | **NOT MIGRATED** |
| Gemini Diagram Detection | **NOT MIGRATED** |
| Concurrent API Calls (Groq + Gemini) | **NOT MIGRATED** |
| Diagram Cropping | **NOT MIGRATED** |
| Duplicate Detection | **NOT MIGRATED** |
| Bulk Add to Server | **NOT MIGRATED** |
| localStorage Backup | **NOT MIGRATED** |
| Lightbox (full-screen zoom) | **NOT MIGRATED** |
| JSON Export Modal | **NOT MIGRATED** |
| Toast Notifications | **PARTIAL** | `toast.js` exists but admin-specific notifications N/A |
| Admin Role Verification | **PARTIAL** | `authService.hasRole()` exists, no admin page |
| Server Manager: Subject Cards | **NOT MIGRATED** |
| Server Manager: Question List | **NOT MIGRATED** |
| Delete Single Question (admin) | **PARTIAL** | `question-preview.js` has delete, not admin bulk |
| Delete All Questions for Subject | **NOT MIGRATED** |
| Manual Crop Modal | **NOT MIGRATED** |
| Edit Question Modal (admin quick-edit) | **PARTIAL** | `question-editor.js` is full page, not modal |
| Bulk Save API | **NOT MIGRATED** |
| Bulk Delete API | **NOT MIGRATED** |
| Tab Switching Logic | **NOT MIGRATED** |

---

### `frontend/legacy-ui/assets/js/app.js` (3396 lines)

| Feature | Status | Notes |
|---------|--------|-------|
| Firebase Auth Session Management | **NOT MIGRATED** | SPA uses JWT + custom backend |
| Admin Email Whitelist Check | **NOT MIGRATED** | SPA has role-based guards |
| Offline Session Handling | **PARTIAL** | SPA has offline event listener |
| Lucide Icons Init | **FULL** | SPA initializes Lucide |
| Dark Mode Toggle | **NOT MIGRATED** | No settings page |
| Sidebar Navigation (view switching) | **MIGRATED** | SPA uses router |
| Home View Rendering | **NOT MIGRATED** | No home view |
| Dashboard View Rendering | **PARTIAL** | Widget-based SPA is different architecture |
| Question Bank View Rendering | **PARTIAL** | HierarchyBrowser replaces card grid |
| Exam View Rendering | **NOT MIGRATED** | No exam page |
| Groups View Rendering | **NOT MIGRATED** | No groups page |
| Settings View Rendering | **NOT MIGRATED** | No settings page |
| Exam Timer Logic (countdown, auto-submit) | **NOT MIGRATED** | No exam-taking interface |
| Question Navigation (prev/next/grid map) | **NOT MIGRATED** | |
| Answer Selection & Auto-save | **NOT MIGRATED** | |
| Exam Results Calculation & Display | **NOT MIGRATED** | |
| Notification Dropdown Logic | **NOT MIGRATED** | |
| Global Search Logic | **PARTIAL** | Header has search input, no logic |
| AI Mentor Chat Integration | **NOT MIGRATED** | |
| Study Notes CRUD | **NOT MIGRATED** | |
| Study Group Chat | **NOT MIGRATED** | |
| Setup Modal (grade/pathway) | **NOT MIGRATED** | |
| PWA Install Prompt | **NOT MIGRATED** | |
| Service Worker Auto-update | **PARTIAL** | Basic registration only |

---

### `frontend/legacy-ui/assets/js/api-client.js` (180 lines)

| Feature | Status | SPA File |
|---------|--------|----------|
| API Base URL Config | **FULL** | `api-client.js` |
| GET/POST/PUT/DELETE Wrappers | **FULL** | `api-client.js` |
| Auth Token Injection | **FULL** | `auth.interceptor.js` |
| Error Interceptor | **FULL** | `error.interceptor.js` |
| Firebase Backend Import | **NOT MIGRATED** | SPA uses JWT backend |
| Demo Mode Bypass | **NOT MIGRATED** | SPA uses real API only |

---

### `frontend/legacy-ui/assets/js/sound-effects.js` (324 lines)

| Feature | Status |
|---------|--------|
| Sound Effects (correct, wrong, complete, click, achievement) | **NOT MIGRATED** |

---

### `frontend/legacy-ui/assets/css/style.css` (5845 lines)

| Feature | Status | SPA Equivalent |
|---------|--------|----------------|
| CSS Variables (dark theme tokens) | **PARTIAL** | `theme.css` has different tokens |
| Animated Background Keyframes | **NOT MIGRATED** | N/A |
| Skeleton Loader Styles | **PARTIAL** | `skeleton-loader.js` has basic styles |
| Sidebar Styles | **PARTIAL** | `layout.css` + `sidebar.js` inline |
| Header Styles | **PARTIAL** | `layout.css` + `header.js` inline |
| Home View Styles (hero, features, subjects) | **NOT MIGRATED** | N/A |
| Dashboard Styles (stats, chart, quick actions) | **PARTIAL** | Widget-specific CSS |
| Question Bank Styles (cards, filters) | **PARTIAL** | `cards.css`, component-specific |
| Exam View Styles (timer, navigation, options) | **NOT MIGRATED** | N/A |
| Groups View Styles | **NOT MIGRATED** | N/A |
| Settings View Styles | **NOT MIGRATED** | N/A |
| Modal Styles (setup, group, results, chat, AI) | **NOT MIGRATED** | N/A |
| Mobile Bottom Nav Styles | **NOT MIGRATED** | N/A |
| Toast Styles | **FULL** | `components.css` |
| Utility Classes | **FULL** | `utilities.css` |
| Responsive Breakpoints | **PARTIAL** | Different breakpoints |
| Print Styles | **NOT MIGRATED** | N/A |

---

### `frontend/legacy-ui/assets/css/login.css` (491 lines)

| Feature | Status | SPA Equivalent |
|---------|--------|----------------|
| Login Page Layout (split panel) | **NOT MIGRATED** | SPA uses centered card |
| Branding Panel Styles | **NOT MIGRATED** | N/A |
| Form Panel Styles | **PARTIAL** | `auth-card.js` inline styles |
| Tab Switcher Styles | **NOT MIGRATED** | N/A |
| Input Field Styles | **FULL** | `form-field.js` |
| Password Strength Styles | **NOT MIGRATED** | N/A |
| Toast Styles | **FULL** | `components.css` |
| Glow Orb Animations | **FULL** | `auth-layout.js` |
| Particle Animations | **NOT MIGRATED** | N/A |
| Responsive Styles | **PARTIAL** | Different layout approach |

---

### `frontend/legacy-ui/assets/data/book-question-bank.js` (534 lines)

| Feature | Status | Notes |
|---------|--------|-------|
| Static Question Data (9 subjects, ~50 questions) | **NOT MIGRATED** | SPA uses mock providers with different data structure |

---

### `frontend/legacy-ui/assets/images/` (18 files)

| File | Status | Notes |
|------|--------|-------|
| `icon-192.png` | **NOT MIGRATED** | SPA uses SVG favicon |
| `icon-192.svg` | **NOT MIGRATED** | N/A |
| `icon-512.png` | **NOT MIGRATED** | N/A |
| `icon-512.svg` | **NOT MIGRATED** | N/A |
| `app-logo-192.png` | **NOT MIGRATED** | N/A |
| `app-logo-192.svg` | **NOT MIGRATED** | N/A |
| `app-logo-512.png` | **NOT MIGRATED** | N/A |
| `app-logo-512.svg` | **NOT MIGRATED** | N/A |
| `badge-72.svg` | **NOT MIGRATED** | N/A |
| `pwa-screenshot-desktop.svg` | **NOT MIGRATED** | N/A |
| `pwa-screenshot-mobile.svg` | **NOT MIGRATED** | N/A |
| `subjects/arabic.jpg` | **NOT MIGRATED** | Subject cards have no images |
| `subjects/biology.jpg` | **NOT MIGRATED** | N/A |
| `subjects/chemistry.jpg` | **NOT MIGRATED** | N/A |
| `subjects/english.jpg` | **NOT MIGRATED** | N/A |
| `subjects/geography.jpg` | **NOT MIGRATED** | N/A |
| `subjects/geology.jpg` | **NOT MIGRATED** | N/A |
| `subjects/history.jpg` | **NOT MIGRATED** | N/A |
| `subjects/math.jpg` | **NOT MIGRATED** | N/A |
| `subjects/physics.jpg` | **NOT MIGRATED** | N/A |

---

## Migration Gaps — Unreferenced Legacy Files

These legacy files exist but their functionality has **no counterpart** in the SPA:

| Legacy File | Lines | Unported Functionality |
|-------------|-------|----------------------|
| `admin.html` | 1587 | Entire admin panel: PDF/image upload, Gemini AI extraction, bulk question management, server manager |
| `assets/js/sound-effects.js` | 324 | All audio feedback (correct/wrong/completion/click/achievement sounds) |
| `assets/data/book-question-bank.js` | 534 | Static question bank data (9 subjects, ~50 questions with choices) |
| `assets/css/login.css` | 491 | Branding panel layout, split-panel design, tab switcher, particle animations |
| `assets/images/` (18 files) | — | All subject images, app icons, PWA screenshots |

---

## Critical Migration Gaps (Blocking Core Features)

### 1. Exams Feature (15+ sub-features)
No exam list, no exam-taking interface (timer, question map, navigation, answer selection, auto-save, results), no exam history.

### 2. Settings Page (6 features)
No profile editing, grade/pathway selection, dark mode toggle, notification preferences.

### 3. Study Groups (4 features)
No group listing, creation, filtering, real-time chat.

### 4. Admin Panel (31 features)
No PDF/image upload, no AI-powered question extraction (Gemini Vision), no bulk question management, no server manager.

### 5. Registration Flow
No register form, no password strength meter, no confirm password, no registration API call.

### 6. Forgot Password Flow
No forgot-password form, no reset API call. Route referenced in `remember-me.js` but never registered.

### 7. Home/Landing View
No hero banner, feature showcase, or subject grid for unauthenticated/home state.

### 8. Notification System
Bell icon exists but no dropdown, no notification items, no clear functionality.

### 9. Mobile Bottom Navigation
No mobile-optimized bottom tab bar with 5 tabs and "More" menu.

### 10. AI Mentor Chat
No conversational AI tutor interface (only question generator exists).

---

## Recommendation

The SPA has successfully migrated **15% of legacy features**. The remaining **85%** represents significant functional gaps. Before the legacy-ui can be deprecated, the following views must be built:

1. **Exams** (highest priority — core product feature)
2. **Registration + Forgot Password** (required for user onboarding)
3. **Settings** (required for profile management)
4. **Study Groups** (social learning feature)
5. **Admin Panel** (content management)
6. **Home/Landing View** (first impressions)
7. **Notifications** (engagement)
8. **Mobile Bottom Nav** (mobile UX)
9. **AI Mentor Chat** (differentiator)
