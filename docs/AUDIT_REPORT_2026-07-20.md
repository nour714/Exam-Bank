# Repository Audit Report — Post Architecture Freeze

**Audit Date:** 2026-07-20  
**Architecture Freeze Commit:** `b0149c8`  
**Commits Audited:** 4 (28933c5, 1ae318f, 74e5975, aaf208f)  
**Files Changed Since Freeze:** 120 files, +24,052 / -469 lines

---

## Executive Summary

The audit identified **13 critical/high-severity bugs** and **7 medium/low-severity issues** in the post-freeze code. The most severe was a **broken Prisma schema** that prevented the backend from starting (13 validation errors). All critical and high-severity issues have been fixed. Tests pass. The application loads successfully.

---

## Issues Found & Fixes Applied

### CRITICAL: Prisma Schema Validation Errors (13 errors)

**Root Cause:** The `Tenant` model was missing reverse relation fields for 9 child models (Curriculum, Subject, Question, Exam, ExamAttempt, TenantSubscription, TenantPlugin, WebhookEndpoint, StudyGroup). Additionally, Exam, User, and Question models were missing reverse relations for ExamAttempt, StudyGroupMember, and ExamAnswer respectively.

**Impact:** `prisma generate` failed completely. The backend could not start.

**Fix:** Added all missing reverse relation fields to the Tenant model and other affected models in `prisma/schema.prisma`.

---

### CRITICAL: `require()` in ES Module Context

**File:** `frontend/src/pages/question-bank/components/hierarchy-browser.js:44`

**Root Cause:** Used CommonJS `require()` inside an ES module file. The browser throws `ReferenceError: require is not defined`.

**Impact:** EventBus listener for live background refreshes never binds. Question bank hierarchy won't auto-refresh.

**Fix:** Replaced `require()` with proper ES module `import` at the top of the file.

---

### CRITICAL: `window.router` Undefined (5 crash sites)

**Files:** questions.js, question-details.js, question-preview.js

**Root Cause:** Multiple files reference `window.router.navigate()` but `window.router` was never assigned. The router exists only as an ES module import.

**Impact:** All navigation from question bank pages (Add, Edit, Duplicate, View Details) crashes with `TypeError: Cannot read properties of undefined`.

**Fix:** Added `window.router = router` in `frontend/src/app.js` after `router.start()`.

---

### CRITICAL: Wrong Import Path in `question.api.provider.js`

**File:** `frontend/src/services/providers/question.api.provider.js:1`

**Root Cause:** Imported from `../http/api.js` which doesn't exist. Actual file is `../http/api-client.js`.

**Impact:** Switching to API provider (from mock) would fail immediately.

**Fix:** Changed import path to `../http/api-client.js`.

---

### CRITICAL: Wrong Import Paths in `breadcrumb.js`

**File:** `frontend/src/design-system/components/navigation/breadcrumb.js:1-2`

**Root Cause:** Import paths used `../../core/` but the file is 3 levels deep in `design-system/components/navigation/`. Should be `../../../core/`.

**Impact:** Breadcrumb navigation breaks on all question bank pages.

**Fix:** Corrected both import paths to use `../../../core/`.

---

### CRITICAL: `stateMachine.currentState` Property Doesn't Exist

**File:** `frontend/src/pages/question-bank/questions.js:282`

**Root Cause:** StateMachine exposes `.state`, not `.currentState`. Accessing `.currentState` returns `undefined`.

**Impact:** Question browser renders blank content area on initial load.

**Fix:** Changed to `this.stateMachine.state`.

---

### HIGH: `props.routeParams` Mismatch (2 files)

**Files:** question-editor.js:15, question-details.js:13

**Root Cause:** Router passes route params directly as `{ id: 'someId' }`, not wrapped in `{ routeParams: { id: '...' } }`.

**Impact:** Question editor and details pages crash on load with `TypeError`.

**Fix:** Changed `props.routeParams.id` to `props.id` in both files.

---

### HIGH: `super.unmount()` Doesn't Exist (2 files)

**Files:** question-editor.js:72, ai-generator-modal.js:54

**Root Cause:** BaseComponent has `destroy()` not `unmount()`. Calling `super.unmount()` throws TypeError.

**Impact:** Question editor leaks beforeunload handler and autosave timer. AI modal leaks EventBus listeners.

**Fix:** Renamed `unmount()` to `destroy()` and changed `super.unmount()` to `super.destroy()`.

---

### HIGH: Auth Token Read from `localStorage` Instead of `TokenManager` (2 locations)

