# Security & Privacy Guidelines

## 1. Grounding & Zero-Hallucination
RepoRAG adheres to strict evidence constraints. If code evidence cannot be verified in the indexed repository, the system explicitly reports:
`"I couldn't find sufficient evidence in the indexed repository."`

## 2. Security Scan Guardrails
All findings produced by the security pattern auditor are explicitly labeled as **Potential issues**, not confirmed CVEs or vulnerabilities.

## 3. Privacy & Compliance
- Data purge endpoint `DELETE /api/repositories/{id}` permanently evicts stored intelligence, AST cache, and vector embeddings from the server.
- No repository tokens or passwords are required for public repository ingestion or demo exploration.
