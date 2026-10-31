"""RepoRAG Configuration and Environment Settings."""
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    PROJECT_NAME: str = "RepoRAG"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "AI-Powered GitHub Repository Intelligence Platform"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Server Settings
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "chrome-extension://*",
    ]

    # GitHub API
    GITHUB_TOKEN: Optional[str] = None
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None

    # LLM Settings
    LLM_PROVIDER: str = "gemini"  # gemini, openai, local
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    DEFAULT_MODEL: str = "gemini-1.5-flash"

    # Vector DB / Embeddings
    VECTOR_DB_TYPE: str = "memory"  # memory, chroma
    VECTOR_DB_DIR: str = "./data/vector_db"
    EMBEDDING_PROVIDER: str = "local"  # local, gemini, openai

    # Ignored paths during file scanning
    IGNORED_DIRS: List[str] = [
        ".git",
        "node_modules",
        "dist",
        "build",
        "target",
        "venv",
        ".venv",
        "env",
        ".env",
        "__pycache__",
        ".cache",
        "coverage",
        ".idea",
        ".vscode",
        ".next",
        ".nuxt",
        "bin",
        "obj",
        "vendor",
    ]

    IGNORED_EXTENSIONS: List[str] = [
        ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg",
        ".mp4", ".mov", ".avi", ".mp3", ".wav",
        ".zip", ".tar", ".gz", ".7z", ".rar",
        ".exe", ".dll", ".so", ".dylib", ".bin",
        ".pyc", ".pyo", ".pyd", ".class",
        ".pdf", ".docx", ".xlsx",
        ".woff", ".woff2", ".ttf", ".eot",
        ".map"
    ]

    # Maximum file size to index (in bytes, default 500 KB)
    MAX_FILE_SIZE_BYTES: int = 500 * 1024

    model_config = SettingsConfigDict(env_file=".env", extra="allow")


settings = Settings()
