# Release Notes — v1.1.0-question-bank

**Release Date:** 2026-07-18

## Summary

This release delivers the complete **Question Bank** module — the core content management system for the Exam Bank platform. It provides a full-featured curriculum hierarchy, an advanced question browser with filtering and sorting, a comprehensive CRUD workflow, and AI-powered question generation.

## What's New

### Curriculum Hierarchy
- **Subjects, Units, Lessons**: Full drill-down navigation with `HierarchyBrowser`.
- Optimistic navigation and hover-based prefetching for instant-feel transitions.
- Breadcrumb trail with deep-linkable routes.

### Question Browser
- Cursor-based pagination (`Load More`) for scalable browsing.
- `FilterEngine` with dynamic filter chips (Subject, Unit, Lesson, Difficulty, Type, Tags, Source, Status, Date Range).
- `SortEngine` supporting Newest, Oldest, Difficulty ordering.
- `SelectionManager` for multi-select with bulk action toolbar.
- Full URL state synchronization — every browser state is deep-linkable and survives refresh.

### Question Preview & Details
- Slide-in drawer preview with progressive loading (instant metadata, background content).
- Deep-linkable via `?preview=<id>` query parameter.
- Full-page Question Details with metadata cards, analytics, and attachment support.

### Question CRUD
- Unified Editor for Create and Edit modes.
- Draft autosave to `localStorage` with recovery prompt.
- Unsaved changes detection with `beforeunload` guard.
- Duplicate, Soft Delete, Restore, and permission-gated Permanent Delete.
- Optimistic cache invalidation for instant list updates.

### AI Question Generation
- Provider-independent generation via `aiService.generateQuestions(request)`.
- Configurable parameters: Subject, Unit, Lesson, Difficulty, Question Type, Bloom's Taxonomy, Count, Custom Prompt.
- Asynchronous workflow with real-time progress indicator and cancellation support.
- Review-before-save workflow: Accept, Reject, Edit, or Regenerate each question independently.
- Observability tracking: duration, token usage, estimated cost, provider, model, status.

## Architecture

No new architectural patterns were introduced. All features were built strictly on the frozen v1.0.0 architecture baseline using:
- `BaseComponent` composition
- `StateMachine` for local state transitions
- `EventBus` for cross-component communication
- `QueryCache` and `RequestManager` for data layer efficiency
- Provider abstraction pattern for service independence

## Breaking Changes

None.
