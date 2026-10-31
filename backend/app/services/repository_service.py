"""Repository ingestion and analysis orchestration service with commit caching and demo mode."""
import asyncio
import time
from typing import Dict, Any, Optional, List
from app.models.repository import RepositoryIntelligence, IngestionStage, GitCommit
from app.models.file import FileInfo, TreeNode
from app.models.dependency import DependencyItem
from app.models.graph import KnowledgeGraph
from app.ingestion.github_client import GitHubClient
from app.ingestion.file_scanner import FileScanner
from app.parsing.language_detector import LanguageDetector
from app.parsing.symbol_extractor import SymbolExtractor
from app.parsing.dependency_analyzer import DependencyAnalyzer
from app.architecture.architecture_analyzer import ArchitectureAnalyzer
from app.architecture.graph_builder import KnowledgeGraphBuilder
from app.architecture.diagram_generator import DiagramGenerator
from app.rag.chunker import SemanticChunker, CodeChunk
from app.rag.embeddings import get_embedding_provider
from app.rag.vector_store import vector_store
from app.services.analysis_service import AnalysisService
from app.core.logging import logger


class RepositoryService:
    def __init__(self):
        # In-memory storage of analyzed repositories by repository_id
        self.repositories: Dict[str, RepositoryIntelligence] = {}
        self.source_trees: Dict[str, TreeNode] = {}
        self.knowledge_graphs: Dict[str, KnowledgeGraph] = {}
        self.all_chunks: Dict[str, List[CodeChunk]] = {}
        self.file_contents: Dict[str, Dict[str, str]] = {}
        self.diagrams: Dict[str, Dict[str, str]] = {}
        # Job status tracking
        self.job_progress: Dict[str, Dict[str, Any]] = {}

        # Initialize demo repositories
        self._init_demo_repositories()

    def _init_demo_repositories(self):
        """Pre-indexes realistic synthetic demo repositories for instant zero-config exploration."""
        demo_id = "demo-fullstack-ai"
        
        # Files for demo
        demo_files_data = [
            ("package.json", '{\n  "name": "nexus-platform",\n  "version": "2.4.0",\n  "dependencies": {\n    "react": "^18.2.0",\n    "fastapi": "0.110.0",\n    "jsonwebtoken": "^9.0.0",\n    "prisma": "^5.10.0",\n    "tailwindcss": "^3.4.0"\n  }\n}', "JSON"),
            ("README.md", "# Nexus Platform\n\nAI-powered knowledge engine and developer workspace.\n\n## Architecture\nBuilt with Next.js frontend, FastAPI Python microservices, and PostgreSQL.\n\n## Getting Started\nRun `npm run dev` to start the frontend and `uvicorn main:app` for backend.", "Markdown"),
            ("src/main.tsx", "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport { App } from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(<App />);", "TypeScript (React)"),
            ("src/App.tsx", "import React, { useState } from 'react';\nimport { AuthProvider } from './services/auth';\nimport { Dashboard } from './components/Dashboard';\n\nexport function App() {\n  return (\n    <AuthProvider>\n      <Dashboard />\n    </AuthProvider>\n  );\n}", "TypeScript (React)"),
            ("src/services/auth.ts", "import jwt from 'jsonwebtoken';\n\nexport class AuthService {\n  private token: string | null = null;\n\n  async login(username: string, pass: string): Promise<string> {\n    // Handles user authentication, token issuance and permission verification\n    this.token = 'demo-jwt-session-token';\n    return this.token;\n  }\n\n  logout(): void {\n    this.token = null;\n  }\n}", "TypeScript"),
            ("src/components/Dashboard.tsx", "import React from 'react';\nimport { AuthService } from '../services/auth';\n\nexport const Dashboard = () => {\n  return <div className=\"dashboard\">RepoRAG Active Intelligence</div>;\n};", "TypeScript (React)"),
            ("backend/main.py", "from fastapi import FastAPI, Depends\nfrom backend.auth import verify_token\nfrom backend.router import api_router\n\napp = FastAPI(title='Nexus Core API')\napp.include_router(api_router, prefix='/api/v1')\n\n@app.get('/health')\ndef health_check():\n    return {'status': 'healthy'}", "Python"),
            ("backend/auth.py", "from fastapi import HTTPException, Security\n\ndef verify_token(token: str):\n    \"\"\"Validates incoming JWT credentials and claims.\"\"\"\n    if not token:\n        raise HTTPException(status_code=401, detail='Token missing')\n    return {'user_id': 'usr_99', 'role': 'admin'}", "Python"),
            ("backend/router.py", "from fastapi import APIRouter\nfrom backend.database import get_db\n\napi_router = APIRouter()\n\n@api_router.get('/documents')\ndef list_documents(db=get_db()):\n    return [{'id': 1, 'title': 'Repository Architecture'}]", "Python"),
            ("backend/database.py", "def get_db():\n    \"\"\"Database session factory connecting to PostgreSQL persistent store.\"\"\"\n    return {'engine': 'PostgreSQL', 'pool_size': 20}", "Python")
        ]

        file_infos: List[FileInfo] = []
        contents_dict: Dict[str, str] = {}
        all_chunks: List[CodeChunk] = []

        for path, code, lang in demo_files_data:
            contents_dict[path] = code
            syms, imps, calls = SymbolExtractor.extract_from_file(path, code, lang)
            lines = code.splitlines()
            fi = FileInfo(
                path=path,
                name=path.split("/")[-1],
                extension="." + path.split(".")[-1],
                language=lang,
                size_bytes=len(code.encode("utf-8")),
                line_count=len(lines),
                complexity_score=max(1, len(syms) * 2),
                ai_importance_score=FileScanner().calculate_initial_importance(path),
                symbols=syms,
                imports=imps,
                calls=calls
            )
            file_infos.append(fi)
            chunks = SemanticChunker.chunk_file(demo_id, "main", path, lang, code, syms, imps)
            all_chunks.extend(chunks)

        scanner = FileScanner()
        tree_items = [{"path": p, "type": "blob", "size": len(c)} for p, c, _ in demo_files_data]
        root_tree, _, f_count, d_count = scanner.build_tree(tree_items)

        deps = [
            DependencyItem(name="react", version="^18.2.0", ecosystem="npm", purpose="Frontend component rendering"),
            DependencyItem(name="fastapi", version="0.110.0", ecosystem="pypi", purpose="High performance REST backend"),
            DependencyItem(name="jsonwebtoken", version="^9.0.0", ecosystem="npm", purpose="JWT Authentication & Cryptography"),
            DependencyItem(name="prisma", version="^5.10.0", ecosystem="npm", purpose="PostgreSQL ORM"),
            DependencyItem(name="tailwindcss", version="^3.4.0", ecosystem="npm", purpose="Design system styling tokens")
        ]

        commits = [
            {"sha": "a1b2c3d", "commit": {"message": "feat: integrate RepoRAG grounded search pipeline"}},
            {"sha": "e4f5g6h", "commit": {"message": "refactor(auth): add JWT token verification middleware"}},
            {"sha": "i7j8k9l", "commit": {"message": "chore: setup initial architecture and schema"}}
        ]

        git_commits = [
            GitCommit(hash="a1b2c3d4e5", short_hash="a1b2c3d", author="Alex Mercer", date="2026-10-05 14:22", message="feat: integrate RepoRAG grounded search pipeline", changed_files=["backend/router.py", "src/App.tsx"]),
            GitCommit(hash="e4f5g6h7i8", short_hash="e4f5g6h", author="Sarah Chen", date="2026-10-04 11:05", message="refactor(auth): add JWT token verification middleware", changed_files=["backend/auth.py", "src/services/auth.ts"]),
            GitCommit(hash="i7j8k9l0m1", short_hash="i7j8k9l", author="Dev Team", date="2026-10-01 09:00", message="chore: setup initial architecture and schema", changed_files=["package.json", "README.md"])
        ]

        arch = ArchitectureAnalyzer.analyze(tree_items, deps, file_infos)
        kg = KnowledgeGraphBuilder.build("NexusPlatform", file_infos, deps, commits)

        repo_intel = RepositoryIntelligence(
            id=demo_id,
            owner="reporag-demo",
            repository_name="nexus-platform",
            full_name="reporag-demo/nexus-platform",
            html_url="https://github.com/reporag-demo/nexus-platform",
            description="Autonomous developer knowledge engine and AI workspace.",
            default_branch="main",
            current_commit_sha="a1b2c3d",
            stars=1420,
            forks=210,
            languages={"TypeScript": 45.0, "Python": 35.0, "Markdown": 12.0, "JSON": 8.0},
            frameworks=["React", "FastAPI", "Prisma", "Tailwind CSS"],
            dependencies=deps,
            file_count=len(file_infos),
            directory_count=d_count,
            contributor_count=4,
            commit_count=185,
            architecture=arch,
            health=AnalysisService.calculate_health(file_infos, {"TypeScript": 45.0, "Python": 35.0}),
            ai_usage=AnalysisService.detect_ai_usage(
                file_infos,
                contents_dict,
                list(contents_dict.keys()) + [".github/copilot-instructions.md"],
                git_commits
            ),
            important_files=sorted(file_infos, key=lambda f: f.ai_importance_score, reverse=True)[:5],
            recent_commits=git_commits,
            status=IngestionStage.READY,
            progress_percentage=100,
            status_message="Demo repository ready",
            overview_summary="Nexus Platform is a modern full-stack web application combining a React 18 frontend with a FastAPI backend and PostgreSQL persistence.",
            summary_30s="A full-stack AI platform built on React, FastAPI, and PostgreSQL with JWT auth and modular routing.",
            summary_2m="Nexus Platform isolates client UI (React, Vite, Tailwind) from backend microservices (FastAPI). Authentication is governed by JWT verification in `backend/auth.py` and client-side `AuthService`. Data persistence is managed via Prisma PostgreSQL models.",
            summary_5m="Comprehensive architecture deep-dive: The system implements a Client-Server Layered Architecture. The frontend uses React functional components wrapped with AuthProvider. API endpoints are registered via FastAPI routers under `/api/v1`. Security boundaries enforce cryptographic token inspection before granting access to resources."
        )

        self.repositories[demo_id] = repo_intel
        self.source_trees[demo_id] = root_tree
        self.knowledge_graphs[demo_id] = kg
        self.all_chunks[demo_id] = all_chunks
        self.file_contents[demo_id] = contents_dict
        self.diagrams[demo_id] = DiagramGenerator.generate_all_diagrams(repo_intel)

        # Index vectors for demo
        emb_provider = get_embedding_provider()
        doc_texts = [c.content for c in all_chunks]
        # Synchronous vector indexing for demo repository
        vectors = [emb_provider._vectorize(t) for t in doc_texts]
        vector_store.add_chunks(demo_id, all_chunks, vectors)

    async def _index_chunks_async(self, repo_id: str, chunks: List[CodeChunk], texts: List[str]):
        emb_provider = get_embedding_provider()
        vectors = await emb_provider.embed_documents(texts)
        vector_store.add_chunks(repo_id, chunks, vectors)

    async def start_analysis_job(self, repo_url: str, job_id: str, token: Optional[str] = None) -> str:
        """Asynchronously begins the multi-stage ingestion pipeline."""
        gh = GitHubClient(token=token)
        owner, repo = gh.parse_repo_url(repo_url)
        repo_id = f"{owner}/{repo}".lower().replace("/", "--")

        # Caching check: if already indexed, return immediately
        if repo_id in self.repositories and self.repositories[repo_id].status == IngestionStage.READY:
            self.job_progress[job_id] = {
                "job_id": job_id,
                "repository_id": repo_id,
                "stage": IngestionStage.READY.value,
                "progress": 100,
                "message": "Loaded repository from cache."
            }
            return repo_id

        # Initialize progress state
        self.job_progress[job_id] = {
            "job_id": job_id,
            "repository_id": repo_id,
            "stage": IngestionStage.FETCHING.value,
            "progress": 10,
            "message": f"Fetching repository metadata for {owner}/{repo}..."
        }

        # Spawn background ingestion task
        asyncio.create_task(self._run_ingestion_pipeline(job_id, repo_id, owner, repo, gh))
        return repo_id

    async def _run_ingestion_pipeline(self, job_id: str, repo_id: str, owner: str, repo: str, gh: GitHubClient):
        try:
            # 1. Fetch metadata
            self._update_job(job_id, IngestionStage.FETCHING, 15, "Fetching GitHub repository details...")
            meta = await gh.get_repository_metadata(owner, repo)
            default_branch = meta.get("default_branch", "main")

            # 2. Fetch tree & files (API or Git Clone Fallback)
            from app.ingestion.repository_cloner import RepositoryCloner
            cloner = RepositoryCloner()
            use_cloner = meta.get("rate_limited", False)
            tree_items = []
            contents_dict: Dict[str, str] = {}
            git_commits: List[GitCommit] = []
            raw_commits: List[Dict[str, Any]] = []

            if not use_cloner:
                try:
                    self._update_job(job_id, IngestionStage.SCANNING, 30, "Scanning files and source tree...")
                    tree_items = await gh.get_repository_tree(owner, repo, default_branch)
                except Exception as e:
                    logger.warning(f"GitHub API tree fetch failed ({e}). Switching to Git shallow clone...")
                    use_cloner = True

            if use_cloner:
                self._update_job(job_id, IngestionStage.FETCHING, 25, "Rate limit bypassed: cloning via Git smart HTTP...")
                target_dir, detected_branch = await cloner.clone_repository(owner, repo)
                default_branch = detected_branch
                self._update_job(job_id, IngestionStage.SCANNING, 35, "Scanning cloned repository files...")
                tree_items, contents_dict = cloner.scan_cloned_files(target_dir)
                git_commits = cloner.get_commit_history(target_dir, limit=15)
                raw_commits = [{"sha": c.hash, "commit": {"message": c.message, "author": {"name": c.author, "date": c.date}}} for c in git_commits]

            # 3. Filter files & build tree
            self._update_job(job_id, IngestionStage.PARSING, 45, "Parsing code structure and symbols...")
            scanner = FileScanner()
            root_tree, valid_files, f_count, d_count = scanner.build_tree(tree_items)

            # 4. Fetch content & parse AST symbols
            file_infos: List[FileInfo] = []
            all_chunks: List[CodeChunk] = []

            # Prioritize top 50 files for deep content ingestion & symbol extraction
            top_files = sorted(valid_files, key=lambda x: x["importance"], reverse=True)[:50]

            for tf in top_files:
                path = tf["path"]
                content = contents_dict.get(path)
                if not content:
                    content = await gh.get_file_content(owner, repo, default_branch, path)
                    if content:
                        contents_dict[path] = content

                if content:
                    lang = LanguageDetector.detect_language(path)
                    syms, imps, calls = SymbolExtractor.extract_from_file(path, content, lang)
                    lines = content.splitlines()

                    fi = FileInfo(
                        path=path,
                        name=tf["name"],
                        extension="." + path.split(".")[-1] if "." in path else "",
                        language=lang,
                        size_bytes=len(content.encode("utf-8")),
                        line_count=len(lines),
                        complexity_score=tf["complexity"],
                        ai_importance_score=tf["importance"],
                        symbols=syms,
                        imports=imps,
                        calls=calls
                    )
                    file_infos.append(fi)
                    chunks = SemanticChunker.chunk_file(repo_id, default_branch, path, lang, content, syms, imps)
                    all_chunks.extend(chunks)

            # 5. Dependency extraction from manifests
            self._update_job(job_id, IngestionStage.INDEXING, 60, "Analyzing package dependencies...")
            dependencies: List[DependencyItem] = []
            for path, content in contents_dict.items():
                manifest = DependencyAnalyzer.parse_manifest(path, content)
                if manifest:
                    dependencies.extend(manifest.dependencies)

            # 6. Embeddings and Vector indexing
            self._update_job(job_id, IngestionStage.EMBEDDING, 75, "Generating embeddings and indexing vectors...")
            emb_provider = get_embedding_provider()
            doc_texts = [c.content for c in all_chunks]
            if doc_texts:
                vectors = await emb_provider.embed_documents(doc_texts)
                vector_store.add_chunks(repo_id, all_chunks, vectors)

            # 7. Knowledge Graph & Architecture
            self._update_job(job_id, IngestionStage.GRAPH_BUILDING, 85, "Building knowledge graph and Archify diagrams...")
            if not raw_commits:
                raw_commits = await gh.get_recent_commits(owner, repo, limit=10)
                for c in raw_commits:
                    sha = c.get("sha", "")
                    git_commits.append(GitCommit(
                        hash=sha,
                        short_hash=sha[:7],
                        author=c.get("commit", {}).get("author", {}).get("name", "Contributor"),
                        date=c.get("commit", {}).get("author", {}).get("date", "")[:10],
                        message=c.get("commit", {}).get("message", "").split("\n")[0][:80]
                    ))

            kg = KnowledgeGraphBuilder.build(repo, file_infos, dependencies, raw_commits)
            arch = ArchitectureAnalyzer.analyze(valid_files, dependencies, file_infos)

            # 8. Languages breakdown, Health & AI Code Detection
            self._update_job(job_id, IngestionStage.ANALYZING, 95, "Calculating codebase health and AI usage detection meter...")
            all_paths = [f["path"] for f in valid_files]
            langs = LanguageDetector.calculate_language_breakdown(all_paths)
            health = AnalysisService.calculate_health(file_infos, langs)
            ai_usage_report = AnalysisService.detect_ai_usage(file_infos, contents_dict, all_paths, git_commits)

            # Create RepositoryIntelligence object
            repo_intel = RepositoryIntelligence(
                id=repo_id,
                owner=owner,
                repository_name=repo,
                full_name=f"{owner}/{repo}",
                html_url=f"https://github.com/{owner}/{repo}",
                description=meta.get("description", "GitHub repository indexed with RepoRAG"),
                default_branch=default_branch,
                current_commit_sha=raw_commits[0].get("sha", "latest") if raw_commits else "main",
                is_private=meta.get("private", False),
                stars=meta.get("stargazers_count", 0),
                forks=meta.get("forks_count", 0),
                languages=langs,
                frameworks=[d.name for d in dependencies if d.ecosystem == "npm" or d.ecosystem == "pypi"][:6],
                dependencies=dependencies,
                file_count=f_count,
                directory_count=d_count,
                contributor_count=max(1, len(set([c.author for c in git_commits]))),
                commit_count=len(git_commits),
                architecture=arch,
                health=health,
                ai_usage=ai_usage_report,
                important_files=sorted(file_infos, key=lambda f: f.ai_importance_score, reverse=True)[:8],
                recent_commits=git_commits,
                status=IngestionStage.READY,
                progress_percentage=100,
                status_message="Repository ready for intelligence exploration.",
                overview_summary=f"{repo} is an active software codebase built with {', '.join(list(langs.keys())[:3])}.",
                summary_30s=f"{repo} features a {arch.style} structure primarily utilizing {', '.join(list(langs.keys())[:2])}.",
                summary_2m=f"{repo} by {owner} implements a {arch.style}. Entry points include {', '.join(arch.entry_points) or 'root definitions'}. Key storage includes {', '.join(arch.databases)}.",
                summary_5m=f"In-depth architectural review of {owner}/{repo}: {arch.data_flow}"
            )

            # Cache results
            self.repositories[repo_id] = repo_intel
            self.source_trees[repo_id] = root_tree
            self.knowledge_graphs[repo_id] = kg
            self.all_chunks[repo_id] = all_chunks
            self.file_contents[repo_id] = contents_dict
            self.diagrams[repo_id] = DiagramGenerator.generate_all_diagrams(repo_intel)

            self._update_job(job_id, IngestionStage.READY, 100, "Repository intelligence index complete.")
            logger.info(f"Successfully indexed repository {repo_id}")

        except Exception as e:
            logger.error(f"Ingestion failed for {repo_id}: {e}", exc_info=True)
            self._update_job(job_id, IngestionStage.FAILED, 0, f"Analysis error: {str(e)}", error=str(e))

    def _update_job(self, job_id: str, stage: IngestionStage, progress: int, message: str, error: Optional[str] = None):
        if job_id in self.job_progress:
            self.job_progress[job_id]["stage"] = stage.value
            self.job_progress[job_id]["progress"] = progress
            self.job_progress[job_id]["message"] = message
            if error:
                self.job_progress[job_id]["error"] = error


# Global singleton instance
repository_service = RepositoryService()
