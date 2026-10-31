"""Package manifest parser for multi-ecosystem dependency extraction."""
import json
import re
from typing import List, Dict, Any, Optional
from app.models.dependency import DependencyItem, DependencyManifest


class DependencyAnalyzer:
    @staticmethod
    def parse_manifest(file_path: str, content: str) -> Optional[DependencyManifest]:
        name = file_path.split("/")[-1].lower()

        if name == "package.json":
            return DependencyAnalyzer._parse_package_json(file_path, content)
        elif name in ["requirements.txt", "requirements-dev.txt"]:
            return DependencyAnalyzer._parse_requirements_txt(file_path, content)
        elif name == "cargo.toml":
            return DependencyAnalyzer._parse_cargo_toml(file_path, content)
        elif name == "go.mod":
            return DependencyAnalyzer._parse_go_mod(file_path, content)
        elif name == "pom.xml":
            return DependencyAnalyzer._parse_pom_xml(file_path, content)
        elif name == "pyproject.toml":
            return DependencyAnalyzer._parse_pyproject_toml(file_path, content)
        return None

    @staticmethod
    def _parse_package_json(file_path: str, content: str) -> DependencyManifest:
        items = []
        try:
            data = json.loads(content)
            deps = data.get("dependencies", {})
            dev_deps = data.get("devDependencies", {})

            for name, version in deps.items():
                items.append(DependencyItem(
                    name=name,
                    version=str(version),
                    ecosystem="npm",
                    is_dev=False,
                    purpose=DependencyAnalyzer._infer_purpose(name),
                    risk_level="Low"
                ))
            for name, version in dev_deps.items():
                items.append(DependencyItem(
                    name=name,
                    version=str(version),
                    ecosystem="npm",
                    is_dev=True,
                    purpose="Development tool / Build pipeline",
                    risk_level="Low"
                ))
        except Exception:
            pass
        return DependencyManifest(file_path=file_path, ecosystem="npm", dependencies=items, total_count=len(items))

    @staticmethod
    def _parse_requirements_txt(file_path: str, content: str) -> DependencyManifest:
        items = []
        for line in content.splitlines():
            line = line.strip()
            if not line or line.startswith("#") or line.startswith("-"):
                continue
            # Regex for package==version or package>=version or just package
            match = re.match(r"^([a-zA-Z0-9_\-\.]+)(?:([=><~!^]+)(.+))?", line)
            if match:
                pkg = match.group(1)
                ver = match.group(3) if match.group(3) else "latest"
                items.append(DependencyItem(
                    name=pkg,
                    version=ver.strip(),
                    ecosystem="pypi",
                    is_dev="test" in pkg.lower() or "flake" in pkg.lower() or "black" in pkg.lower(),
                    purpose=DependencyAnalyzer._infer_purpose(pkg),
                    risk_level="Low"
                ))
        return DependencyManifest(file_path=file_path, ecosystem="pypi", dependencies=items, total_count=len(items))

    @staticmethod
    def _parse_cargo_toml(file_path: str, content: str) -> DependencyManifest:
        items = []
        in_deps = False
        for line in content.splitlines():
            line = line.strip()
            if line.startswith("[dependencies]"):
                in_deps = True
                continue
            elif line.startswith("[") and in_deps:
                in_deps = False

            if in_deps and "=" in line:
                parts = line.split("=", 1)
                name = parts[0].strip()
                ver = parts[1].strip().strip('"').strip("'")
                items.append(DependencyItem(
                    name=name,
                    version=ver,
                    ecosystem="cargo",
                    is_dev=False,
                    purpose=DependencyAnalyzer._infer_purpose(name),
                    risk_level="Low"
                ))
        return DependencyManifest(file_path=file_path, ecosystem="cargo", dependencies=items, total_count=len(items))

    @staticmethod
    def _parse_go_mod(file_path: str, content: str) -> DependencyManifest:
        items = []
        in_require = False
        for line in content.splitlines():
            line = line.strip()
            if line.startswith("require ("):
                in_require = True
                continue
            elif in_require and line == ")":
                in_require = False
                continue

            if in_require or line.startswith("require "):
                parts = line.replace("require ", "").split()
                if len(parts) >= 2:
                    items.append(DependencyItem(
                        name=parts[0],
                        version=parts[1],
                        ecosystem="go",
                        is_dev=False,
                        purpose=DependencyAnalyzer._infer_purpose(parts[0]),
                        risk_level="Low"
                    ))
        return DependencyManifest(file_path=file_path, ecosystem="go", dependencies=items, total_count=len(items))

    @staticmethod
    def _parse_pom_xml(file_path: str, content: str) -> DependencyManifest:
        items = []
        artifacts = re.findall(r"<artifactId>(.*?)</artifactId>", content)
        for art in artifacts:
            if art in ["maven-compiler-plugin"]:
                continue
            items.append(DependencyItem(
                name=art,
                ecosystem="maven",
                purpose=DependencyAnalyzer._infer_purpose(art),
                risk_level="Low"
            ))
        return DependencyManifest(file_path=file_path, ecosystem="maven", dependencies=items, total_count=len(items))

    @staticmethod
    def _parse_pyproject_toml(file_path: str, content: str) -> DependencyManifest:
        items = []
        in_deps = False
        for line in content.splitlines():
            if "dependencies" in line and "=" in line:
                in_deps = True
                continue
            if in_deps:
                if "]" in line:
                    break
                pkg_match = re.search(r'"([^">=<]+)', line)
                if pkg_match:
                    pkg = pkg_match.group(1).strip()
                    items.append(DependencyItem(
                        name=pkg,
                        ecosystem="pypi",
                        purpose=DependencyAnalyzer._infer_purpose(pkg),
                        risk_level="Low"
                    ))
        return DependencyManifest(file_path=file_path, ecosystem="pypi", dependencies=items, total_count=len(items))

    @staticmethod
    def _infer_purpose(name: str) -> str:
        n = name.lower()
        if any(k in n for k in ["react", "vue", "svelte", "angular", "next", "nuxt"]):
            return "Frontend UI framework / component library"
        if any(k in n for k in ["fastapi", "express", "flask", "django", "gin", "spring", "actix"]):
            return "Backend web server & REST routing engine"
        if any(k in n for k in ["jwt", "auth", "passport", "bcrypt", "oauth"]):
            return "Authentication, security tokens & cryptography"
        if any(k in n for k in ["prisma", "sqlalchemy", "mongoose", "typeorm", "hibernate", "pg", "sql", "redis"]):
            return "Database ORM, query builder, or storage connector"
        if any(k in n for k in ["tailwind", "css", "styled", "sass", "lucide", "shadcn"]):
            return "Styling, iconography & design system tokens"
        if any(k in n for k in ["jest", "pytest", "mocha", "vitest", "cypress"]):
            return "Automated testing suite & assertion library"
        if any(k in n for k in ["axios", "httpx", "request", "fetch"]):
            return "HTTP client for networking & external API calls"
        if any(k in n for k in ["chroma", "pinecone", "qdrant", "weaviate", "openai", "gemini", "langchain"]):
            return "AI / LLM embeddings & vector storage"
        return "Core utility library"
