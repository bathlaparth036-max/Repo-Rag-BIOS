"""Unit and integration tests for RepoRAG FastAPI backend."""
import pytest
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/api/info")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "RepoRAG Engine"
    assert data["status"] == "operational"

    # Verify root returns 200 (mounted frontend or fallback JSON)
    root_res = client.get("/")
    assert root_res.status_code == 200


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_validate_repository_url():
    # Valid url
    res = client.post("/api/repositories/validate", json={"url": "https://github.com/facebook/react"})
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["owner"] == "facebook"
    assert data["repository"] == "react"


def test_demo_repository_and_tree():
    res = client.get("/api/repositories/demo")
    assert res.status_code == 200
    data = res.json()
    repo_id = data["id"]
    assert "reporag-demo" in data["full_name"]
    assert data["file_count"] > 0

    # Source tree
    tree_res = client.get(f"/api/repositories/{repo_id}/tree")
    assert tree_res.status_code == 200
    tree_data = tree_res.json()
    assert tree_data["type"] == "directory"
    assert len(tree_data["children"]) > 0


def test_knowledge_graph_and_archify():
    repo_id = "demo-fullstack-ai"
    # Knowledge Graph
    kg_res = client.get(f"/api/repositories/{repo_id}/graph")
    assert kg_res.status_code == 200
    kg_data = kg_res.json()
    assert kg_data["total_nodes"] > 0
    assert kg_data["total_edges"] > 0

    # Diagrams
    diag_res = client.get(f"/api/repositories/{repo_id}/diagrams")
    assert diag_res.status_code == 200
    diags = diag_res.json()
    assert "system" in diags
    assert "auth_flow" in diags
    assert "graph TD" in diags["system"]


def test_rag_chat_and_hybrid_search():
    repo_id = "demo-fullstack-ai"
    # Hybrid search
    search_res = client.post("/api/search/hybrid", json={
        "repository_id": repo_id,
        "query": "Where is JWT authentication implemented?"
    })
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["total_matches"] > 0

    # RAG Grounded Chat
    chat_res = client.post("/api/chat/ask", json={
        "repository_id": repo_id,
        "query": "Where is authentication handled?"
    })
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "answer" in chat_data
    assert chat_data["confidence"] > 0.5
    assert len(chat_data["evidence"]) > 0


def test_health_security_and_impact():
    repo_id = "demo-fullstack-ai"
    # Health
    health_res = client.get(f"/api/health/{repo_id}")
    assert health_res.status_code == 200
    assert health_res.json()["overall"] > 50

    # Security scan
    sec_res = client.get(f"/api/security/{repo_id}/scan")
    assert sec_res.status_code == 200
    assert "findings" in sec_res.json()

    # Change impact
    impact_res = client.post(f"/api/health/{repo_id}/change-impact", json={
        "target_file": "src/services/auth.ts"
    })
    assert impact_res.status_code == 200
    assert impact_res.json()["risk_level"] in ["Low", "Medium", "High"]


def test_real_person_voice_api():
    # Models endpoint
    models_res = client.get("/api/voice/models")
    assert models_res.status_code == 200
    data = models_res.json()
    assert data["type"] == "real_person"
    assert len(data["voices"]) >= 4

    # Synthesize endpoint
    syn_res = client.post("/api/voice/synthesize", json={
        "text": "Hello world, this is a real person test.",
        "voice": "en-US-JennyNeural"
    })
    assert syn_res.status_code == 200
    assert syn_res.headers["content-type"] == "audio/mpeg"
    assert len(syn_res.content) > 100

