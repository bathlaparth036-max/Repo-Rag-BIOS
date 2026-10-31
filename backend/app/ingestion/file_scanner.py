"""File scanner and source tree builder with intelligent filtering."""
import os
from typing import List, Dict, Any, Tuple
from app.core.config import settings
from app.models.file import TreeNode, FileInfo


class FileScanner:
    def __init__(self, ignored_dirs: List[str] = None, ignored_exts: List[str] = None):
        self.ignored_dirs = set(ignored_dirs or settings.IGNORED_DIRS)
        self.ignored_exts = set(ignored_exts or settings.IGNORED_EXTENSIONS)

    def should_ignore(self, path: str) -> bool:
        """Determines if a file or directory path should be ignored."""
        parts = path.replace("\\", "/").strip("/").split("/")
        # Check directory segments
        for part in parts[:-1]:
            if part in self.ignored_dirs or part.startswith("."):
                return True
        # Check filename or final segment
        filename = parts[-1]
        if filename in self.ignored_dirs or (filename.startswith(".") and filename not in [".env.example", ".gitignore"]):
            return True
        
        _, ext = os.path.splitext(filename)
        if ext.lower() in self.ignored_exts:
            return True

        return False

    def build_tree(self, tree_items: List[Dict[str, Any]]) -> Tuple[TreeNode, List[Dict[str, Any]], int, int]:
        """
        Builds a nested TreeNode hierarchy from flat GitHub tree items.
        Returns: (root_node, valid_files, file_count, dir_count)
        """
        root = TreeNode(
            name="root",
            path="",
            type="directory",
            children=[]
        )

        file_count = 0
        dir_count = 0
        valid_files = []

        # Map path -> TreeNode
        dir_map: Dict[str, TreeNode] = {"": root}

        for item in tree_items:
            path = item.get("path", "")
            item_type = item.get("type", "blob")  # "blob" (file) or "tree" (dir)

            if self.should_ignore(path):
                continue

            parts = path.split("/")
            name = parts[-1]
            parent_dir = "/".join(parts[:-1])

            # Ensure parents exist
            current_prefix = ""
            for seg in parts[:-1]:
                next_prefix = f"{current_prefix}/{seg}" if current_prefix else seg
                if next_prefix not in dir_map:
                    new_dir = TreeNode(
                        name=seg,
                        path=next_prefix,
                        type="directory",
                        children=[]
                    )
                    dir_map[current_prefix].children.append(new_dir)
                    dir_map[next_prefix] = new_dir
                    dir_count += 1
                current_prefix = next_prefix

            if item_type == "tree":
                if path not in dir_map:
                    new_dir = TreeNode(
                        name=name,
                        path=path,
                        type="directory",
                        children=[]
                    )
                    dir_map[parent_dir].children.append(new_dir)
                    dir_map[path] = new_dir
                    dir_count += 1
            else:
                file_count += 1
                size = item.get("size", 0)
                ext = os.path.splitext(name)[1].lower()
                importance = self.calculate_initial_importance(path)
                complexity = min(10, max(1, 1 + (size // 4000)))

                file_node = TreeNode(
                    name=name,
                    path=path,
                    type="file",
                    size=size,
                    ai_importance=importance,
                    complexity=complexity,
                )
                dir_map[parent_dir].children.append(file_node)
                valid_files.append({
                    "path": path,
                    "name": name,
                    "size": size,
                    "type": "file",
                    "importance": importance,
                    "complexity": complexity,
                })

        return root, valid_files, file_count, dir_count

    def calculate_initial_importance(self, path: str) -> float:
        """Heuristic AI importance scoring for files based on architectural patterns."""
        p = path.lower()
        if p in ["readme.md", "package.json", "requirements.txt", "cargo.toml", "go.mod", "pom.xml", "dockerfile"]:
            return 0.95
        if any(key in p for key in ["main.", "index.", "app.", "server.", "router.", "route.", "entry."]):
            return 0.90
        if any(key in p for key in ["auth", "security", "login", "jwt", "session", "middleware"]):
            return 0.88
        if any(key in p for key in ["controller", "service", "handler", "api/", "model", "schema"]):
            return 0.80
        if any(key in p for key in ["config", "database", "db", "repository"]):
            return 0.75
        if any(key in p for key in ["component", "view", "page", "ui"]):
            return 0.65
        if any(key in p for key in ["util", "helper", "common", "tool"]):
            return 0.50
        if any(key in p for key in ["test", "spec", "__test__"]):
            return 0.40
        return 0.50
