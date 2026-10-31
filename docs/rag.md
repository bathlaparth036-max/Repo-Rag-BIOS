# RepoRAG — RAG Engine & Grounding Pipeline

## 1. Semantic Chunking
RepoRAG rejects arbitrary token splitting. Source files are chunked along semantic boundaries:
- Class definitions
- Method / Function scopes
- API Route declarations
- Package manifest blocks
- Markdown documentation sections

## 2. 4-Way Hybrid Search
Queries execute simultaneously across four dimensions:
$$\text{Score} = 0.40 \cdot S_{\text{vector}} + 0.25 \cdot S_{\text{BM25}} + 0.20 \cdot S_{\text{symbol}} + 0.15 \cdot S_{\text{path}}$$

## 3. Strict Evidence Attribution
Every answer returned by the AI generator includes:
- Cited file paths
- Line number ranges
- Relevant symbols
- Extracted snippets
- Mathematical confidence score