**Files:** upload.interceptor.js:43, api-client.js:122

**Root Cause:** Architecture uses in-memory TokenManager for JWT storage, but these files read from `localStorage.getItem('access_token')` where no token is ever stored.

**Impact:** File uploads and downloads always sent without authentication.

**Fix:** Imported TokenManager and used `TokenManager.getToken()` instead.

---

### MEDIUM: Sidebar Route Mismatch

**File:** `frontend/src/design-system/components/layout/sidebar.js:46`

**Root Cause:** Sidebar had `data-route="/qbank"` but router registers `/question-bank`.

**Impact:** Clicking Question Bank in sidebar navigates to 404.

**Fix:** Changed to `data-route="/question-bank"`.

---

### LOW: Duplicate Comment Numbering in app.js

**File:** `frontend/src/app.js:120-123`

**Root Cause:** Two step-6 comments ("Start router" and "Register Service Worker").

**Fix:** Renumbered to 6 and 7.

---

### LOW: Unused Import in error-boundary.js

**File:** `frontend/src/core/error-boundary.js:2`

**Root Cause:** `measure` from observability.js was imported but usage was commented out.

**Fix:** Removed unused import.

---

## Remaining Risks

### Medium Risk

1. **XSS via unescaped HTML** — Question content is inserted into `innerHTML` without escaping in multiple question bank files. Malicious question content could execute JavaScript. Recommend implementing an HTML escape utility.

2. **Sidebar/Header subscription in render()** — Store subscriptions are created inside `render()` which can be called multiple times. While these components don't currently re-render, this is fragile. Recommend moving subscriptions to `mount()`.

3. **No database migrations** — Project uses `prisma db push` for schema sync. No migration files exist. This makes schema rollback impossible.

4. **Minimal test coverage** — Only 2 test files exist (health.test.js, event.bus.test.js). No tests for any business module. 90.5% statement coverage is misleading (only covers logger, config, events).

### Low Risk

5. **Mock providers only** — All frontend services use mock providers. No real API integration tested.

6. **StateStore.resetAll() bypasses Proxy** — Directly modifies `this._state` and clears all subscribers without notification.

7. **Search box focus loss** — Search input loses focus on debounce re-render when parent re-renders.

---

## Verification Evidence

| Check | Result | Evidence |
|-------|--------|----------|
| `npm install` | PASS | 0 vulnerabilities, 516 packages |
| `prisma generate` | PASS | Generated to node_modules/@prisma/client |
| `npm test` | PASS | 2 suites, 3 tests, all pass |
| App module loads | PASS | `require('./src/app')` succeeds |
| Frontend routes | PASS | All routes registered, files exist |
| Provider injection | PASS | All 4 providers injected correctly |

---

## Production Readiness Assessment

### Ready for Development: YES
### Ready for Staging: CONDITIONAL
- Fix remaining XSS issues before any user-facing deployment
- Add database migrations
- Integrate real API providers
- Add authentication flow tests

### Ready for Production: NO
- Requires comprehensive test suite
- Requires real API provider integration
- Requires database migration strategy
- Requires security audit for XSS/injection vectors
- Requires load testing

---

## Files Modified (14 files)

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Added 11 missing reverse relation fields |
| `frontend/src/app.js` | Added `window.router = router`, fixed comment numbering |
| `frontend/src/core/error-boundary.js` | Removed unused import |
| `frontend/src/design-system/components/layout/sidebar.js` | Fixed route `/qbank` → `/question-bank` |
| `frontend/src/design-system/components/navigation/breadcrumb.js` | Fixed import paths (2 fixes) |
| `frontend/src/pages/question-bank/components/browser/ai-generator-modal.js` | Renamed `unmount()` → `destroy()` |
| `frontend/src/pages/question-bank/components/hierarchy-browser.js` | Replaced `require()` with ES import |
| `frontend/src/pages/question-bank/question-details.js` | Fixed `props.routeParams.id` → `props.id` |
| `frontend/src/pages/question-bank/question-editor.js` | Fixed `props.routeParams.id`, renamed `unmount()` → `destroy()` |
| `frontend/src/pages/question-bank/questions.js` | Fixed `stateMachine.currentState` → `.state` |
| `frontend/src/services/http/api-client.js` | Fixed download auth to use TokenManager |
| `frontend/src/services/http/upload.interceptor.js` | Fixed upload auth to use TokenManager |
| `frontend/src/services/providers/question.api.provider.js` | Fixed import path |
