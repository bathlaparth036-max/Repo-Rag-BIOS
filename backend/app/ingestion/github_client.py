"""GitHub API client for repository metadata, tree traversal, and content fetching."""
import re
from typing import Dict, Any, List, Optional, Tuple
import httpx
from app.core.config import settings
from app.core.logging import logger


class GitHubClient:
    def __init__(self, token: Optional[str] = None):
        self.token = token or settings.GITHUB_TOKEN
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "RepoRAG-Intelligence-Engine",
        }
        if self.token:
            self.headers["Authorization"] = f"Bearer {self.token}"

    @staticmethod
    def parse_repo_url(url: str) -> Tuple[str, str]:
        """Extracts owner and repo name from a GitHub URL."""
        cleaned = url.strip().rstrip("/")
        # Matches https://github.com/owner/repo or github.com/owner/repo or owner/repo
        match = re.search(r"(?:https?://)?(?:www\.)?github\.com/([^/]+)/([^/]+)", cleaned)
        if match:
            owner, repo = match.group(1), match.group(2)
            if repo.endswith(".git"):
                repo = repo[:-4]
            return owner, repo
        
        # Simple owner/repo pattern
        parts = cleaned.split("/")
        if len(parts) == 2 and not parts[0].startswith("http"):
            return parts[0], parts[1]

        raise ValueError(f"Invalid GitHub repository URL: {url}")

    async def get_repository_metadata(self, owner: str, repo: str) -> Dict[str, Any]:
        """Fetches repo metadata from GitHub API with Git smart HTTP fallback on rate limits."""
        url = f"{self.base_url}/repos/{owner}/{repo}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, headers=self.headers)
            if resp.status_code == 404:
                raise ValueError(f"Repository '{owner}/{repo}' not found or is private.")
            elif resp.status_code == 403 and "rate limit" in resp.text.lower():
                from app.ingestion.repository_cloner import RepositoryCloner
                logger.warning(f"GitHub API rate limit hit for {owner}/{repo}. Checking Git smart HTTP access...")
                if RepositoryCloner.check_remote_accessible(owner, repo):
                    logger.info(f"Repository {owner}/{repo} is accessible via Git shallow clone. Bypassing REST rate limit.")
                    return {
                        "name": repo,
                        "full_name": f"{owner}/{repo}",
                        "owner": {"login": owner},
                        "default_branch": "main",
                        "description": "Public repository ingested via Git shallow engine (GitHub REST API rate limit bypassed).",
                        "stargazers_count": 0,
                        "forks_count": 0,
                        "private": False,
                        "rate_limited": True
                    }
                raise PermissionError("GitHub API rate limit exceeded and repository is not publicly accessible via Git. Provide a GITHUB_TOKEN or use Demo Mode.")
            elif resp.status_code != 200:
                raise RuntimeError(f"GitHub API error ({resp.status_code}): {resp.text}")
            return resp.json()

    async def get_repository_tree(self, owner: str, repo: str, branch: str = "main") -> List[Dict[str, Any]]:
        """Fetches recursive tree for the repository."""
        url = f"{self.base_url}/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(url, headers=self.headers)
            if resp.status_code == 404:
                # Try master branch if main fails
                if branch == "main":
                    return await self.get_repository_tree(owner, repo, "master")
                raise ValueError(f"Tree for branch '{branch}' not found.")
            elif resp.status_code != 200:
                raise RuntimeError(f"Failed to fetch tree: {resp.text}")
            
            data = resp.json()
            return data.get("tree", [])

    async def get_recent_commits(self, owner: str, repo: str, limit: int = 15) -> List[Dict[str, Any]]:
        """Fetches recent commits."""
        url = f"{self.base_url}/repos/{owner}/{repo}/commits?per_page={limit}"
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get(url, headers=self.headers)
                if resp.status_code == 200:
                    return resp.json()
        except Exception as e:
            logger.warning(f"Could not fetch commits: {e}")
        return []

    async def get_file_content(self, owner: str, repo: str, branch: str, path: str) -> Optional[str]:
        """Fetches raw file content."""
        raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(raw_url, headers=self.headers)
                if resp.status_code == 200:
                    return resp.text
        except Exception as e:
            logger.warning(f"Could not fetch file {path}: {e}")
        return None
