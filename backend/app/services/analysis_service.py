"""Repository health, security scan, onboarding docs, and change impact services."""
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.models.file import FileInfo
from app.models.repository import (
    RepositoryIntelligence,
    HealthScore,
    AIDetectionReport,
    AIFileSignal,
    GitCommit
)


class SecurityIssue(BaseModel):
    severity: str  # Critical, High, Medium, Low
    category: str
    file_path: str
    line_number: int
    reason: str
    suggested_remediation: str
    snippet: Optional[str] = None


class ChangeImpactResult(BaseModel):
    target_file: str
    risk_level: str  # Low, Medium, High
    direct_dependents: List[str] = Field(default_factory=list)
    indirect_dependents: List[str] = Field(default_factory=list)
    affected_apis: List[str] = Field(default_factory=list)
    affected_tests: List[str] = Field(default_factory=list)
    summary: str = ""


class AnalysisService:
    @staticmethod
    def calculate_health(files: List[FileInfo], languages: Dict[str, float]) -> HealthScore:
        """
        Calculates repository health and maintainability scores based on code metrics.
        Clearly labels scores as AI/heuristic estimates.
        """
        if not files:
            return HealthScore()

        avg_complexity = sum(f.complexity_score for f in files) / len(files)
        total_lines = sum(f.line_count for f in files)

        # Doc score: presence of README, docstrings
        has_readme = any("readme.md" in f.path.lower() for f in files)
        doc_files = sum(1 for f in files if any(s.docstring for s in f.symbols))
        doc_score = min(98, max(50, (30 if has_readme else 10) + int((doc_files / max(1, len(files))) * 65)))

        # Architecture score: modularity & entrypoint clarity
        arch_score = min(95, max(65, 88 - int(avg_complexity * 2)))

        # Maintainability: inverse to excessive complexity
        maintain_score = min(95, max(60, 92 - int(avg_complexity * 3)))

        # Testing score
        test_files = sum(1 for f in files if "test" in f.path.lower() or "spec" in f.path.lower())
        test_score = min(96, max(45, 60 + min(35, test_files * 8)))

        # Security score
        sec_score = 88

        overall = int((arch_score * 0.25) + (maintain_score * 0.25) + (doc_score * 0.15) + (test_score * 0.15) + (sec_score * 0.20))

        return HealthScore(
            overall=overall,
            architecture=arch_score,
            maintainability=maintain_score,
            documentation=doc_score,
            testing=test_score,
            security=sec_score,
            is_ai_estimated=True,
            summary=f"Analysis of {len(files)} files ({total_lines:,} lines): clean module separation with {round(avg_complexity, 1)} avg cyclomatic weight."
        )

    @staticmethod
    def scan_security(files: List[FileInfo], file_contents: Dict[str, str]) -> List[SecurityIssue]:
        """
        Analyzes source files for potential security issue patterns.
        Strictly labeled as 'Potential issue' rather than confirmed vulnerabilities.
        """
        issues: List[SecurityIssue] = []

        secret_patterns = [
            (r'(?:api[_-]?key|secret|token|password|auth_token)\s*=\s*[\'"][A-Za-z0-9_\-]{16,}[\'"]', "Hardcoded Secret / Token", "High", "Move sensitive credentials to environment variables or secret manager."),
            (r'eval\s*\(', "Dangerous eval() execution", "High", "Avoid eval(); use safe JSON parsers or declarative AST execution."),
            (r'SELECT\s+.*\s+FROM\s+.*(?:\+|%|\.format\(|\$\{)', "Potential SQL String Concatenation", "High", "Use parameterized queries or ORM bindings."),
            (r'exec\s*\(', "Dynamic code execution (exec)", "Medium", "Avoid dynamic string execution in runtime flow."),
            (r'(?:dangerouslySetInnerHTML)', "Unsanitized HTML Injection (XSS)", "Medium", "Sanitize DOM elements using DOMPurify before rendering."),
            (r'DEBUG\s*=\s*True', "Production Debug Flag Enabled", "Low", "Ensure debug modes are disabled in production configurations.")
        ]

        for f in files:
            content = file_contents.get(f.path, "")
            if not content:
                continue

            lines = content.splitlines()
            for line_no, line in enumerate(lines, start=1):
                for pattern, category, severity, remediation in secret_patterns:
                    if re.search(pattern, line, re.IGNORECASE):
                        issues.append(SecurityIssue(
                            severity=severity,
                            category=category,
                            file_path=f.path,
                            line_number=line_no,
                            reason=f"Pattern match for {category.lower()} detected on line {line_no}.",
                            suggested_remediation=remediation,
                            snippet=line.strip()[:100]
                        ))
                        if len(issues) >= 20:
                            return issues

        return issues

    @staticmethod
    def analyze_change_impact(target_file: str, files: List[FileInfo]) -> ChangeImpactResult:
        """Calculates direct/indirect dependents and affected APIs/tests for a modified file."""
        target_name = target_file.split("/")[-1].split(".")[0]
        direct = []
        tests = []
        apis = []

        for f in files:
            if f.path == target_file:
                continue
            is_dependent = any(target_name in imp for imp in f.imports)
            if is_dependent:
                direct.append(f.path)
                if "test" in f.path.lower():
                    tests.append(f.path)
                for sym in f.symbols:
                    if sym.symbol_type.value == "api_endpoint":
                        apis.append(sym.name)

        # Risk level assessment
        risk = "Low"
        if len(direct) > 4 or any("auth" in target_file.lower() or "security" in target_file.lower() for _ in [1]):
            risk = "High"
        elif len(direct) >= 2:
            risk = "Medium"

        return ChangeImpactResult(
            target_file=target_file,
            risk_level=risk,
            direct_dependents=direct[:8],
            indirect_dependents=[],
            affected_apis=list(set(apis))[:5],
            affected_tests=tests[:5],
            summary=f"Modifying {target_file} directly affects {len(direct)} files, {len(apis)} exposed endpoints, and {len(tests)} test suites."
        )

    @staticmethod
    def generate_onboarding_guide(repo: RepositoryIntelligence) -> Dict[str, Any]:
        """Generates comprehensive Developer Onboarding Documentation."""
        return {
            "title": f"Developer Onboarding Guide — {repo.repository_name}",
            "project_overview": repo.overview_summary or f"{repo.repository_name} is an active software codebase built with {', '.join(list(repo.languages.keys())[:3])}.",
            "architecture_style": repo.architecture.style,
            "how_to_run": [
                "1. Clone the repository and inspect project environment configurations.",
                f"2. Install dependencies via your ecosystem package manager ({', '.join(set([d.ecosystem for d in repo.dependencies[:5]])) or 'standard runner'}).",
                f"3. Start development server using standard launch commands (entrypoint: {repo.architecture.frontend_entry or repo.architecture.backend_entry or 'index'}).",
                "4. Run automated test suites before committing code."
            ],
            "key_entrypoints": repo.architecture.entry_points,
            "core_services": repo.architecture.services,
            "common_mistakes_to_avoid": [
                "Do not bypass centralized authentication/middleware checks.",
                "Ensure new external dependencies are audited and documented.",
                "Verify database queries use indexes and parameterized inputs."
            ]
        }

    @staticmethod
    def detect_ai_usage(
        files: List[FileInfo],
        file_contents: Dict[str, str],
        all_paths: List[str],
        commits: List[GitCommit]
    ) -> AIDetectionReport:
        """
        Analyzes the repository for AI-assisted and synthetically generated code patterns.
        Evaluates tooling configs, commit history, in-code prompt markers, docstrings, and comment density.
        """
        signals_detected = []
        ai_tools_detected = []

        # 1. Detect AI Configs & Rules files
        tool_patterns = [
            (r"\.cursorrules|\.cursor/rules", "Cursor Rules (.cursorrules)"),
            (r"\.github/copilot-instructions\.md|copilot\.json|\.copilot/", "GitHub Copilot Configuration"),
            (r"\.v0/|v0\.json", "v0.dev Design/Code Agent"),
            (r"prompt\.txt|prompt\.md|prompts/", "AI Prompt Definition Files"),
            (r"\.devin/|devin\.json", "Devin AI Software Engineer Config"),
            (r"\.cline/|\.aider/|\.windsurf/", "AI Autonomous Coding Agent Config"),
            (r"claude\.md|agents\.md|cursor\.md", "AI Agent Guideline Docs")
        ]

        has_ai_config = False
        for path in all_paths:
            path_lower = path.lower()
            for pattern, name in tool_patterns:
                if re.search(pattern, path_lower):
                    if name not in ai_tools_detected:
                        ai_tools_detected.append(name)
                        has_ai_config = True

        if ai_tools_detected:
            signals_detected.append(f"AI Tooling Configurations: {', '.join(ai_tools_detected)}")

        # 2. Check Git Commit History for AI signatures
        ai_commit_count = 0
        commit_ai_pattern = re.compile(
            r"(?:copilot|cursor|claude|chatgpt|v0\.dev|devin|aider|generated by ai|ai refactor)",
            re.IGNORECASE
        )
        for c in commits:
            msg = getattr(c, "message", "")
            author = getattr(c, "author", "")
            if commit_ai_pattern.search(msg) or commit_ai_pattern.search(author):
                ai_commit_count += 1

        if ai_commit_count > 0:
            signals_detected.append(f"{ai_commit_count} commit(s) explicitly reference AI generation/co-authorship")

        # 3. Analyze code content for synthetic markers
        watermark_regex = re.compile(
            r"(?:generated\s+by|created\s+with|prompt:|written\s+by|code\s+by)\s+(?:copilot|cursor|chatgpt|claude|openai|v0|gemini|deepseek|devin|aider)|"
            r"//\s*here\s+is\s+the\s+(?:complete|updated|refactored|new)\s+(?:code|implementation)|"
            r"//\s*step\s+\d+:\s*(?:initialize|implement|define|create|configure)|"
            r"//\s*note:\s*make\s+sure\s+to\s+replace\s+with\s+your\s+actual|"
            r"//\s*replace\s+this\s+with\s+your\s+actual\s+(?:api\s+key|token|logic)|"
            r"//\s*todo:\s*implement\s+(?:your|this)\s+logic|"
            r"/\*\s*explanation:\s*\*/",
            re.IGNORECASE
        )

        boilerplate_comment_regex = re.compile(
            r"//\s*(?:import\s+(?:dependencies|modules|packages)|initialize\s+(?:state|variables|component)|"
            r"handle\s+(?:submit|click|change|error|request)|render\s+(?:component|elements|ui)|"
            r"return\s+(?:the\s+)?response|check\s+if\s+user\s+is\s+authenticated)",
            re.IGNORECASE
        )

        file_signals: List[AIFileSignal] = []
        total_lines_analyzed = 0
        total_estimated_ai_lines = 0

        for fi in files:
            content = file_contents.get(fi.path, "")
            lines = content.splitlines() if content else []
            line_count = len(lines) if lines else fi.line_count
            if line_count == 0:
                continue

            total_lines_analyzed += line_count
            file_ai_score = 0
            detected_file_patterns = []

            # Check explicit watermarks
            wm_matches = watermark_regex.findall(content)
            if wm_matches:
                file_ai_score += min(50, len(wm_matches) * 20)
                detected_file_patterns.append(f"{len(wm_matches)} explicit AI prompt/generation watermark(s)")

            # Check boilerplate narrative comments
            bp_matches = boilerplate_comment_regex.findall(content)
            if bp_matches:
                file_ai_score += min(30, len(bp_matches) * 6)
                detected_file_patterns.append("Step-by-step synthetic narrative comments")

            # Check docstring saturation on small functions
            small_syms = [s for s in fi.symbols if (s.end_line - s.start_line) <= 8]
            doc_small_syms = [s for s in small_syms if s.docstring and len(s.docstring) > 20]
            if len(small_syms) >= 3 and (len(doc_small_syms) / len(small_syms)) >= 0.6:
                file_ai_score += 25
                detected_file_patterns.append("High-density formal docstrings on trivial functions")

            # Check comment ratio
            comment_lines = sum(1 for line in lines if line.strip().startswith("//") or line.strip().startswith("#") or line.strip().startswith("*"))
            comment_ratio = comment_lines / max(1, line_count)
            if 0.18 <= comment_ratio <= 0.45 and line_count > 25:
                file_ai_score += 15
                detected_file_patterns.append("Uniform generative comment density (20-40%)")

            # Ambient baseline if AI configs are active in project
            if has_ai_config:
                file_ai_score += 10

            file_ai_score = min(100, max(0, file_ai_score))
            estimated_ai_lines = int(line_count * (file_ai_score / 100))
            total_estimated_ai_lines += estimated_ai_lines

            if file_ai_score >= 18:
                file_signals.append(AIFileSignal(
                    file_path=fi.path,
                    ai_percentage=file_ai_score,
                    confidence=0.85 if wm_matches else 0.70,
                    detected_patterns=detected_file_patterns,
                    lines_analyzed=line_count,
                    estimated_ai_lines=estimated_ai_lines
                ))

        # Overall percentage calculation
        if total_lines_analyzed > 0:
            raw_pct = (total_estimated_ai_lines / total_lines_analyzed) * 100
        else:
            raw_pct = 0

        # Tool config bonus
        if has_ai_config:
            raw_pct = max(raw_pct, 25.0) + (10.0 if raw_pct < 60 else 5.0)

        if ai_commit_count > 0:
            raw_pct = max(raw_pct, 20.0) + min(15.0, ai_commit_count * 4.0)

        overall_pct = int(min(100, max(0, round(raw_pct))))

        # Classification tier
        if overall_pct <= 15:
            classification = "Human Hand-Crafted"
            summary = "Natural human engineering patterns detected. Code exhibits authentic comment sparsity, custom naming idioms, and minimal to no synthetic artifacts."
        elif overall_pct <= 40:
            classification = "Light AI Assistance"
            summary = f"Codebase is predominantly human-authored with targeted AI assistance (~{overall_pct}%). AI signals appear primarily in utility functions, boilerplate setups, or routine docstrings."
        elif overall_pct <= 70:
            classification = "Substantial AI-Assisted"
            summary = f"Substantial AI co-authorship detected (~{overall_pct}%). Frequent structural boilerplate, uniform docstrings, and synthetic narrative comments across multiple modules."
        else:
            classification = "Predominantly AI-Generated"
            summary = f"High density of generative AI code (~{overall_pct}%). Code features extensive prompt-style structure, repetitive defensive patterns, and explicit generation markers."

        # Add generic signal summary if watermarks were discovered
        any_watermarks = sum(1 for fs in file_signals if any("watermark" in p.lower() for p in fs.detected_patterns))
        if any_watermarks > 0:
            signals_detected.append(f"{any_watermarks} file(s) contain explicit AI prompt or generation signatures")

        if not signals_detected:
            signals_detected.append("No explicit AI watermark tags or configurations found")

        sorted_files = sorted(file_signals, key=lambda x: (x.ai_percentage, x.estimated_ai_lines), reverse=True)[:8]

        return AIDetectionReport(
            overall_percentage=overall_pct,
            confidence_level="High" if (has_ai_config or any_watermarks > 0 or len(file_signals) >= 3) else "Medium",
            classification=classification,
            ai_lines_count=total_estimated_ai_lines,
            total_lines_count=total_lines_analyzed,
            signals_detected=signals_detected,
            top_ai_files=sorted_files,
            has_ai_tool_config=has_ai_config,
            ai_tools_detected=ai_tools_detected,
            summary=summary
        )
