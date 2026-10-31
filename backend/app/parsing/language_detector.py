"""Multi-language detector and file categorization."""
import os
from typing import Dict, List, Optional


EXTENSION_LANGUAGE_MAP: Dict[str, str] = {
    ".py": "Python",
    ".js": "JavaScript",
    ".jsx": "JavaScript (React)",
    ".ts": "TypeScript",
    ".tsx": "TypeScript (React)",
    ".java": "Java",
    ".c": "C",
    ".cpp": "C++",
    ".cc": "C++",
    ".h": "C/C++ Header",
    ".hpp": "C++ Header",
    ".go": "Go",
    ".rs": "Rust",
    ".php": "PHP",
    ".kt": "Kotlin",
    ".kts": "Kotlin",
    ".rb": "Ruby",
    ".cs": "C#",
    ".swift": "Swift",
    ".scala": "Scala",
    ".html": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".sql": "SQL",
    ".sh": "Shell",
    ".bash": "Bash",
    ".zsh": "Zsh",
    ".json": "JSON",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".toml": "TOML",
    ".xml": "XML",
    ".md": "Markdown",
    ".dockerfile": "Dockerfile",
}

FILENAME_LANGUAGE_MAP: Dict[str, str] = {
    "dockerfile": "Dockerfile",
    "makefile": "Makefile",
    "jenkinsfile": "Jenkinsfile",
    "gemfile": "Ruby",
    "cmakelists.txt": "CMake",
}


class LanguageDetector:
    @staticmethod
    def detect_language(file_path: str) -> str:
        name = os.path.basename(file_path).lower()
        if name in FILENAME_LANGUAGE_MAP:
            return FILENAME_LANGUAGE_MAP[name]

        _, ext = os.path.splitext(name)
        return EXTENSION_LANGUAGE_MAP.get(ext.lower(), "Plain Text")

    @classmethod
    def calculate_language_breakdown(cls, file_paths: List[str]) -> Dict[str, float]:
        """Calculates percentage breakdown of languages across all files."""
        counts: Dict[str, int] = {}
        total = 0

        for path in file_paths:
            lang = cls.detect_language(path)
            if lang in ["Plain Text", "Markdown", "JSON", "YAML", "XML", "TOML"]:
                continue  # skip config/docs in primary language breakdown
            counts[lang] = counts.get(lang, 0) + 1
            total += 1

        if total == 0:
            return {"General": 100.0}

        percentages = {}
        for lang, count in counts.items():
            pct = round((count / total) * 100, 1)
            percentages[lang] = pct

        # Sort descending
        return dict(sorted(percentages.items(), key=lambda item: item[1], reverse=True))
