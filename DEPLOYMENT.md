# Production deployment

## Current production protections

- Express starts only after MongoDB connects, fails closed without a 32+ character JWT secret, has readiness/liveness endpoints, graceful shutdown, request IDs, JSON request logs, and optional token-protected Prometheus metrics.
- CORS accepts only `CLIENT_ORIGIN` entries (comma-separated for multiple frontends); HTTPS and HSTS should terminate at the cloud load balancer or ingress. Set `TRUST_PROXY_HOPS` to the exact trusted proxy count.
- Public registration always creates customer accounts. Create the first admin through a controlled deployment/seed process; never expose demo credentials.
- Service menu responses are cached for 60 seconds in each process and invalidated after admin updates. Booking queries are paginated (50 by default, maximum 100).
- API rate limiting currently uses an in-process memory bucket. This protects a single instance; it does not coordinate replicas and resets when an instance restarts. For multiple replicas, replace this middleware with a shared Redis-backed limiter before opening public traffic.
- Twilio WhatsApp requests have an 8-second timeout, bounded retry for transient errors, HTTP/JSON/SID response validation, and a persisted simulated fallback status. Since Twilio message creation is a POST, a timeout after Twilio accepts a message can result in a duplicate on retry; reconcile delivery using Twilio callbacks before enabling retries at high volume.

## Deploy

1. Build the container with `docker build -t velvet-vine .` and deploy it to a managed container platform with at least two replicas behind a health-checked HTTPS load balancer. Configure the variables in `server/.env.example` as managed secrets. Set `VITE_API_URL` at frontend build time to the public API URL.
2. Use MongoDB Atlas or a managed MongoDB replica set in the same region, enable automated backups and point-in-time recovery, and restrict network access to the application. Set `MONGO_MAX_POOL_SIZE` based on replica count and the database connection limit (total app pool must stay below the provider limit).
3. Publish `client/dist` through a CDN with immutable hashed asset caching; serve `index.html` with a short/no-cache policy. Enable TLS, WAF/DDoS protections, and health checks at the load balancer. The container serves the API only; use a CDN/object store or static host for the frontend.
4. Set `METRICS_TOKEN` and scrape `/api/metrics`; probe `/api/health` for liveness and `/api/ready` for readiness. Alert on elevated 5xx/429 rates, readiness failures, p95 latency, database pool saturation, and Twilio fallback/error logs. Forward JSON stdout/stderr to a centralized log service.
5. Keep `SEED_DEMO_DATA=false` in production. Provision the first admin through a one-time trusted operation, set a unique `ADMIN_PASSWORD`, and rotate any credentials that were ever committed or shared.

The bundled metrics are process-local counters, not a substitute for an APM. The in-memory limiter and service cache need shared Redis implementations if strict cross-replica consistency is required. Two or more app replicas plus a managed database/CDN/load balancer provide the deployment shape for 10,000+ concurrent clients; capacity must still be established with load tests against the target hosting plan and database.
