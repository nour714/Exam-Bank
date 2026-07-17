# Enterprise Exam Bank Architecture

## Overview
Exam Bank is a Modular Monolith built for high scalability, fault tolerance, and multi-tenant isolation. It employs a Command Query Responsibility Segregation (CQRS) pattern, an Event-Driven architecture via a global `EventBus`, and a robust plugin ecosystem.

## Core Architectural Patterns
1. **Modular Monolith**: The `src/modules` directory contains heavily isolated business domains (Auth, Exams, Billing, etc.). They communicate exclusively through the `EventBus` or highly abstracted interfaces.
2. **CQRS**: Commands (Mutations) and Queries (Reads) are logically separated, often traversing different middleware flows and optimized database indexes.
3. **Event-Driven**: The `EventBus` (`src/shared/events/event.bus.js`) bridges domains asynchronously. For example, when the `Exam Engine` finishes an exam, it emits `exam.completed`. The `Analytics` module listens and updates leaderboards without the `Engine` ever knowing about `Analytics`.

## Platforms Layer
The `src/shared/platforms/` directory houses strict, provider-agnostic abstractions:
- **AI**: Swappable between OpenAI, Anthropic, Gemini, etc.
- **Storage**: Swappable between Local Storage, AWS S3, and GCS.
- **Payments**: Decouples the Billing module from Stripe, PayPal, etc.

## Background Jobs & Reliability
Heavy lifting is offloaded to `BullMQ` (Redis) via `src/shared/queues/`.
A distributed `LockService` prevents race conditions across PM2 instances when consuming webhooks or mutating ledger balances.

## Frontend
The frontend (`frontend/`) is a completely distinct, zero-framework Vanilla JavaScript Single Page Application (SPA).
- **No Virtual DOM**: Uses pure DOM creation for blazing speed.
- **State Store**: Reactive state via JavaScript Proxies (`src/core/state-store.js`).
- **Module Loader**: Lazy-loads application chunks (`src/core/module-loader.js`).
- **PWA**: Fully functional offline through Service Workers and IndexedDB.
