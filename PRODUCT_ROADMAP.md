# Exam Bank — Product Roadmap

## Phase 1: Project Foundation ✅
- Project scaffolding and folder structure
- Express server setup with middleware chains
- Database configuration (Prisma ORM)
- Environment configuration management
- Logger, error handling, and shared utilities

## Phase 2: Authentication & Authorization ✅
- User registration and login
- JWT access tokens (in-memory) + refresh tokens (HTTP-only cookies)
- Token rotation with replay attack detection
- Account lockout after failed attempts
- Session management (multi-device)
- Role-based access control (RBAC)
- Audit logging

## Phase 3: Enterprise Architecture ✅
- Platform abstractions (AI, OCR, Storage, Payments, Notifications, Search)
- Queue system (BullMQ) with worker infrastructure
- Scheduler for recurring jobs
- Reliability layer (circuit breaker, retry, rate limiter)
- WebSocket real-time client
- Frontend core infrastructure:
  - BaseComponent, Router, EventBus, StateStore
  - QueryCache, RequestManager, StateMachine
  - ErrorBoundary, WidgetRegistry, UI Guards
  - Dashboard with widget-based architecture

## Phase 4: Question Bank ✅ *(v1.1.0-question-bank)*
- Curriculum hierarchy (Subjects → Units → Lessons)
- HierarchyBrowser with optimistic navigation and prefetching
- Question Browser with cursor-based pagination
- FilterEngine, SortEngine, SelectionManager, CriteriaBuilder
- URL state synchronization and deep linking
- Question Preview (drawer with progressive loading)
- Question Details (full page with metadata and analytics)
- Question CRUD (Create, Edit, Duplicate, Soft Delete, Restore, Permanent Delete)
- Question Editor with draft autosave and unsaved changes detection
- AI Question Generation (provider-independent, async workflow, review before save)
- Observability tracking for AI generation (duration, tokens, cost, model)

## Phase 5: Exam Builder *(Planned)*
- Exam creation workflow
- Question selection from Question Bank
- Manual and AI-assisted exam assembly
- Exam templates and blueprints
- Print and export support

## Phase 6: Student Experience *(Planned)*
- Student exam-taking interface
- Timer and auto-submit
- Answer review
- Score calculation and grading

## Phase 7: Analytics & Reporting *(Planned)*
- Question performance analytics
- Student performance dashboards
- Class-level reports
- Item analysis (discrimination index, difficulty index)
