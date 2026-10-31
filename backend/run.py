#!/usr/bin/env python3
"""Runner script for RepoRAG FastAPI backend server."""
import sys
import os

# Add current directory to python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    import uvicorn
    from app.core.config import settings
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)
