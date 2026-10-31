# RepoRAG — AI-Powered GitHub Repository Intelligence Platform

<p align="center">
  <code style="font-size: 24px; font-weight: bold; color: #00f2fe;">&lt; ◉ &gt; RepoRAG</code><br>
  <b>"Understand Any Repository. Ask Anything."</b><br>
  <i>Your Codebase. Indexed. Understood. Intelligent.</i>
</p>

---

## 🌟 Overview

RepoRAG turns any public or token-authenticated GitHub repository into an interactive, deeply indexed intelligence graph with hybrid retrieval-augmented generation (RAG), visual architecture diagrams (Archify), an interactive Git timeline, codebase health telemetry, and a full-featured Chrome extension side-panel and GitHub web integration.

Paste any repository URL (e.g. `https://github.com/facebook/react` or `https://github.com/owner/repository`) and RepoRAG will automatically:
1. **Validate and Ingest** the repository hierarchy and commits.
2. **Scan & Parse** source code files with multi-language AST symbol extractors (Python, JS, TS, Java, Go, Rust, C/C++).
3. **Analyze Package Manifests** (`package.json`, `requirements.txt`, `pom.xml`, `go.mod`, `Cargo.toml`).
4. **Construct Knowledge Graphs** mapping repositories, files, classes, methods, endpoints, and calls.
5. **Generate Archify Diagrams** using dynamic Mermaid.js visualizations (System, Modules, Dependencies, Data Flow, Auth Flow, and Database).
6. **Power Grounded RAG Inquiries** with 4-way hybrid search (Vector + BM25 + Symbol + Filepath) and strict evidence attribution.
7. **Evaluate Codebase Health & Security** with blast-radius change impact analysis.

---

## 🚀 Key Features

| Capability | Description |
| :--- | :--- |
| **Grounded AI RAG** | Natural-language questions answered strictly from retrieved code chunks with verifiable file citations and confidence scores. |
| **Archify Engine** | Instant visual software architecture generation across 7 views with zoom, pan, and SVG export. |
| **Interactive Source Tree** | Virtualized folder tree, language indicators, file complexity, and AI centrality metrics. |
| **Knowledge Graph** | 2D node-edge relationship visualizer connecting files, classes, functions, APIs, and commits. |
| **Git GUI & Churn Timeline** | Commit timeline, author statistics, branch viewer, and changed file inspection. |
| **Change Impact Engine** | Calculate blast radius, affected APIs, and regression risk before touching code. |
| **Security Pattern Scan** | Static heuristic analysis identifying hardcoded secrets, unsafe eval, and SQL patterns. |
| **New Developer Mode** | AI-generated onboarding guides detailing spin-up steps, main logic, and common pitfalls. |
| **Chrome Extension (MV3)** | Floating badge directly on GitHub repositories + Chrome Side Panel integration. |

---

## 🏗️ Platform Architecture

```
                              ┌──────────────────────────────────────────────┐
                              │            RepoRAG Chrome Extension          │
                              │  - Manifest V3 Sidepanel & GitHub Injected   │
                              └──────────────────────┬───────────────────────┘
                                                     │ (REST / SSE / WS)
                                                     ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               RepoRAG Web Dashboard (Vite + React + TS)                │
│ ┌───────────────┬──────────────────┬──────────────┬───────────────┬──────────────────┐ │
│ │  Hero Input   │ Source Tree & AST│ Knowledge    │ Archify       │ Git Map & GUI    │ │
│ │  & Ingestion  │ Inspector        │ Graph (2D/3D)│ (Mermaid/SVG) │ & Churn Timeline │ │
│ └───────────────┴──────────────────┴──────────────┴───────────────┴──────────────────┘ │
└────────────────────────────────────────────┬───────────────────────────────────────────┘
                                             │ HTTP / SSE / Streaming
                                             ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              FastAPI Backend Engine (Python 3.14)                      │
│                                                                                        │
│  ┌───────────────────┐    ┌─────────────────────┐    ┌───────────────────────────────┐ │
│  │ Ingestion Engine  │───▶│ Code Understanding  │───▶│ Knowledge Graph Builder       │ │
│  │ - GitHub API      │    │ - AST Parsing       │    │ - Nodes: Files, Classes, Funcs│ │
│  │ - Git Shallow     │    │ - Multi-Lang Parser │    │ - Edges: IMPORTS, CALLS, DEPS │ │
│  │ - Ignore Rules    │    │ - Symbol Extractor  │    └───────────────┬───────────────┘ │
│  └───────────────────┘    └─────────────────────┘                    │                 │
│                                      │                               ▼                 │
│                                      ▼                     ┌─────────────────────────┐ │
│  ┌───────────────────┐    ┌─────────────────────┐          │ Architecture & Health   │ │
│  │ LLM Providers     │◀───│ Hybrid RAG Engine   │◀─────────│ - Archify Engine        │ │
│  │ - Gemini Provider │    │ - Semantic Chunks   │          │ - Security Pattern Scan │ │
│  │ - Local / Mock    │    │ - Vector Store      │          │ - Complexity Scoring    │ │
│  │ - Grounded Synth  │    │ - BM25 + Vector + KG│          │ - Onboarding Synthesis  │ │
│  └───────────────────┘    └─────────────────────┘          └─────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Quickstart & Local Development

### 1. Prerequisites
- **Node.js** v20+ and npm
- **Python** 3.11+ (Python 3.14 supported)

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python run.py
```
Backend runs locally at: `http://127.0.0.1:8000` (API documentation at `/docs`).

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs locally at: `http://127.0.0.1:5173`.

### 4. Chrome Extension Installation (Manifest V3)
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top right.
3. Click **Load unpacked** and select the `/extension` directory.
4. Visit any GitHub repository (e.g. `https://github.com/facebook/react`) to see the floating `< ◉ > Analyze with RepoRAG` action!

---

## 🧪 Running Tests

### Backend Unit & Integration Tests
```bash
cd backend
export PYTHONPATH=.
venv/bin/pytest tests -v
```
All 7 test suites verify:
- Health check & API root
- URL validation
- Demo repository pre-loading
- Source tree generation
- Knowledge graph & Archify diagram generation
- Hybrid search & Grounded RAG Chat
- Codebase health telemetry & change impact calculation

---

## 📄 Documentation Links
- [Architecture Blueprint](docs/architecture.md)
- [RAG Retrieval & Grounding](docs/rag.md)
- [Repository Ingestion Engine](docs/ingestion.md)
- [Chrome Extension Guide](docs/extension.md)
- [API Specification](docs/api.md)
- [Security & Privacy](docs/security.md)
