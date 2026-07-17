# Monitoring Guide

## Endpoints
- **Liveness Probe**: `GET /health/liveness` - Returns `200 OK` if the Node process is running.
- **Readiness Probe**: `GET /health/readiness` - Returns `200 OK` if the application is ready to accept traffic (DB and Redis connected).
- **Metrics Endpoint**: `GET /metrics` - Exposes Prometheus-formatted metrics.

## Key Prometheus Metrics
Configure your Prometheus scraper to poll `/metrics` every 15s.

### System Metrics (Node.js)
- `exambank_process_cpu_user_seconds_total`
- `exambank_nodejs_heap_size_total_bytes`
- `exambank_nodejs_eventloop_lag_seconds`

### Application Metrics
- **`exambank_http_request_duration_ms`**: A histogram measuring request latency. Filter by `route`, `method`, or `status_code`. 
  - *Alerting Rule Example*: Fire alert if 95th percentile latency on `/engine/attempts` exceeds 500ms.

## Logging
Logs are emitted via the central `Logger` service (`src/shared/logger/`).
In production, logs are strictly formatted as JSON to allow easy ingestion by Datadog, ELK stack, or AWS CloudWatch.
