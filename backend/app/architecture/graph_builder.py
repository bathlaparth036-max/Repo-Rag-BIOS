"""Knowledge Graph builder creating nodes and relationship edges."""
from typing import List, Dict, Any
from app.models.graph import KnowledgeGraph, GraphNode, GraphEdge, NodeType, EdgeType
from app.models.file import FileInfo
from app.models.dependency import DependencyItem


class KnowledgeGraphBuilder:
    @classmethod
    def build(
        cls,
        repo_name: str,
        files: List[FileInfo],
        dependencies: List[DependencyItem],
        commits: List[Dict[str, Any]]
    ) -> KnowledgeGraph:
        nodes: List[GraphNode] = []
        edges: List[GraphEdge] = []
        node_ids = set()

        def add_node(node: GraphNode):
            if node.id not in node_ids:
                nodes.append(node)
                node_ids.add(node.id)

        # 1. Root Repository Node
        repo_node_id = f"repo:{repo_name}"
        add_node(GraphNode(
            id=repo_node_id,
            label=repo_name,
            node_type=NodeType.REPOSITORY,
            group="core",
            importance=1.0
        ))

        # 2. Add File Nodes and CONTAINS edges
        for f in files:
            file_node_id = f"file:{f.path}"
            add_node(GraphNode(
                id=file_node_id,
                label=f.name,
                node_type=NodeType.FILE,
                group=f.language,
                file_path=f.path,
                importance=f.ai_importance_score,
                metadata={"lines": f.line_count, "complexity": f.complexity_score}
            ))
            edges.append(GraphEdge(
                source=repo_node_id,
                target=file_node_id,
                edge_type=EdgeType.CONTAINS,
                label="contains"
            ))

            # Symbols inside file
            for sym in f.symbols:
                sym_node_id = f"sym:{f.path}:{sym.name}"
                n_type = NodeType.CLASS if sym.symbol_type.value == "class" else (
                    NodeType.API if sym.symbol_type.value == "api_endpoint" else NodeType.FUNCTION
                )
                add_node(GraphNode(
                    id=sym_node_id,
                    label=sym.name,
                    node_type=n_type,
                    group=sym.symbol_type.value,
                    file_path=f.path,
                    line_number=sym.start_line,
                    importance=0.7
                ))
                edges.append(GraphEdge(
                    source=file_node_id,
                    target=sym_node_id,
                    edge_type=EdgeType.EXPOSES if n_type == NodeType.API else EdgeType.CONTAINS,
                    label="defines"
                ))

            # Imports between files
            for imp in f.imports:
                for target_file in files:
                    clean_name = target_file.name.split(".")[0]
                    if imp.endswith(clean_name) or imp == clean_name:
                        target_id = f"file:{target_file.path}"
                        edges.append(GraphEdge(
                            source=file_node_id,
                            target=target_id,
                            edge_type=EdgeType.IMPORTS,
                            label="imports"
                        ))

        # 3. Add Dependencies
        for dep in dependencies[:15]:
            dep_id = f"dep:{dep.name}"
            add_node(GraphNode(
                id=dep_id,
                label=dep.name,
                node_type=NodeType.DEPENDENCY,
                group="dependency",
                importance=0.6,
                metadata={"ecosystem": dep.ecosystem, "version": dep.version}
            ))
            edges.append(GraphEdge(
                source=repo_node_id,
                target=dep_id,
                edge_type=EdgeType.DEPENDS_ON,
                label="depends on"
            ))

        # 4. Recent Commits
        for c in commits[:5]:
            c_hash = c.get("sha", "")[:7] or "c1"
            c_id = f"commit:{c_hash}"
            add_node(GraphNode(
                id=c_id,
                label=f"Commit {c_hash}",
                node_type=NodeType.COMMIT,
                group="git",
                importance=0.4,
                metadata={"message": c.get("commit", {}).get("message", "")[:40]}
            ))
            edges.append(GraphEdge(
                source=c_id,
                target=repo_node_id,
                edge_type=EdgeType.CHANGED_BY,
                label="modifies"
            ))

        return KnowledgeGraph(
            nodes=nodes,
            edges=edges,
            total_nodes=len(nodes),
            total_edges=len(edges)
        )
