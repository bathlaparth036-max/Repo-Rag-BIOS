# RepoRAG REST API Reference

Interactive OpenAPI documentation is served at `http://127.0.0.1:8000/docs`.

### Key Endpoints:
- `POST /api/repositories/validate` — Validate GitHub URL and accessibility
- `GET /api/repositories/demo` — Load pre-indexed demo repository
- `GET /api/repositories/{id}` — Fetch Repository Intelligence Object
- `GET /api/repositories/{id}/tree` — Retrieve nested source tree
- `GET /api/repositories/{id}/graph` — Retrieve knowledge graph nodes & edges
- `GET /api/repositories/{id}/diagrams` — Retrieve generated Mermaid Archify diagrams
- `POST /api/ingestion/analyze` — Queue background ingestion job
- `GET /api/ingestion/status/{job_id}` — Polling job progress & stage
- `POST /api/chat/ask` — Ask natural language questions with grounded evidence
- `POST /api/search/hybrid` — 4-way hybrid search with score breakdown
- `GET /api/health/{id}` — Codebase health and maintainability telemetry
- `GET /api/security/{id}/scan` — Potential security pattern audit
- `POST /api/health/{id}/change-impact` — Calculate blast radius of a file modification
- `DELETE /api/repositories/{id}` — Purge all stored repository data (Privacy)
