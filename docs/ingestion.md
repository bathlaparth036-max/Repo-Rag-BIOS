# Ingestion & Multi-Language Parsing

## 1. Directory & File Filtering
The ingestion engine skips irrelevant and generated artifacts:
- `.git`, `node_modules`, `dist`, `build`, `target`, `venv`, `.env`, `coverage`
- Binary file formats (images, media, executables, compiled bytecode)

## 2. Supported Languages
- JavaScript & TypeScript (ESNext, React JSX/TSX)
- Python (built-in AST analysis)
- Java
- Go
- Rust
- C / C++
- Package manifests (`package.json`, `requirements.txt`, `pom.xml`, `go.mod`, `Cargo.toml`, `pyproject.toml`)
