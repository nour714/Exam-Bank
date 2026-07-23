# PROJECT_MEMORY.md — Exam Bank Enterprise

> Comprehensive project documentation generated from complete repository analysis.
> Last updated: 2026-07-20

---

# Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Folder Structure](#folder-structure)
4. [Architecture](#architecture)
5. [Database](#database)
6. [API](#api)
7. [Features](#features)
8. [Business Logic](#business-logic)
9. [Security](#security)
10. [Testing](#testing)
11. [Environment Variables](#environment-variables)
12. [Scripts](#scripts)
13. [Dependencies](#dependencies)
14. [Release Notes](#release-notes)
15. [Roadmap](#roadmap)
16. [Technical Debt](#technical-debt)
17. [Improvements](#improvements)
19. [Current Project State](#current-project-state)
20. [Development Rules](#development-rules)
21. [AI Context](#ai-context)

---

# Project Overview

## Purpose

Exam Bank Enterprise is a comprehensive educational platform designed for Egyptian secondary school students (Thanaweya Amma). It provides AI-powered question management, exam building, exam taking, analytics, and collaboration tools. The platform is built as a multi-tenant SaaS application targeting educational institutions.

## Vision

To become the definitive exam preparation and management platform for Egyptian secondary education, combining AI-powered question generation with traditional pedagogy, enabling teachers to create exams efficiently and students to prepare effectively.

## Goals

- Provide a complete question bank management system with CRUD operations and AI generation
- Enable exam creation, taking, auto-grading, and analytics
- Support multi-tenant architecture for institutional deployment
- Deliver a modern, offline-capable PWA frontend in Arabic (RTL)
- Maintain enterprise-grade security, observability, and scalability
- Build a plugin ecosystem for extensibility

---

# Technology Stack

## Backend

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | v20+ |
| Framework | Express.js | ^5.2.1 |
| ORM | Prisma | ^5.22.0 |
| Database | PostgreSQL | 15 (Alpine) |
| Cache/Queue | Redis (ioredis) | ^5.11.1 |
| Job Queue | BullMQ | ^5.80.5 |
| Authentication | JWT (jsonwebtoken) | ^9.0.3 |
| Password Hashing | bcrypt | ^6.0.0 |
| Validation | Zod | ^4.4.3 |
| Logging | Pino + pino-http | ^10.3.1 / ^11.0.0 |
| Metrics | prom-client | ^15.1.3 |
| Security | Helmet | ^8.3.0 |
| Rate Limiting | express-rate-limit | ^8.6.0 |
| Scheduling | node-cron | ^4.6.0 |
| API Docs | swagger-ui-express + yamljs | ^5.0.1 / ^0.3.0 |
| Compression | compression | ^1.8.1 |
| Cookies | cookie-parser | ^1.4.7 |
| CORS | cors | ^2.8.6 |
| Env Config | dotenv | ^17.4.2 |

## Frontend

| Component | Technology |
|-----------|-----------|
| Framework | Vanilla JavaScript (ES Modules, no framework) |
| CSS | Custom CSS with utility classes (Tailwind-inspired) |
| Icons | Lucide Icons (v0.469.0) |
| Fonts | Tajawal (Arabic), Inter (English) |
| PWA | Service Worker + IndexedDB |
| State Management | Custom reactive Proxy-based StateStore |
| Routing | Custom SPA Router (History API) |

## Database

- **Primary**: PostgreSQL via Supabase (managed) + Prisma ORM
- **Cache**: Redis 7 for BullMQ, sessions, and caching
- **Client-Side**: IndexedDB for offline caching and sync queue

## Testing

| Component | Technology |
|-----------|-----------|
| Test Runner | Jest ^30.4.2 |
| HTTP Testing | Supertest ^7.2.2 |
| Coverage | Istanbul (v8 provider) |

## Deployment

| Component | Technology |
|-----------|-----------|
| Process Manager | PM2 (cluster mode) |
| Health Checks | HTTP liveness/readiness probes |

## Tools

| Tool | Purpose |
|------|---------|
| Prisma CLI | Database migrations and schema management |
| Nodemon | Development hot-reload |
| pino-pretty | Development log formatting |
| Swagger UI | API documentation (non-production) |

---

# Folder Structure

```
project_fixed/
├── .agents/                    # AI agent configuration and rules
│   └── AGENTS.md               # Architecture freeze rules for AI agents
├── .mimocode/                  # MiMoCode configuration
├── coverage/                   # Test coverage output
│   ├── clover.xml
│   ├── coverage-final.json
│   ├── lcov-report/
│   └── lcov.info
├── docs/                       # Project documentation
│   ├── PRODUCT_ROADMAP.md      # Product roadmap (business features)
│   └── operations/             # Operational documentation
│       ├── ARCHITECTURE.md     # Architecture overview
│       ├── DEPLOYMENT.md       # Deployment guide
│       ├── DISASTER_RECOVERY.md # DR plan
│       ├── LOCAL_DEVELOPMENT.md # Local dev guide
│       └── MONITORING.md       # Monitoring guide
├── frontend/                   # Frontend SPA (Vanilla JS)
│   ├── legacy-ui/              # Legacy HTML/CSS/JS pages (admin, login, index)
│   │   ├── admin.html
│   │   ├── index.html
│   │   ├── login.html
│   │   └── assets/             # CSS, JS, images, data files
│   ├── public/                 # Static files served by Express
│   │   ├── index.html          # Main SPA shell
│   │   ├── manifest.json       # PWA manifest
│   │   └── service-worker.js   # Service Worker for offline support
│   └── src/                    # SPA source code
│       ├── app.js              # Application bootstrap and route registration
│       ├── core/               # Core infrastructure (19 files)
│       ├── design-system/      # UI component library and CSS
│       ├── pages/              # Page components
│       └── services/           # Data services and HTTP layer
├── prisma/                     # Database schema
│   └── schema.prisma           # Complete Prisma schema (635 lines)
├── scripts/                    # Deployment scripts
│   └── start-prod.sh           # Production startup script
├── src/                        # Backend source code
│   ├── app.js                  # Express application setup
│   ├── docs/                   # API documentation
│   │   └── openapi.yaml        # OpenAPI 3.1 specification
│   ├── gateway/                # HTTP/WebSocket gateway layer
│   │   ├── index.js            # Request pipeline setup
│   │   └── websocket.js        # WebSocket gateway
│   ├── modules/                # Business modules (14 modules)
│   │   ├── analytics/
│   │   ├── auth/
│   │   ├── billing/
│   │   ├── curriculum/
│   │   ├── engine/
│   │   ├── exams/
│   │   ├── feature-flags/
│   │   ├── plugins/
│   │   ├── questions/
│   │   ├── settings/
│   │   ├── study-groups/
│   │   ├── tenant/
│   │   ├── users/
│   │   └── webhooks/
│   └── shared/                 # Shared infrastructure (15 subdirectories)
│       ├── config/
│       ├── constants/
│       ├── database/
│       ├── errors/
│       ├── events/
│       ├── i18n/
│       ├── logger/
│       ├── middlewares/
│       ├── platforms/
│       ├── queues/
│       ├── reliability/
│       ├── scheduler/
│       ├── security/
│       ├── validators/
│       └── workers/
├── tests/                      # Test suite
│   ├── api/                    # API integration tests
│   ├── helpers/                # Test utilities
│   ├── unit/                   # Unit tests
│   └── setup.js                # Jest global setup
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules

├── jest.config.js              # Jest configuration
├── package.json                # Node.js package manifest
├── PRODUCT_ROADMAP.md          # Root-level product roadmap
└── RELEASE_NOTES_v1.1.0.md    # Latest release notes
```

---

# Architecture

## Overview

Exam Bank is a **Modular Monolith** built for high scalability, fault tolerance, and multi-tenant isolation. It employs:

- **Command Query Responsibility Segregation (CQRS)**: Commands and Queries traverse different paths
- **Event-Driven Architecture**: Modules communicate via a centralized EventBus
- **Provider Abstraction Pattern**: External services (AI, Storage, Payments) are swappable
- **Plugin Architecture**: Extensible via sandboxed plugin runtime

## Request Lifecycle

```
Client Request
    │
    ▼
Gateway Layer (src/gateway/index.js)
    │  - Request ID / Correlation ID
    │  - Structured HTTP logging (pino-http)
    │  - Security headers (Helmet)
    │  - CORS
    │  - Body parsing & compression
    │  - i18n middleware
    │  - Tenant context extraction
    │
    ▼
Security Middleware (src/shared/middlewares/security.js)
    │  - Global rate limiting (1000 req/15min)
    │  - Helmet CSP directives
    │
    ▼
Metrics Middleware (src/shared/middlewares/metrics.js)
    │  - HTTP request duration histogram
    │
    ▼
Route Handler (src/app.js → apiRouter)
    │
    ▼
Module Router (e.g., auth.routes.js)
    │  - authenticate middleware (JWT verification)
    │  - authorize middleware (RBAC)
    │  - validate middleware (Zod schema)
    │
    ▼
Controller (e.g., auth.controller.js)
    │  - Extracts request data
    │  - Calls service
    │  - Formats HTTP response
    │
    ▼
Service (e.g., auth.service.js)
    │  - Business logic
    │  - Domain events (EventBus)
    │  - Audit logging
    │
    ▼
Repository (e.g., auth.repository.js)
    │  - Database operations (Prisma)
    │  - Data access patterns
    │
    ▼
Database (PostgreSQL via Prisma)
```

## Routing

All API routes are mounted under `/api/v1/`:

| Mount Point | Module | Auth Required |
|------------|--------|---------------|
| `/api/v1/auth` | Auth | Public + Protected |
| `/api/v1/users` | Users | Protected (Admin+) |
| `/api/v1/tenants` | Tenants | Protected (Admin+) |
| `/api/v1/curriculums` | Curriculum | Protected |
| `/api/v1/questions` | Questions | Protected |
| `/api/v1/exams` | Exams | Protected |
| `/api/v1/engine` | Engine | Protected |
| `/api/v1/analytics` | Analytics | Protected (Admin+) |
| `/api/v1/billing` | Billing | Protected (Admin+) |
| `/api/v1/plugins` | Plugins | Protected (Admin+) |
| `/api/v1/webhooks` | Webhooks | Protected (Admin+) |
| `/api/v1/study-groups` | Study Groups | Protected |
| `/api/v1/feature-flags` | Feature Flags | Public |
| `/api/v1/settings` | Settings | Public |

Health endpoints (no auth):
- `GET /health` — Basic health check
- `GET /health/liveness` — Kubernetes liveness probe
- `GET /health/readiness` — Kubernetes readiness probe
- `GET /metrics` — Prometheus metrics endpoint
- `GET /api-docs` — Swagger UI (non-production only)

## Controllers

Each module has a controller class (singleton) that:
1. Extracts and validates request data using Zod schemas
2. Delegates business logic to the service layer
3. Formats and returns HTTP responses
4. Contains NO business logic

## Services

Each module has a service class (singleton) that:
1. Contains all business logic
2. Calls repositories for data access
3. Publishes domain events via EventBus
4. Enforces business rules and validations
5. Handles cross-cutting concerns (audit, events)

## Repositories

Each module has a repository class (singleton) that:
1. Encapsulates all database operations via Prisma
2. Uses lazy-initialized Prisma client (singleton pattern)
3. Handles pagination, filtering, and data transformations
4. Contains NO business logic

## Database

- **ORM**: Prisma Client (singleton, lazy-initialized)
- **Query Logging**: All queries logged via Pino at debug level
- **Error Handling**: Prisma errors captured and logged
- **Connection**: Managed via `getPrismaClient()` / `disconnectPrisma()`

## Middleware

### Authentication (`src/shared/middlewares/authenticate.js`)
- Extracts JWT from `Authorization: Bearer <token>` header
- Verifies token signature and expiry
- Attaches decoded payload to `req.user` (userId, tenantId, roles)
- Overrides `req.tenantId` from token

### Authorization (`src/shared/middlewares/authorize.js`)
- **Role-Based**: `authorize('admin', 'super_admin')` — checks if user has at least one role
- **Permission-Based**: `requirePermission('questions', 'delete')` — placeholder for fine-grained checks
- Super admins bypass all permission checks

### Validation (`src/shared/validators/index.js`)
- `validate(schema)` — validates `req.body` against Zod schema
- `validateParams(schema)` — validates `req.params`
- `validateQuery(schema)` — validates `req.query`
- Returns structured error responses with field-level details

### Security (`src/shared/middlewares/security.js`)
- Helmet with CSP directives (self + unsafe-inline for SPA)
- Global rate limiting: 1000 requests per 15 minutes per IP
- Auth-specific rate limiting: 20 attempts per hour per IP

### Metrics (`src/shared/middlewares/metrics.js`)
- Prometheus client with default Node.js metrics
- Custom histogram: `exambank_http_request_duration_ms`
- Labels: method, route, status_code
- Buckets: 10, 50, 100, 250, 500, 1000, 2500, 5000ms

## Utilities

### Config (`src/shared/config/`)
- `ConfigProvider` class with `get()`, `getInt()`, `getBoolean()`, `hasConfig()`
- Loads from environment variables with defaults
- Designed for future integration with Vault/AWS Secrets Manager

### Constants (`src/shared/constants/`)
- `ROLES`: super_admin, admin, teacher, student, parent, moderator
- `LOGIN_STATUS`: success, failed_credentials, failed_locked, failed_inactive
- `MAX_LOGIN_ATTEMPTS`: 5
- `LOCKOUT_DURATION_MINUTES`: 15
- `AUDIT_ACTIONS`: create, update, delete, login, logout, password_change, role_assign, role_revoke

### Errors (`src/shared/errors/`)
- `AppError` (base, statusCode, isOperational)
- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)

### Logger (`src/shared/logger/`)
- Pino logger with configurable level
- pino-pretty in development, JSON in production
- HTTP request logger via pino-http
- Ignores /health and /metrics endpoints

### i18n (`src/shared/i18n/`)
- Supports Arabic (ar, default) and English (en)
- Middleware extracts locale from `Accept-Language` header
- `req.t(key, params)` helper for translations
- Dot-notation keys with `{{param}}` interpolation

### Validators (`src/shared/validators/`)
- Generic Zod validation middleware factories
- Returns structured error responses

## Shared Modules

### EventBus (`src/shared/events/`)
- Extends Node.js EventEmitter
- Max 50 listeners (enterprise scale)
- Publish/subscribe pattern with error logging
- Wraps handlers in try/catch for fault isolation
- Future: migration to Redis Streams or RabbitMQ

### Queues (`src/shared/queues/`)
- **QueueFactory**: Creates BullMQ queues with Redis connection
- **QueueRegistry**: Manages 10 named queues (AI, OCR, Notifications, Emails, Images, Search, Stats, Reports, Webhooks, Plugins)
- **QueueManager**: Business-facing API (`addJob`, `addRecurringJob`, `pauseQueue`, `resumeQueue`, `getMetrics`)
- **QueueEvents**: Maps BullMQ events to EventBus
- Default job options: 3 attempts, exponential backoff (2s), keep 100 completed / 500 failed

### Workers (`src/shared/workers/`)
- `BaseWorker` abstract class for background processing
- Enforces logging, metrics, error handling, graceful shutdown
- Children implement `processJob(job)`

### Scheduler (`src/shared/scheduler/`)
- Centralized cron scheduler using node-cron
- Uses distributed LockService for horizontal scaling
- Does NOT execute business logic — enqueues to BullMQ
- Scheduled tasks:
  - Daily reports (00:00)
  - Session cleanup (hourly)
  - Search reindexing (Sunday 02:00)
  - Billing sync (01:00)
  - Notification reminders (every 15 min)

### Reliability (`src/shared/reliability/`)
- `LockService`: Redis-based distributed lock
- Methods: `acquire()`, `release()`, `extend()`
- Uses Lua scripts for atomic operations
- Placeholder implementation (mock) — needs Redis integration

### Security (`src/shared/security/`)
- **JWT**: `generateAccessToken()`, `generateRefreshToken()`, `verifyAccessToken()`, `verifyRefreshToken()`, `parseDuration()`
- **Password**: `hashPassword()` (bcrypt, 12 salt rounds), `comparePassword()`
- Tokens include issuer ('exam-bank') and audience ('exam-bank-client')

## Platforms

### Provider Abstraction Pattern
All external services use a consistent pattern:
1. Abstract base provider class (interface)
2. Concrete provider implementations
3. Service class with provider registry
4. Config-driven provider instantiation at startup

### AI Platform (`src/shared/platforms/ai/`)
- **AIService**: Central façade for all LLM interactions
- **8 Providers**: OpenAI, Gemini, Anthropic, OpenRouter, Ollama, DeepSeek, Qwen, Mistral
- **Features**: Provider registry, fallback chain, streaming (AsyncGenerator), health checks, telemetry via EventBus
- Providers registered based on available API keys in config
- Business modules call `aiService.generateCompletion()` — never import providers directly

### Storage Platform (`src/shared/platforms/storage/`)
- **Providers**: Local, S3, R2, B2, MinIO
- Config-driven via `STORAGE_PROVIDER` env var
- Default: Local (fallback to R2 if configured)

### Notification Platform (`src/shared/platforms/notification/`)
- **Channels**: In-App, Email, Push, SMS
- **TemplateEngine**: Resolves template IDs to content
- Fan-out support via `sendBulk()`
- Delivery tracking via EventBus

### Payment Platform (`src/shared/platforms/payments/`)
- **Providers**: Stripe, PayPal, Paddle, LemonSqueezy
- Config-driven via API keys
- Default: Stripe (fallback if nothing configured)

### OCR Platform (`src/shared/platforms/ocr/`)
- **Providers**: Azure Vision, EasyOCR, Google Vision, Tesseract

### Search Platform (`src/shared/platforms/search/`)
- **Providers**: Elasticsearch, Meilisearch, PostgreSQL (full-text)

## Frontend Architecture

### Overview
The frontend is a **zero-framework Vanilla JavaScript SPA** with ES modules, lazy loading, and offline PWA support.

### Core Infrastructure (`frontend/src/core/`)

| File | Purpose |
|------|---------|
| `component.js` | BaseComponent class — lifecycle management (render, mount, update, destroy), child registration, cleanup, DOM event auto-cleanup |
| `router.js` | SPA Router — History API, route params, guards, lazy loading via ModuleLoader |
| `event-bus.js` | Frontend pub/sub — on/once/off/emit, returns unsubscribe functions |
| `state-store.js` | Reactive state via Proxy — per-key subscriptions, merged with EventBus |
| `state-machine.js` | UI state machine — loading, ready, empty, error, offline |
| `query-cache.js` | TTL-based cache with stale detection |
| `request-manager.js` | Request deduplication and cancellation via AbortController |
| `filter-engine.js` | Generic filter state management with schema, subscribers |
| `sort-engine.js` | Generic sort state management |
| `selection-manager.js` | Multi/single selection tracking |
| `criteria-builder.js` | Backend-agnostic search request builder, URL sync, Saved Views |
| `error-boundary.js` | Wraps child components, catches errors, shows fallback UI |
| `guards.js` | Route guards: ProtectedRoute, GuestOnlyRoute |
| `ui-guards.js` | UI-level permission guards for conditional rendering |
| `module-loader.js` | Lazy-loads page modules with caching |
| `observability.js` | Performance metrics: render timing, API timing, cache hit ratio |
| `validation.js` | Client-side validators (email, password, phone, username), bilingual (ar/en) |
| `widget-registry.js` | Dynamic widget composition for dashboard and plugin zones |
| `ws-client.js` | WebSocket client with auto-reconnect (exponential backoff) |

### State Management
- **StateStore**: Proxy-based reactive store with per-key subscriptions
- Default slices: user, tenant, permissions, theme, language, notifications, activeExams, studyGroups, sidebarCollapsed, qbSelectedSubject/Unit/Lesson
- Changes propagate to subscribers and emit on EventBus

### Router
- History API-based SPA router
- Route pattern matching with `:param` syntax
- Route-specific guards (ProtectedRoute, GuestOnlyRoute)
- Lazy loading via dynamic `import()`
- Page title updates
- SPA fallback for non-API GET requests

### Components (`frontend/src/design-system/`)
- **CSS**: theme.css, reset.css, utilities.css, components.css
- **Forms**: Button, FormField, Input, LoadingButton, PasswordField
- **Layout**: AppLayout, Header, Sidebar
- **Feedback**: Toast, SkeletonLoader
- **Navigation**: Breadcrumb
- **Overlays**: Modal
- **Data**: DataGrid, ChartView
- **Cards**: cards.css

### Pages (`frontend/src/pages/`)
- **Auth**: LoginPage with AuthLayout, AuthCard, RememberMe, SocialButton
- **Dashboard**: Widget-based architecture using WidgetRegistry, ErrorBoundary wrapping
  - Widgets: WelcomeCard, StatsRow, QuickActions, PerformanceChart, RecentExams, ActivityTimeline
- **Question Bank**: HierarchyBrowser, QuestionBrowser, QuestionEditor, QuestionDetails
  - Sub-components: FilterPanel, SortSelector, Pagination, SearchBox, QuestionList, QuestionPreview, Toolbar, EmptyState, AIModal

### Services (`frontend/src/services/`)

| Service | Purpose |
|---------|---------|
| `auth.service.js` | Login, register, logout, session recovery, permission checks |
| `question.service.js` | CRUD operations with cache invalidation and request deduplication |
| `curriculum.service.js` | Stale-while-revalidate caching (30min TTL) |
| `dashboard.service.js` | Dashboard data with stale-while-revalidate (5min TTL) |
| `exam.service.js` | Exam operations via API client |
| `ai.service.js` | AI question generation with request deduplication |
| `indexeddb.service.js` | Offline cache and sync queue via IndexedDB |

### HTTP Layer (`frontend/src/services/http/`)

| File | Purpose |
|------|---------|
| `api-client.js` | Centralized HTTP client with interceptor pipeline, request cancellation, upload with progress |
| `auth.interceptor.js` | Injects JWT header, handles 401 with silent token refresh, request queuing during refresh |
| `error.interceptor.js` | Maps HTTP errors to user-friendly messages, dispatches toast notifications |
| `retry.interceptor.js` | Auto-retry with exponential backoff for transient failures (408, 429, 500-504) |
| `token-manager.js` | In-memory JWT storage (breaks circular dependencies) |
| `upload.interceptor.js` | XHR-based upload with progress tracking |

### Provider Pattern (Frontend)
Services use dependency injection for data providers:
- `setDashboardProvider()` — DashboardMockProvider or DashboardApiProvider
- `setCurriculumProvider()` — CurriculumMockProvider or CurriculumApiProvider
- `setQuestionProvider()` — QuestionMockProvider or QuestionApiProvider
- `setAiProvider()` — AIMockProvider

Currently all providers are **mock providers** (no real API integration).

---

# Database

## Prisma Schema Overview

**Total Models**: 28
**Enums**: 5 (QuestionType, DifficultyLevel, ExamType, ExamStatus, AttemptStatus)

### Multi-Tenancy

#### Tenant
- `id` (UUID, PK)
- `name` (String)
- `domain` (String, unique, nullable)
- `isActive` (Boolean, default: true)
- `plan` (String, default: "free")
- `metadata` (Json, nullable)
- Relations: users, settings, flags

### Users & RBAC

#### User
- `id` (UUID, PK)
- `tenantId` (String, FK → Tenant)
- `email` (String, unique)
- `passwordHash` (String)
- `firstName`, `lastName` (String)
- `avatar` (String, nullable)
- `locale` (String, default: "ar")
- `isActive`, `isEmailVerified` (Boolean)
- `failedLoginAttempts` (Int, default: 0)
- `lockedUntil` (DateTime, nullable)
- `lastLoginAt` (DateTime, nullable)
- Relations: tenant, roles, refreshTokens, sessions, loginHistory, auditLogs
- Indexes: tenantId, email

#### Role
- `id` (UUID, PK), `name` (String, unique), `description`, `isSystem`
- Relations: users, permissions

#### Permission
- `id` (UUID, PK), `resource`, `action`, `description`
- Unique constraint: [resource, action]
- Relations: roles

#### UserRole (junction)
- Composite unique: [userId, roleId]
- Cascade delete on both sides

#### RolePermission (junction)
- Composite unique: [roleId, permissionId]
- Cascade delete on both sides

### Authentication & Sessions

#### RefreshToken
- Token rotation with family tracking
- `family` (String) — for replay attack detection
- `replacedBy` (String, nullable) — links to replacement token
- `revokedAt` (DateTime, nullable)
- `userAgent`, `ipAddress` for device tracking
- Indexes: userId, token, family

#### Session
- Multi-device session tracking
- `deviceName`, `userAgent`, `ipAddress`
- `isActive`, `lastSeenAt`, `expiresAt`
- Index: userId

#### LoginHistory
- Records all login attempts with status and reason
- Indexes: userId, createdAt

### Audit Trail

#### AuditLog
- `action`, `resource`, `resourceId`
- `oldData`, `newData` (Json) — for change tracking
- `userId` (nullable, SetNull on delete)
- Indexes: userId, [resource, action], createdAt

### Feature Flags

#### FeatureFlag
- Tenant-scoped or global (tenantId nullable)
- Unique: [tenantId, key]
- `enabled`, `description`, `metadata`
- Index: key

### Application Settings

#### AppSetting
- Tenant-scoped or global
- Unique: [tenantId, category, key]
- `value` (Json)
- Index: category

### Educational Core: Curriculum

#### Curriculum
- `tenantId` (FK → Tenant, cascade)
- `name`, `country`, `system`, `description`
- Relations: grades, subjects, exams

#### Grade
- `curriculumId` (FK → Curriculum, cascade)
- `name`, `order`
- Relations: subjects

#### Subject
- `tenantId`, `curriculumId` (FKs), `gradeId` (nullable, SetNull)
- `name`, `code`, `description`, `icon`
- Relations: units, questions, exams

#### Unit
- `subjectId` (FK → Subject, cascade)
- `name`, `order`, `description`
- Relations: lessons

#### Lesson
- `unitId` (FK → Unit, cascade)
- `name`, `order`, `content` (Json, optional rich content)
- Relations: questions

### Educational Core: Questions

#### Question
- `tenantId`, `subjectId` (FKs), `lessonId` (nullable, SetNull)
- `type` (QuestionType enum)
- `difficulty` (DifficultyLevel enum, default: MEDIUM)
- `content` (Json) — rich text, math ML, structured data
- `explanation` (Json, nullable)
- `metadata` (Json, nullable) — for matching pairs, etc.
- `tags` (String[])
- `points` (Int, default: 1)
- `isPublished` (Boolean, default: false)
- Relations: choices, examQuestions
- Indexes: tenantId, subjectId, lessonId, type

#### Choice
- `questionId` (FK → Question, cascade)
- `content` (Json), `isCorrect` (Boolean), `order` (Int)
- Index: questionId

### Educational Core: Exams

#### Exam
- `tenantId`, `subjectId` (FKs), `curriculumId` (nullable, SetNull)
- `title`, `description`, `type` (ExamType enum)
- `durationMins` (nullable), `passingScore` (default: 50), `totalPoints` (default: 0)
- `config` (Json) — adaptive logic, randomization
- `isPublished` (Boolean, default: false)
- Relations: questions, tenant, subject, curriculum

#### ExamQuestion (junction)
- `examId`, `questionId`, `order`, `points` (nullable override)
- Unique: [examId, questionId]

### Exam Engine & Submissions

#### ExamAttempt
- `tenantId`, `examId`, `userId` (FKs)
- `status` (AttemptStatus enum: STARTED, SUBMITTED, AUTO_GRADED, REVIEWED, ABANDONED)
- `startedAt`, `endedAt`, `remainingSecs`
- `score`, `passed` (nullable)
- `metadata` (Json) — browser fingerprint, IP, auto-save states
- Relations: answers, tenant, exam, user

#### ExamAnswer
- `attemptId`, `questionId` (FKs)
- `answerData` (Json) — student's answer
- `isCorrect` (Boolean, nullable — null for subjective)
- `autoScore`, `manualScore` (Int, nullable)
- `feedback` (String, nullable)
- Unique: [attemptId, questionId]

### Phase 7: Billing

#### SubscriptionPlan
- `name`, `stripeProductId` (unique, nullable)
- `priceMonthly`, `priceYearly` (Float)
- `features` (Json) — maxUsers, maxStorage, etc.

#### TenantSubscription
- `tenantId` (unique), `planId` (FK)
- `stripeSubscriptionId`, `stripeCustomerId` (nullable)
- `status`, `currentPeriodEnd`, `cancelAtPeriodEnd`

### Phase 7: Plugins

#### Plugin
- `name` (unique), `version`, `description`, `author`
- `manifest` (Json) — permissions, entrypoints, hooks
- `isVerified`, `isActive`

#### TenantPlugin (junction)
- `tenantId`, `pluginId`, `config` (Json), `isEnabled`
- Unique: [tenantId, pluginId]

### Phase 7: Webhooks

#### WebhookEndpoint
- `tenantId`, `url`, `secret` (nullable, for signature verification)
- `events` (String[]) — e.g., ["exam.completed", "user.created"]
- Relations: deliveries

#### WebhookDelivery
- `endpointId`, `eventId`, `eventType`
- `requestPayload`, `responseStatus`, `responseBody`, `durationMs`
- `status` (pending, success, failed)

### Phase 7: Study Groups

#### StudyGroup
- `tenantId`, `name`, `description`
- `inviteCode` (unique, nullable) — for join-by-code
- `isPrivate` (Boolean)
- Relations: members

#### StudyGroupMember (junction)
- `groupId`, `userId`, `role` (ADMIN, MEMBER), `joinedAt`
- Unique: [groupId, userId]

## Relationships Summary

```
Tenant ─┬─ User ─┬─ UserRole ──── Role ──── RolePermission ──── Permission
        │        ├─ RefreshToken
        │        ├─ Session
        │        ├─ LoginHistory
        │        └─ AuditLog
        ├─ Curriculum ─┬─ Grade ──── Subject ─┬─ Unit ──── Lesson
        │              │                      │           └─ Question
        │              │                      └─ Question
        │              └─ Exam ──── ExamQuestion ──── Question ──── Choice
        ├─ FeatureFlag
        ├─ AppSetting
        ├─ ExamAttempt ──── ExamAnswer ──── Question
        ├─ TenantSubscription ──── SubscriptionPlan
        ├─ TenantPlugin ──── Plugin
        ├─ WebhookEndpoint ──── WebhookDelivery
        └─ StudyGroup ──── StudyGroupMember ──── User
```

## Migrations

No migration files were found in the repository. The project uses `prisma db push` for schema synchronization during development.

---

# API

## Authentication Endpoints

### POST `/api/v1/auth/register`
- **Body**: `{ email, password, firstName, lastName, locale? }`
- **Validation**: Email format, password 8+ chars with upper/lower/number, names 1-100 chars
- **Response**: 201 `{ success, message, data: { user } }`
- **Tenant Required**: Yes (via x-tenant-id header)

### POST `/api/v1/auth/login`
- **Body**: `{ email, password }`
- **Response**: 200 `{ success, message, data: { user, accessToken, session } }`
- **Cookie**: Sets refreshToken (httpOnly, secure, 7d)
- **Account Lockout**: After 5 failed attempts, locked for 15 minutes

### POST `/api/v1/auth/refresh`
- **Body/Cookie**: `{ refreshToken }` (prefers cookie)
- **Response**: 200 `{ success, data: { accessToken } }`
- **Token Rotation**: Old refresh token revoked, new one issued
- **Replay Detection**: If revoked token reused, entire family revoked

### POST `/api/v1/auth/logout` (Auth required)
- **Response**: 200 `{ success, message }`
- Clears refresh token cookie

### POST `/api/v1/auth/logout-all` (Auth required)
- Revokes all tokens and deactivates all sessions

### PUT `/api/v1/auth/password` (Auth required)
- **Body**: `{ currentPassword, newPassword }`
- **Response**: 200 `{ success, message }`
- Revokes all existing tokens after change

### GET `/api/v1/auth/me` (Auth required)
- **Response**: 200 `{ success, data: user }`

### GET `/api/v1/auth/sessions` (Auth required)
- **Response**: 200 `{ success, data: sessions[] }`

### DELETE `/api/v1/auth/sessions/:id` (Auth required)
- **Response**: 200 `{ success, message }`

### GET `/api/v1/auth/login-history` (Auth required)
- **Response**: 200 `{ success, data: history[] }`

## User Endpoints (Admin+)

### GET `/api/v1/users`
- **Query**: `page`, `limit`, `search`
- **Response**: 200 `{ success, data: { users, total, page, limit, totalPages } }`

### GET `/api/v1/users/:id`
- **Response**: 200 `{ success, data: user }`

### PUT `/api/v1/users/:id`
- **Body**: `{ firstName?, lastName?, locale?, avatar? }`

### POST `/api/v1/users/:id/roles`
- **Body**: `{ role: "student"|"teacher"|"admin"|... }`

### DELETE `/api/v1/users/:id/roles/:role`

### POST `/api/v1/users/:id/deactivate`
### POST `/api/v1/users/:id/activate`

## Tenant Endpoints

### GET `/api/v1/tenants` (Super Admin)
### POST `/api/v1/tenants` (Super Admin)
### GET `/api/v1/tenants/me` (Admin)
### PUT `/api/v1/tenants/me` (Admin)
### GET `/api/v1/tenants/:id` (Super Admin)
### PUT `/api/v1/tenants/:id` (Super Admin)
### POST `/api/v1/tenants/:id/suspend` (Super Admin)
### POST `/api/v1/tenants/:id/activate` (Super Admin)

## Curriculum Endpoints

### GET `/api/v1/curriculums`
### POST `/api/v1/curriculums` (Admin+)
### GET `/api/v1/curriculums/:curriculumId/grades`
### POST `/api/v1/curriculums/grades` (Admin+)
### GET `/api/v1/curriculums/subjects`
### POST `/api/v1/curriculums/subjects` (Admin/Teacher+)
### GET `/api/v1/curriculums/subjects/:subjectId/units`
### POST `/api/v1/curriculums/units` (Admin/Teacher+)
### POST `/api/v1/curriculums/lessons` (Admin/Teacher+)

## Question Endpoints

### GET `/api/v1/questions`
- **Query**: `page`, `limit`, `subjectId`, `lessonId`, `type`, `difficulty`, `tags`
- **Response**: 200 `{ success, data: { items, total, page, limit, totalPages } }`

### POST `/api/v1/questions` (Admin/Teacher+)
- **Body**: `{ subjectId, lessonId?, type, difficulty?, content, explanation?, metadata?, tags?, points?, isPublished?, choices? }`
- **Validation**: MCQ requires 2+ choices, T/F requires exactly 2

## Exam Endpoints

### GET `/api/v1/exams`
### GET `/api/v1/exams/:id`
### POST `/api/v1/exams` (Admin/Teacher+)
### POST `/api/v1/exams/:id/publish` (Admin/Teacher+)

## Engine Endpoints

### POST `/api/v1/engine/attempts`
- **Body**: `{ examId, metadata? }`
- **Prevents duplicate active attempts**

### POST `/api/v1/engine/attempts/:attemptId/answers`
- **Body**: `{ questionId, answerData }`
- **Auto-grades objective questions on save**

### POST `/api/v1/engine/attempts/:attemptId/submit`
- **Body**: `{ remainingSecs? }`
- **Calculates total score, determines pass/fail**

### POST `/api/v1/engine/attempts/:attemptId/answers/:answerId/review` (Admin/Teacher+)
- **Body**: `{ manualScore, feedback }`

## Analytics Endpoints (Admin/Teacher+)

### GET `/api/v1/analytics/tenant`
- **Response**: `{ totalAttempts, averageScore, passedCount }`

### GET `/api/v1/analytics/questions/:questionId`
- **Response**: `{ totalAnswers, correctAnswers, averageScore }`

## Billing Endpoints

### POST `/api/v1/billing/webhooks/payment` (No auth, signature verification)
### GET `/api/v1/billing/plans`
### GET `/api/v1/billing/subscription` (Admin+)

## Plugin Endpoints (Admin+)

### GET `/api/v1/plugins/marketplace`
### GET `/api/v1/plugins/installed`
### POST `/api/v1/plugins/:pluginId/install`
### DELETE `/api/v1/plugins/:pluginId`
### PATCH `/api/v1/plugins/:pluginId/config`

## Webhook Endpoints (Admin+)

### GET `/api/v1/webhooks`
### POST `/api/v1/webhooks`

## Study Group Endpoints

### GET `/api/v1/study-groups`
### POST `/api/v1/study-groups`
### GET `/api/v1/study-groups/:groupId`
### POST `/api/v1/study-groups/:groupId/join`

## Feature Flag Endpoints

### GET `/api/v1/feature-flags`
### GET `/api/v1/feature-flags/:key`
### PUT `/api/v1/feature-flags`
### DELETE `/api/v1/feature-flags/:id`

## Settings Endpoints

### GET `/api/v1/settings`
### GET `/api/v1/settings/category/:category`
### PUT `/api/v1/settings`
### PUT `/api/v1/settings/bulk`
### DELETE `/api/v1/settings/:id`

## Validation Errors

All endpoints return structured validation errors:
```json
{
  "success": false,
  "error": {
    "message": "Validation error",
    "details": [
      { "field": "email", "message": "Invalid email address" }
    ]
  }
}
```

---

# Features

## Implemented Features (v1.1.0)

### Phase 1: Project Foundation ✅
- Express server with full middleware chain
- Prisma ORM with PostgreSQL
- Environment configuration management
- Pino logging with HTTP request logging
- Custom error classes (AppError, BadRequest, Unauthorized, Forbidden, NotFound)
- Zod validation middleware

### Phase 2: Authentication & Authorization ✅
- User registration and login
- JWT access tokens (in-memory) + refresh tokens (HTTP-only cookies)
- Token rotation with replay attack detection
- Account lockout after 5 failed attempts (15 min)
- Session management (multi-device)
- Role-based access control (RBAC)
- Audit logging

### Phase 3: Enterprise Architecture ✅
- Platform abstractions (AI, OCR, Storage, Payments, Notifications, Search)
- 8 AI providers (OpenAI, Gemini, Anthropic, OpenRouter, Ollama, DeepSeek, Qwen, Mistral)
- Queue system (BullMQ) with worker infrastructure
- Scheduler for recurring jobs
- Distributed lock service
- WebSocket gateway (stub)
- Multi-tenancy support
- Feature flags system
- App settings system
- Plugin marketplace with sandbox runtime
- Webhook delivery system
- Study groups
- Billing/subscriptions framework
- i18n (Arabic + English)
- Prometheus metrics

### Phase 4: Question Bank ✅
- Curriculum hierarchy (Subjects → Units → Lessons)
- Question CRUD with 9 question types
- AI question generation (provider-independent)
- Multiple difficulty levels (Easy, Medium, Hard, Expert)
- Tags system
- Publishing workflow

### Phase 4 (partial): Exam Engine ✅
- Exam creation with question selection
- Exam attempt lifecycle (STARTED → SUBMITTED → AUTO_GRADED → REVIEWED)
- Auto-grading engine for objective questions
- Manual grading support
- Answer auto-save
- Timer support (remainingSecs)

### Phase 4 (partial): Analytics ✅
- Tenant-level performance stats (raw SQL)
- Question-level analytics (difficulty index)
- Average score, pass rate calculations

### Phase 7 (partial): Platform Features ✅
- Subscription plans and tenant subscriptions
- Payment webhook handling (Stripe/PayPal/Paddle/LemonSqueezy)
- Plugin marketplace and installation
- Plugin sandbox runtime (placeholder)
- Webhook endpoint management and delivery
- Study group creation and joining

### Frontend ✅
- Complete SPA with custom router, state management, and component system
- Login page with validation
- Dashboard with widget-based architecture
- Question Bank with hierarchy browser, question browser, editor, and details
- Design system with form components, layout, feedback, and overlays
- PWA with offline support (Service Worker + IndexedDB)
- Mock data providers for all services

## Partially Implemented Features

- **AI Question Generation**: Backend service ready, frontend modal exists, but uses mock providers
- **Exam Engine**: Backend fully implemented, frontend exam-taking interface NOT built
- **Analytics**: Backend endpoints exist, frontend dashboard NOT built
- **Webhook Delivery**: Endpoint management exists, actual dispatch logic is placeholder
- **Plugin Runtime**: Sandbox exists but uses `new Function()` (not truly isolated)
- **Distributed Lock Service**: Mock implementation, needs Redis integration
- **Queue System**: Factory and registry exist, but BullMQ connection is mocked
- **WebSocket Gateway**: Architecture defined, actual socket.io integration commented out

## Planned Features (Not Implemented)

- Exam Builder (Phase 5): Manual and AI-assisted exam assembly, templates, print/export
- Student Exam Interface (Phase 6): Timer UI, answer review, score display
- Advanced Analytics (Phase 7): Performance dashboards, item analysis, discrimination index
- Daily Challenges and Spaced Repetition
- Leaderboards and Badge System
- Weakness Detection AI
- Pomodoro Timer
- Real-time WebSocket integration
- Full Redis integration for queues and locks
- Real API provider integration (all providers are stubs)
- Database migrations (no migration files exist)

---

# Business Logic

## Module Descriptions

### Auth Module
Handles complete authentication lifecycle: registration (with default student role assignment), login (with account lockout), token rotation (with replay detection), session management (multi-device), password changes (force logout), and audit logging. Events emitted for cross-module communication.

### Users Module
Admin-only user management: list/search users, update profiles, assign/remove roles, activate/deactivate accounts. Tenant-scoped operations.

### Tenant Module
Multi-tenant management: create tenants (unique domain), update details, suspend/activate. Super admin can manage all tenants; admins can view/update their own.

### Curriculum Module
Educational hierarchy management: Curriculums → Grades → Subjects → Units → Lessons. Supports ordering, filtering by curriculum/grade, and hierarchical navigation.

### Questions Module
Question bank CRUD: supports 9 question types, difficulty levels, tags, publishing. Business rules enforce minimum choices for MCQ (2+) and T/F (exactly 2).

### Exams Module
Exam management: create exams with question selection, publish workflow. Supports multiple exam types (Practice, Mock, Timed, Adaptive, AI-Generated, Custom).

### Engine Module
Exam attempt lifecycle: start attempt (prevent duplicates), auto-save answers with real-time grading, submit with score calculation, manual review by instructors. Grading engine handles MCQ, T/F, Multi-Select, Short Answer, Fill-in-Blank, Essay (manual), Image-based (manual).

### Analytics Module
Read-only analytics using raw SQL: tenant-level stats (total attempts, average score, pass rate), question-level analytics (difficulty index based on correct answer ratio).

### Feature Flags Module
Tenant-scoped or global feature flags with in-memory caching. Supports upsert, list, check, and delete operations.

### Settings Module
Tenant-scoped application settings organized by category (ai, storage, security, email, exams, notifications, themes, general, billing, ocr). In-memory cache with bulk operations.

### Billing Module
Subscription management: available plans, tenant subscriptions, payment webhook handling (Stripe/PayPal/Paddle/LemonSqueezy signature verification).

### Plugins Module
Marketplace listing, tenant installation, configuration, and uninstallation. Sandbox runtime with permission layer for secure plugin execution.

### Webhooks Module
Endpoint management with HMAC-SHA256 signature generation, event dispatch to subscribed endpoints, delivery logging with status tracking.

### Study Groups Module
Group creation with invite codes, membership management, role-based (ADMIN/MEMBER).

## Request Flow Example: Login

1. Client sends `POST /api/v1/auth/login` with `{ email, password }`
2. Gateway adds request ID, logging, security headers
3. Rate limiter checks (authRateLimiter: 20/hr)
4. Auth controller validates with Zod schema
5. AuthService.login() called:
   a. Find user by email (includes roles)
   b. Check if account is locked
   c. Check if account is active
   d. Compare password with bcrypt
   e. On failure: increment attempts, lock if threshold reached
   f. On success: reset attempts, generate token pair
   g. Create session record
   h. Record login history
   i. Emit `auth:user_logged_in` event
6. Controller sets refresh token as httpOnly cookie
7. Returns access token + user data

## Request Flow Example: Start Exam Attempt

1. Client sends `POST /api/v1/engine/attempts` with `{ examId }`
2. Authenticate middleware verifies JWT
3. EngineService.startAttempt():
   a. Fetch exam with questions (includes choices)
   b. Verify exam exists, belongs to tenant, is published
   c. Check for existing active attempt (return it if exists)
   d. Create ExamAttempt record (status: STARTED)
   e. Emit `attempt:started` event
4. Returns attempt data

---

# Security

## Authentication
- JWT access tokens stored in memory (via TokenManager)
- Refresh tokens stored in HTTP-only cookies (secure, sameSite: strict)
- Token rotation: old refresh token revoked, new one issued on each refresh
- Replay attack detection: if revoked token reused, entire token family is revoked
- Token issuer: 'exam-bank', audience: 'exam-bank-client'

## Authorization
- Role-based access control (RBAC) with 6 roles: super_admin, admin, teacher, student, parent, moderator
- Permission-based access control (placeholder, not fully wired)
- Super admins bypass all permission checks
- Route-level authorization via `authorize()` and `requirePermission()` middleware

## Environment Variables
- `.env` file excluded from git via `.gitignore`
- `.env.example` provided as template
- Secrets: JWT_SECRET, JWT_REFRESH_SECRET, DATABASE_URL, API keys
- Production: secrets should be managed via Kubernetes Secrets or cloud providers

## Secrets
- JWT secrets with configurable expiry (default: 15m access, 7d refresh)
- Payment webhook secrets for signature verification
- Webhook endpoint secrets for HMAC-SHA256 signing
- API keys for AI providers (OpenAI, Anthropic, Gemini, etc.)

## Validation
- Zod schemas for all request bodies, params, and queries
- Password strength requirements: 8+ chars, uppercase, lowercase, number
- Email format validation
- UUID validation for IDs
- Input sanitization via Zod transforms (trim, lowercase)

## Rate Limiting
- Global: 1000 requests per 15 minutes per IP
- Auth endpoints: 20 requests per hour per IP (successful requests not counted)
- Standard headers enabled, legacy headers disabled

## Helmet
- Content Security Policy with directives for self, unsafe-inline (SPA), Google Fonts, WebSocket
- Cross-origin embedder policy disabled (third-party images)
- HSTS enabled by default

## CORS
- Configurable origin (default: `http://localhost:5000`)
- Credentials enabled

## Sanitization
- Zod `.trim()` and `.toLowerCase()` transforms on email fields
- Password hash never exposed in responses (removed via `_sanitizeUser()`)
- Failed login attempts don't reveal whether email exists (same error message)

---

# Testing

## Coverage

Coverage output exists in `coverage/` directory with:
- `clover.xml` — Clover format
- `coverage-final.json` — JSON format
- `lcov-report/` — HTML report
- `lcov.info` — LCOV format

Coverage is generated using Istanbul with v8 provider.

## Test Structure

```
tests/
├── setup.js                    # Global Jest setup (Prisma mock, env config)
├── api/
│   └── health.test.js          # Health endpoint test (supertest)
├── unit/
│   └── event.bus.test.js       # EventBus unit test (subscribe, unsubscribe, publish)
└── helpers/
    └── auth.helper.js          # JWT token generator for testing
```

## Jest Configuration

```js
{
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  modulePathIgnorePatterns: ['<rootDir>/frontend/', '<rootDir>/dist/']
}
```

## Missing Tests

- No tests for any business module (auth, users, tenant, curriculum, questions, exams, engine, analytics, billing, plugins, webhooks, study-groups)
- No tests for shared infrastructure (database, config, security, validators, queues, scheduler)
- No integration tests with real database
- No frontend tests
- Only 2 test files exist (event.bus.test.js and health.test.js)
- Test coverage is minimal

---

# Environment Variables

| Variable | Purpose | Default | Required |
|----------|---------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment mode | development | No |
| `DATABASE_URL` | PostgreSQL connection string | — | Yes |
| `REDIS_URL` | Redis connection string | redis://localhost:6379 | No |
| `JWT_SECRET` | Access token signing key | supersecret_dev_key | Yes (prod) |
| `JWT_EXPIRES_IN` | Access token expiry | 15m | No |
| `JWT_REFRESH_SECRET` | Refresh token signing key | supersecret_refresh_key | Yes (prod) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | 7d | No |
| `LOG_LEVEL` | Pino log level | info | No |
| `AI_DEFAULT_PROVIDER` | Default AI provider | openai | No |
| `OPENAI_API_KEY` | OpenAI API key | — | No |
| `ANTHROPIC_API_KEY` | Anthropic API key | — | No |
| `GEMINI_API_KEY` | Google Gemini API key | — | No |
| `OPENROUTER_API_KEY` | OpenRouter API key | — | No |
| `DEEPSEEK_API_KEY` | DeepSeek API key | — | No |
| `QWEN_API_KEY` | Qwen API key | — | No |
| `MISTRAL_API_KEY` | Mistral API key | — | No |
| `OLLAMA_HOST` | Ollama server URL | — | No |
| `STORAGE_PROVIDER` | Storage backend | local | No |
| `S3_BUCKET_NAME` | S3 bucket | — | No |
| `S3_ACCESS_KEY` | S3 access key | — | No |
| `S3_SECRET_KEY` | S3 secret key | — | No |
| `S3_REGION` | S3 region | us-east-1 | No |
| `R2_ACCOUNT_ID` | Cloudflare R2 account | — | No |
| `R2_BUCKET_NAME` | R2 bucket | — | No |
| `PAYMENT_DEFAULT_PROVIDER` | Payment provider | stripe | No |
| `STRIPE_API_KEY` | Stripe API key | — | No |
| `STRIPE_SECRET_KEY` | Stripe secret key | — | No |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | — | No |
| `PAYMENT_WEBHOOK_SECRET` | Generic webhook secret | — | No |
| `SMTP_HOST` | SMTP server | — | No |
| `SMTP_PORT` | SMTP port | 587 | No |
| `SMTP_USER` | SMTP username | — | No |
| `SMTP_PASS` | SMTP password | — | No |
| `SMTP_FROM` | Sender email | — | No |
| `VAPID_PUBLIC_KEY` | Web Push public key | — | No |
| `VAPID_PRIVATE_KEY` | Web Push private key | — | No |
| `SMS_ACCOUNT_SID` | Twilio/Vonage SID | — | No |
| `SMS_AUTH_TOKEN` | Twilio/Vonage token | — | No |
| `SMS_FROM_NUMBER` | SMS sender number | — | No |
| `FRONTEND_URL` | CORS allowed origin | http://localhost:5000 | No |

---

# Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `start` | `node server.js` | Production server start |
| `dev` | `nodemon server.js` | Development server with hot-reload |
| `test` | `jest --runInBand --forceExit` | Run tests serially |
| `db:generate` | `prisma generate` | Generate Prisma Client |
| `db:migrate` | `prisma migrate dev` | Run development migrations |
| `db:push` | `prisma db push` | Push schema to database |
| `db:studio` | `prisma studio` | Open Prisma Studio GUI |

### Production Startup Script (`scripts/start-prod.sh`)
1. Wait for PostgreSQL
2. Run `npx prisma migrate deploy`
3. Start PM2 in cluster mode: `pm2-runtime start src/app.js -i max`

---

# Dependencies

## Production Dependencies

| Package | Purpose |
|---------|---------|
| `@prisma/client` | Database ORM for PostgreSQL |
| `bcrypt` | Password hashing (12 salt rounds) |
| `bullmq` | Background job queue (Redis-backed) |
| `compression` | gzip/deflate response compression |
| `cookie-parser` | Parse HTTP cookies |
| `cors` | Cross-Origin Resource Sharing |
| `dotenv` | Environment variable loading |
| `express` | HTTP framework (v5) |
| `express-rate-limit` | Rate limiting middleware |
| `helmet` | Security HTTP headers |
| `ioredis` | Redis client for BullMQ |
| `jsonwebtoken` | JWT creation and verification |
| `node-cron` | Cron-based task scheduling |
| `pino` | Fast JSON logger |
| `pino-http` | HTTP request logging |
| `prom-client` | Prometheus metrics collection |
| `swagger-ui-express` | API documentation UI |
| `yamljs` | YAML parsing for OpenAPI spec |
| `zod` | Runtime schema validation |

## Development Dependencies

| Package | Purpose |
|---------|---------|
| `jest` | Test framework |
| `nodemon` | File watcher for dev reload |
| `pino-pretty` | Human-readable log formatting |
| `prisma` | Prisma CLI for migrations |
| `supertest` | HTTP assertion testing |

---

# Release Notes

## v1.1.0-question-bank (2026-07-18)

### Summary
Complete Question Bank module — the core content management system for the Exam Bank platform.

### What's New
- **Curriculum Hierarchy**: Subjects → Units → Lessons with HierarchyBrowser, optimistic navigation, prefetching, breadcrumb trail
- **Question Browser**: Cursor-based pagination, FilterEngine (9 filter types), SortEngine, SelectionManager, URL state synchronization
- **Question Preview**: Slide-in drawer with progressive loading, deep-linkable via query param
- **Question Details**: Full page with metadata, analytics, attachments, AI metadata
- **Question CRUD**: Unified editor, draft autosave to localStorage, unsaved changes detection, duplicate, soft delete, restore, permanent delete
- **AI Question Generation**: Provider-independent, async workflow with progress indicator, review-before-save, observability tracking

### Architecture
No new patterns introduced. Built on v1.0.0 architecture baseline.

### Breaking Changes
None.

---

# Roadmap

## Phase 1: Project Foundation ✅
Completed.

## Phase 2: Authentication & Authorization ✅
Completed.

## Phase 3: Enterprise Architecture ✅
Completed.

## Phase 4: Question Bank ✅
Completed (v1.1.0).

## Phase 5: Exam Builder (Planned)
- Exam creation workflow
- Question selection from Question Bank
- Manual and AI-assisted exam assembly
- Exam templates and blueprints
- Print and export support

## Phase 6: Student Experience (Planned)
- Student exam-taking interface
- Timer and auto-submit
- Answer review
- Score calculation and grading

## Phase 7: Analytics & Reporting (Planned)
- Question performance analytics
- Student performance dashboards
- Class-level reports
- Item analysis (discrimination index, difficulty index)

### Product Roadmap (from docs/PRODUCT_ROADMAP.md)
1. Grade Expansion (1st & 2nd Secondary)
2. Core Learning Features (Exam Mode, Post-Exam Review, Advanced Filtering)
3. Retention & Engagement (Daily Challenges, Spaced Repetition, Leaderboards, Badges)
4. AI-Powered Features (Weakness Detection, AI Mock Exams)
5. Social & Productivity (Study Groups, Pomodoro Timer)

---

# Technical Debt

## Identified Weaknesses

1. **No Database Migrations**: Using `prisma db push` instead of proper migrations. Schema changes are not version-controlled.

2. **Minimal Test Coverage**: Only 2 test files exist (EventBus unit test and health endpoint test). No module-level tests, no integration tests, no frontend tests.

3. **Mock Implementations**: Multiple critical systems are mocked:
   - Redis connection in QueueFactory
   - LockService (distributed lock)
   - WebSocket Gateway (actual socket.io commented out)
   - All AI providers (return dummy data)
   - All frontend data providers (mock providers)

4. **Plugin Sandbox Not Secure**: Uses `new Function()` for sandboxing, which is not truly isolated. Should use `isolated-vm` or `worker_threads`.

5. **No Rate Limiting on Queue Jobs**: Queue system has no per-user or per-tenant job limits.

6. **Frontend Mock Providers Only**: All data services use mock providers. No real API integration exists in the frontend.

7. **Duplicated Code**:
   - `paginationQuery` schema is defined independently in multiple modules (users, tenants, curriculum, questions, exams)
   - `_sanitizeUser()` pattern duplicated in auth.service.js and user.service.js
   - Prisma client lazy-init pattern repeated in every repository

8. **Missing Permission Wiring**: `requirePermission()` middleware is a placeholder that always calls `next()`.

9. **No Input Sanitization Beyond Zod**: No XSS protection beyond Helmet CSP. Rich content stored as JSON without sanitization.

10. **No Caching Layer for Read-Heavy Endpoints**: Analytics and curriculum queries hit the database directly without Redis caching.

## Architectural Issues

1. **Frontend-Backend Integration Gap**: The frontend has a complete service layer but only mock providers. Real API integration is not wired.

2. **Incomplete Grading Engine**: Essay, Matching, Ordering, and Image-based questions return `isCorrect: null` (manual review only). No partial credit logic.

3. **No Real-time Features**: WebSocket gateway is defined but not connected. Real-time exam proctoring and notifications are not functional.



## Performance Issues

1. **N+1 Queries in Analytics**: Raw SQL is used for aggregation, but the query patterns could be optimized with materialized views.

2. **No Connection Pooling Configuration**: Prisma uses default connection pool settings.

3. **No CDN for Frontend Assets**: Frontend is served by Express static middleware.

---

# Improvements

## High Priority

1. **Implement Database Migrations**: Convert from `prisma db push` to `prisma migrate` for version-controlled schema changes.

2. **Add Module Tests**: Write unit tests for auth, users, curriculum, questions, exams, engine, and billing services.

3. **Wire Real API Providers**: Connect frontend services to real backend endpoints instead of mock providers.

4. **Integrate Redis for Queues and Locks**: Replace mock implementations with real Redis connections.

5. **Secure Plugin Sandbox**: Replace `new Function()` with `isolated-vm` for true V8 isolation.

## Medium Priority

6. **Add Caching Layer**: Implement Redis caching for read-heavy endpoints (analytics, curriculum).

7. **Extract Common Schemas**: Create shared Zod schemas for pagination, UUID params, etc.

8. **Add Frontend Tests**: Write unit tests for core infrastructure (Router, StateStore, EventBus, etc.).

9. **Implement Real-time WebSocket**: Connect socket.io for live notifications and exam proctoring.

10. **Add Request Validation Middleware**: Wire `requirePermission()` to actual permission checks.

## Low Priority



12. **Add API Rate Limiting Per Tenant**: Implement tenant-level rate limits in addition to IP-based.

13. **Add Content Sanitization**: Sanitize rich content stored in Questions and Lessons.

14. **Implement CDN**: Serve frontend static assets via CDN for better performance.

15. **Add Monitoring Dashboards**: Create Grafana dashboards for Prometheus metrics.

---

# Current Project State

## What Has Been Completed

- Full backend architecture with 14 business modules
- Complete database schema with 28 models
- Authentication system with JWT, refresh tokens, and session management
- RBAC with 6 roles and permission framework
- Multi-tenant architecture
- Question Bank CRUD with 9 question types
- Exam creation and engine (auto-grading for objective questions)
- Analytics endpoints with raw SQL aggregations
- Platform abstractions for AI (8 providers), Storage, Notifications, Payments, Search, OCR
- Queue system architecture with BullMQ
- Scheduler with distributed locking
- Feature flags and settings modules
- Plugin marketplace with sandbox runtime
- Webhook delivery system
- Study groups
- Billing/subscriptions framework
- i18n (Arabic + English)
- Security middleware (Helmet, rate limiting, CORS)
- Prometheus metrics
- Swagger API documentation
- Complete frontend SPA with custom framework
- Login page with validation
- Dashboard with widget architecture
- Question Bank browser with filtering, sorting, selection
- Question editor with draft autosave
- Question details page
- Design system with form components
- PWA with offline support

- Operational documentation

## What Still Needs Work

- Real API integration in frontend (currently all mock)
- Redis integration for queues, locks, and caching
- WebSocket real-time features
- Database migrations
- Comprehensive test suite
- Plugin sandbox security
- Permission-based authorization wiring
- Exam taking frontend interface
- Analytics dashboards
- Grade expansion (1st & 2nd secondary)
- Student exam interface with timer
- Spaced repetition system
- Leaderboards and badges
- AI weakness detection
- Full payment integration

---

# Development Rules

## Architecture Rules

1. **Architecture Freeze is ACTIVE** (v1.0.0 baseline). No architectural refactoring allowed.
2. **Question Bank Freeze is ACTIVE** (v1.1.0 baseline). No structural changes to Question Bank.
3. All modules communicate via EventBus — never import directly across module boundaries.
4. All external services go through platform abstractions — never import provider SDKs directly.
5. Controllers contain NO business logic — only request parsing and response formatting.
6. Services contain ALL business logic — never call Prisma directly from controllers.
7. Repositories contain ALL database operations — never call Prisma from services.
8. All database operations use the singleton Prisma client via `getPrismaClient()`.

## Folder Conventions

1. Each module follows: `index.js`, `*.routes.js`, `*.controller.js`, `*.service.js`, `*.repository.js`, `*.validator.js`
2. Modules export via `index.js` barrel file
3. Shared infrastructure lives in `src/shared/`
4. Platform abstractions live in `src/shared/platforms/`
5. Frontend core infrastructure lives in `frontend/src/core/`
6. Frontend pages live in `frontend/src/pages/`
7. Frontend services live in `frontend/src/services/`

## Naming Conventions

1. **Files**: kebab-case (e.g., `auth.service.js`, `question.routes.js`)
2. **Classes**: PascalCase (e.g., `AuthService`, `BaseComponent`)
3. **Functions**: camelCase (e.g., `generateAccessToken`, `createQuestion`)
4. **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_LOGIN_ATTEMPTS`, `QUEUES`)
5. **Events**: dot-notation (e.g., `auth:user_logged_in`, `question:created`)
6. **Database Models**: PascalCase (e.g., `User`, `ExamAttempt`)
7. **Enums**: UPPER_SNAKE_CASE values (e.g., `MULTIPLE_CHOICE`, `AUTO_GRADED`)

## Coding Conventions

1. No comments unless explaining WHY (not WHAT)
2. No defensive error handling for scenarios that can't happen
3. No abstractions for single-use code
4. No features beyond what was asked
5. Prefer editing existing files over creating new ones
6. All responses follow `{ success: boolean, data?: any, error?: { message, details? } }` format
7. Use Zod for all input validation
8. Use EventBus for cross-module communication
9. Singleton pattern for services and repositories
10. Lazy initialization for database connections

---

# AI Context

## Architecture Decisions

1. **Modular Monolith over Microservices**: Chose for simpler deployment, easier debugging, and shared database transactions while maintaining module isolation via EventBus.

2. **Vanilla JS over Framework**: Chose for zero-dependency frontend, maximum control, smaller bundle, and educational value. Uses custom component system with lifecycle management.

3. **Provider Abstraction Pattern**: All external services (AI, Storage, Payments) use abstract base classes with config-driven instantiation. This allows swapping providers without changing business code.

4. **EventBus for Decoupling**: Modules never import each other directly. Communication happens via published events, enabling independent evolution.

5. **CQRS-light**: Commands and queries are logically separated but use the same database. Analytics uses raw SQL for complex aggregations.

6. **Architecture Freeze**: Both the core architecture (v1.0.0) and Question Bank (v1.1.0) are frozen. Only business features and bug fixes are allowed.

## Design Philosophy

- **Security First**: JWT in memory only, refresh tokens in http-only cookies, token rotation with replay detection, account lockout
- **Multi-Tenant by Design**: Every data model is tenant-scoped, tenant context flows through the entire request lifecycle
- **Provider Independence**: AI, Storage, Payments, Notifications are all swappable via config
- **Offline-Capable**: PWA with Service Worker and IndexedDB for offline caching
- **Arabic-First**: RTL layout, Arabic as default locale, bilingual validation messages

## Completed Milestones

1. **v1.0.0**: Core architecture, auth, RBAC, enterprise infrastructure
2. **v1.1.0**: Complete Question Bank module (hierarchy, browser, CRUD, AI generation)

## Known Issues

1. All AI providers are stubs returning dummy data
2. All frontend data providers are mock providers
3. Redis connection is mocked in queue factory and lock service
4. WebSocket gateway is defined but not connected
5. Plugin sandbox uses `new Function()` (not secure)
6. `requirePermission()` is a placeholder
7. No database migration files exist
8. Test coverage is minimal (2 test files)

10. Frontend exam-taking interface not built

## Pending Work

- Wire frontend to real API endpoints
- Implement Redis integration
- Build exam-taking frontend
- Add comprehensive tests
- Create database migrations
- Secure plugin sandbox
- Build analytics dashboards
- Implement real-time WebSocket
- Complete payment integration

## Developer Notes

1. Run `npx prisma generate` after schema changes
2. Use `npm run dev` for development (nodemon hot-reload)
3. Database is hosted on Supabase — set `DATABASE_URL` from Supabase Dashboard
4. Frontend is served by Express at `http://localhost:3000/`
5. API documentation at `http://localhost:3000/api-docs` (non-production)
6. All API responses follow `{ success, data/error }` format
7. JWT access tokens are short-lived (15m default), refresh tokens are long-lived (7d)
8. The frontend uses ES modules — no bundler needed
9. Coverage reports are in `coverage/lcov-report/index.html`

## Important Assumptions

1. PostgreSQL is hosted on Supabase (managed PostgreSQL)
2. Redis is required for production (queues, locks, caching)
3. Node.js v20+ is required
4. The platform targets Egyptian secondary education (Thanaweya Amma)
5. Arabic is the primary language, English is secondary
6. Multi-tenancy is a core requirement — not an afterthought
7. AI generation is async (queued via BullMQ), not synchronous
8. The frontend is a PWA — offline support is expected
9. All external provider SDKs are stubbed — real implementation is deferred
10. The architecture is frozen — no structural changes allowed

---

*This document was generated from complete repository analysis on 2026-07-20.*
*Every file in the repository was inspected and documented.*
