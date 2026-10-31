# RepoRAG Architecture Documentation

## Overview
RepoRAG is designed around modular, decoupled subsystems that process unstructured GitHub code repositories into structured knowledge graphs and verifiable vector indices.

### Subsystems:
1. **Ingestion & Scanner (`app.ingestion`)**: Handles GitHub REST API tree retrieval, branch detection, and filtering out build artifacts and binary assets.
2. **Parsing & AST Analysis (`app.parsing`)**: Multi-language symbol identification extracting classes, functions, routes, database queries, and imports.
3. **Knowledge Graph Engine (`app.architecture.graph_builder`)**: Connects semantic code entities with directed relation edges (`CONTAINS`, `IMPORTS`, `CALLS`, `DEPENDS_ON`).
4. **Archify Engine (`app.architecture.diagram_generator`)**: Generates Mermaid.js architecture diagrams across 7 perspectives.
5. **Hybrid RAG Retriever (`app.rag`)**: Combines vector cosine similarity, BM25 token overlap, AST symbol matching, and path heuristics.
