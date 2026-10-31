"""Architecture style, pattern, and entry point analyzer."""
from typing import List, Dict, Any, Optional
from app.models.repository import ArchitectureOverview
from app.models.file import FileInfo


class ArchitectureAnalyzer:
    @staticmethod
    def analyze(files: List[Dict[str, Any]], dependencies: List[Any], file_objects: List[FileInfo]) -> ArchitectureOverview:
        file_paths = [f["path"] for f in files]
        paths_lower = [p.lower() for p in file_paths]

        # 1. Entry points detection
        entry_points = []
        fe_entry = None
        be_entry = None

        for p in file_paths:
            pl = p.lower()
            if any(k in pl for k in ["src/main.tsx", "src/index.tsx", "src/app.tsx", "src/index.js", "pages/_app.tsx", "app/layout.tsx"]):
                fe_entry = p
                entry_points.append(p)
            elif any(k in pl for k in ["main.py", "app/main.py", "server.js", "server.ts", "cmd/main.go", "src/main/java/", "src/main.rs"]):
                be_entry = p
                entry_points.append(p)

        # 2. Architecture style heuristics
        style = "Modular Monolith"
        description = "Unified modular architecture with structured separation of concerns."

        if any("docker-compose" in pl for pl in paths_lower) and any("services/" in pl for pl in paths_lower):
            style = "Microservices"
            description = "Decoupled distributed services running with container orchestration."
        elif any("controllers/" in pl for pl in paths_lower) and any("models/" in pl for pl in paths_lower) and any("views/" in pl for pl in paths_lower):
            style = "MVC (Model-View-Controller)"
            description = "Classic Model-View-Controller pattern separating business logic, state, and presentation."
        elif any("domain/" in pl for pl in paths_lower) and any("infrastructure/" in pl for pl in paths_lower):
            style = "Hexagonal / Clean Architecture"
            description = "Domain-driven architecture isolating core business domain from external ports & adapters."
        elif any("backend/" in pl for pl in paths_lower) and any("frontend/" in pl for pl in paths_lower):
            style = "Full-Stack Client-Server (Layered)"
            description = "Separated frontend SPA/client consuming backend REST/GraphQL services."
        elif any("kafka" in pl or "rabbit" in pl or "events/" in pl for pl in paths_lower):
            style = "Event-Driven Architecture"
            description = "Asynchronous messaging and event-stream based processing."

        # 3. Detect services
        services = []
        for p in file_paths:
            pl = p.lower()
            if "service" in pl and pl.endswith((".ts", ".js", ".py", ".java", ".go")):
                services.append(p.split("/")[-1].split(".")[0])

        # 4. Detect databases
        databases = []
        dep_names = [d.name.lower() for d in dependencies] if dependencies else []
        if any("postgres" in d or "psycopg" in d or "pg" in d for d in dep_names) or any("postgres" in pl for pl in paths_lower):
            databases.append("PostgreSQL")
        if any("mysql" in d for d in dep_names) or any("mysql" in pl for pl in paths_lower):
            databases.append("MySQL")
        if any("mongo" in d for d in dep_names) or any("mongo" in pl for pl in paths_lower):
            databases.append("MongoDB")
        if any("sqlite" in d for d in dep_names) or any("sqlite" in pl for pl in paths_lower):
            databases.append("SQLite")
        if any("redis" in d for d in dep_names):
            databases.append("Redis (Cache)")
        if not databases:
            databases.append("In-Memory / Document Store")

        # 5. Detect APIs
        apis = []
        for fo in file_objects:
            for sym in fo.symbols:
                if sym.symbol_type.value == "api_endpoint":
                    apis.append(sym.name)

        data_flow = (
            f"Client requests arrive at {'frontend (' + fe_entry + ')' if fe_entry else 'entrypoint'}, "
            f"route through {'backend (' + be_entry + ')' if be_entry else 'service layer'}, "
            f"process business logic across {len(services) or 1} services, "
            f"and persist data into {', '.join(databases)}."
        )

        return ArchitectureOverview(
            style=style,
            description=description,
            entry_points=entry_points[:5],
            frontend_entry=fe_entry,
            backend_entry=be_entry,
            services=list(set(services))[:8],
            databases=databases,
            apis=apis[:10],
            data_flow=data_flow
        )
