"""Mermaid architecture diagram generator for Archify mode."""
from typing import Dict, Any, List
from app.models.repository import RepositoryIntelligence


class DiagramGenerator:
    @staticmethod
    def generate_all_diagrams(repo: RepositoryIntelligence) -> Dict[str, str]:
        """
        Generates Mermaid diagram strings for 7 architectural perspectives:
        1. System Architecture
        2. Module Architecture
        3. Dependency Graph
        4. Data Flow
        5. API Flow
        6. Authentication Flow
        7. Database Schema / Storage Flow
        """
        return {
            "system": DiagramGenerator.system_architecture(repo),
            "module": DiagramGenerator.module_architecture(repo),
            "dependencies": DiagramGenerator.dependency_graph(repo),
            "data_flow": DiagramGenerator.data_flow_diagram(repo),
            "api_flow": DiagramGenerator.api_flow_diagram(repo),
            "auth_flow": DiagramGenerator.auth_flow_diagram(repo),
            "database": DiagramGenerator.database_diagram(repo),
        }

    @staticmethod
    def system_architecture(repo: RepositoryIntelligence) -> str:
        services = repo.architecture.services or ["CoreService", "Engine"]
        dbs = repo.architecture.databases or ["Database"]

        service_nodes = "\n    ".join([f"S_{i}[{s}]" for i, s in enumerate(services[:4])])
        db_nodes = "\n    ".join([f"DB_{i}[({d})]" for i, d in enumerate(dbs[:2])])
        service_links = "\n    ".join([f"GW --> S_{i}" for i in range(len(services[:4]))])
        db_links = "\n    ".join([f"S_{i} --> DB_0" for i in range(len(services[:4]))])

        return f"""graph TD
    Client["Client / User (Browser/App)"]
    GW["API Gateway / Router"]
    Client -->|HTTP/REST| GW
    subgraph Services ["Application Services Layer"]
    {service_nodes}
    end
    {service_links}
    subgraph Persistence ["Persistence & Storage"]
    {db_nodes}
    end
    {db_links}
    classDef client fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#fff;
    classDef service fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff;
    classDef db fill:#14532d,stroke:#22c55e,stroke-width:2px,color:#fff;
    class Client client;
    class GW service;
"""

    @staticmethod
    def module_architecture(repo: RepositoryIntelligence) -> str:
        important = repo.important_files[:6]
        nodes = []
        for i, f in enumerate(important):
            nodes.append(f"M_{i}[\"{f.name}\\n({f.language})\"]")
        node_str = "\n    ".join(nodes)
        return f"""graph LR
    subgraph CoreModules ["Core Code Modules ({repo.repository_name})"]
    {node_str}
    end
    M_0 -.->|imports| M_1
    M_0 -.->|uses| M_2
    classDef mod fill:#18181b,stroke:#a855f7,stroke-width:1.5px,color:#fff;
    class M_0,M_1,M_2,M_3,M_4,M_5 mod;
"""

    @staticmethod
    def dependency_graph(repo: RepositoryIntelligence) -> str:
        deps = repo.dependencies[:8]
        if not deps:
            return "graph TD\n    App[Application] --> StdLib[Standard Library]"
        dep_nodes = "\n    ".join([f"D_{i}[\"{d.name} ({d.version or 'latest'})\\n{d.ecosystem}\"]" for i, d in enumerate(deps)])
        links = "\n    ".join([f"Root --> D_{i}" for i in range(len(deps))])
        return f"""graph TD
    Root["{repo.repository_name} Manifest"]
    subgraph ExternalLibraries ["Vendor & Third-Party Dependencies"]
    {dep_nodes}
    end
    {links}
    classDef root fill:#312e81,stroke:#818cf8,stroke-width:2px,color:#fff;
    classDef dep fill:#1e293b,stroke:#06b6d4,stroke-width:1.5px,color:#fff;
    class Root root;
"""

    @staticmethod
    def data_flow_diagram(repo: RepositoryIntelligence) -> str:
        return f"""sequenceDiagram
    autonumber
    actor User as User / Client
    participant Frontend as Frontend View
    participant API as Controller / Handler
    participant Service as Business Domain
    participant DB as Database / Store

    User->>Frontend: Action Triggered
    Frontend->>API: HTTP Request (Payload)
    API->>Service: Execute Logic
    Service->>DB: Query / Mutate Records
    DB-->>Service: Return Result Set
    Service-->>API: Normalized Entity
    API-->>Frontend: JSON Response
    Frontend-->>User: Render State
"""

    @staticmethod
    def api_flow_diagram(repo: RepositoryIntelligence) -> str:
        return f"""graph LR
    Req["Incoming API Request"] --> RateLimit["Rate Limiter & CORS"]
    RateLimit --> AuthCheck{{"Authentication Check"}}
    AuthCheck -->|Valid Token| Router["Route Dispatcher"]
    AuthCheck -->|Invalid / Missing| Err["401 Unauthorized"]
    Router --> Controller["Endpoint Handler"]
    Controller --> Response["200 OK Response"]
    classDef check fill:#451a03,stroke:#f59e0b,stroke-width:2px,color:#fff;
    classDef pass fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef block fill:#4c0519,stroke:#f43f5e,stroke-width:2px,color:#fff;
    class AuthCheck check;
    class Controller,Response pass;
    class Err block;
"""

    @staticmethod
    def auth_flow_diagram(repo: RepositoryIntelligence) -> str:
        return f"""sequenceDiagram
    actor Client
    participant Auth as Auth Controller
    participant Security as Crypto / Token Service
    participant Store as Session / Token Store

    Client->>Auth: POST /auth/login (credentials)
    Auth->>Security: Verify Password Hash
    Security-->>Auth: Hash Verified
    Auth->>Security: Issue Signed JWT
    Security->>Store: Cache Active Token (Optional)
    Security-->>Auth: JWT Token
    Auth-->>Client: 200 OK {{ token, user }}
"""

    @staticmethod
    def database_diagram(repo: RepositoryIntelligence) -> str:
        return """erDiagram
    USERS ||--o{ SESSIONS : has
    USERS ||--o{ AUDIT_LOGS : generates
    USERS {
        string id PK
        string email
        string password_hash
        datetime created_at
    }
    SESSIONS {
        string id PK
        string user_id FK
        string token
        datetime expires_at
    }
    AUDIT_LOGS {
        string id PK
        string action
        string target_id
        datetime timestamp
    }
"""
