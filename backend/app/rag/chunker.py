"""Intelligent semantic chunker respecting code AST and structural boundaries."""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.models.symbol import CodeSymbol


class CodeChunk(BaseModel):
    chunk_id: str
    repository: str
    branch: str
    file_path: str
    language: str
    symbol: Optional[str] = None
    symbol_type: Optional[str] = None
    start_line: int
    end_line: int
    parent_symbol: Optional[str] = None
    content: str
    imports: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SemanticChunker:
    @classmethod
    def chunk_file(
        cls,
        repository: str,
        branch: str,
        file_path: str,
        language: str,
        content: str,
        symbols: List[CodeSymbol],
        imports: List[str]
    ) -> List[CodeChunk]:
        """
        Splits source code into semantic chunks based on symbols, classes, functions,
        or fallback logical blocks.
        """
        if not content.strip():
            return []

        chunks: List[CodeChunk] = []
        lines = content.splitlines()
        total_lines = len(lines)

        # If file is markdown/docs, chunk by headings
        if language == "Markdown":
            return cls._chunk_markdown(repository, branch, file_path, lines)

        # If we have extracted AST symbols (classes, functions), use them as primary chunks
        if symbols:
            # First, check if there is module header / imports before the first symbol
            first_sym_line = min(s.start_line for s in symbols)
            if first_sym_line > 1:
                header_lines = lines[:first_sym_line - 1]
                header_text = "\n".join(header_lines).strip()
                if header_text:
                    chunks.append(CodeChunk(
                        chunk_id=f"{file_path}#header",
                        repository=repository,
                        branch=branch,
                        file_path=file_path,
                        language=language,
                        symbol="<module_imports_header>",
                        symbol_type="header",
                        start_line=1,
                        end_line=first_sym_line - 1,
                        content=header_text,
                        imports=imports
                    ))

            # Add each symbol chunk
            for sym in symbols:
                start = max(1, sym.start_line)
                end = min(total_lines, sym.end_line)
                chunk_lines = lines[start - 1:end]
                chunk_text = "\n".join(chunk_lines).strip()

                if chunk_text:
                    chunks.append(CodeChunk(
                        chunk_id=f"{file_path}#{sym.name}:{start}-{end}",
                        repository=repository,
                        branch=branch,
                        file_path=file_path,
                        language=language,
                        symbol=sym.name,
                        symbol_type=sym.symbol_type.value,
                        start_line=start,
                        end_line=end,
                        parent_symbol=sym.parent_symbol,
                        content=chunk_text,
                        imports=imports
                    ))

        # Fallback or supplementary: if no symbols or small file, treat whole file or 80-line windows
        if not chunks:
            chunk_size = 75
            overlap = 15
            for i in range(0, total_lines, chunk_size - overlap):
                window = lines[i:i + chunk_size]
                text = "\n".join(window).strip()
                if text:
                    chunks.append(CodeChunk(
                        chunk_id=f"{file_path}#block:{i+1}-{min(total_lines, i+chunk_size)}",
                        repository=repository,
                        branch=branch,
                        file_path=file_path,
                        language=language,
                        symbol=None,
                        symbol_type="block",
                        start_line=i + 1,
                        end_line=min(total_lines, i + chunk_size),
                        content=text,
                        imports=imports
                    ))
                if i + chunk_size >= total_lines:
                    break

        return chunks

    @classmethod
    def _chunk_markdown(cls, repository: str, branch: str, file_path: str, lines: List[str]) -> List[CodeChunk]:
        chunks: List[CodeChunk] = []
        current_section = "Intro"
        current_lines: List[str] = []
        start_line = 1

        for i, line in enumerate(lines):
            if line.startswith("#"):
                if current_lines:
                    text = "\n".join(current_lines).strip()
                    if text:
                        chunks.append(CodeChunk(
                            chunk_id=f"{file_path}#{current_section}:{start_line}-{i}",
                            repository=repository,
                            branch=branch,
                            file_path=file_path,
                            language="Markdown",
                            symbol=current_section,
                            symbol_type="documentation_section",
                            start_line=start_line,
                            end_line=i,
                            content=text
                        ))
                    current_lines = []
                    start_line = i + 1
                current_section = line.strip("#").strip()
            current_lines.append(line)

        if current_lines:
            text = "\n".join(current_lines).strip()
            if text:
                chunks.append(CodeChunk(
                    chunk_id=f"{file_path}#{current_section}:{start_line}-{len(lines)}",
                    repository=repository,
                    branch=branch,
                    file_path=file_path,
                    language="Markdown",
                    symbol=current_section,
                    symbol_type="documentation_section",
                    start_line=start_line,
                    end_line=len(lines),
                    content=text
                ))
        return chunks
