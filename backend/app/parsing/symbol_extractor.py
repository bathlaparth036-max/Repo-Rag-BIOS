"""Semantic code symbol and relationship extractor supporting multi-language codebases."""
import ast
import re
from typing import List, Dict, Any, Tuple, Optional
from app.models.symbol import CodeSymbol, SymbolType


class SymbolExtractor:
    @classmethod
    def extract_from_file(cls, file_path: str, content: str, language: str) -> Tuple[List[CodeSymbol], List[str], List[str]]:
        """
        Extracts symbols, imports, and API/service calls from source code.
        Returns: (symbols, imports, calls)
        """
        if not content or len(content.strip()) == 0:
            return [], [], []

        if language == "Python":
            return cls._extract_python(file_path, content)
        elif language in ["TypeScript", "TypeScript (React)", "JavaScript", "JavaScript (React)"]:
            return cls._extract_javascript_typescript(file_path, content)
        elif language == "Java":
            return cls._extract_java(file_path, content)
        elif language == "Go":
            return cls._extract_go(file_path, content)
        elif language == "Rust":
            return cls._extract_rust(file_path, content)
        elif language in ["C", "C++", "C/C++ Header"]:
            return cls._extract_cpp(file_path, content)
        else:
            return cls._extract_generic(file_path, content)

    @classmethod
    def _extract_python(cls, file_path: str, content: str) -> Tuple[List[CodeSymbol], List[str], List[str]]:
        symbols: List[CodeSymbol] = []
        imports: List[str] = []
        calls: List[str] = []

        try:
            tree = ast.parse(content)
        except Exception:
            # Fallback to regex if syntax error (e.g. newer python syntax or snippet)
            return cls._extract_generic(file_path, content)

        lines = content.splitlines()

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append(alias.name)
            elif isinstance(node, ast.ImportFrom):
                mod = node.module or ""
                for alias in node.names:
                    imports.append(f"{mod}.{alias.name}" if mod else alias.name)
            elif isinstance(node, ast.ClassDef):
                doc = ast.get_docstring(node)
                start = node.lineno
                end = node.end_lineno or start
                code_snippet = "\n".join(lines[start - 1:min(end, start + 25)])
                symbols.append(CodeSymbol(
                    name=node.name,
                    symbol_type=SymbolType.CLASS,
                    file_path=file_path,
                    start_line=start,
                    end_line=end,
                    docstring=doc,
                    code_snippet=code_snippet,
                    complexity=len(node.body)
                ))
            elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                doc = ast.get_docstring(node)
                start = node.lineno
                end = node.end_lineno or start
                params = [arg.arg for arg in node.args.args]
                
                # Check if it's an API route (e.g. @app.get, @router.post)
                is_api = any(
                    isinstance(dec, ast.Call) and any(verb in ast.unparse(dec).lower() for verb in ["get", "post", "put", "delete", "patch"])
                    for dec in node.decorator_list
                )
                sym_type = SymbolType.API_ENDPOINT if is_api else SymbolType.FUNCTION

                code_snippet = "\n".join(lines[start - 1:min(end, start + 25)])
                symbols.append(CodeSymbol(
                    name=node.name,
                    symbol_type=sym_type,
                    file_path=file_path,
                    start_line=start,
                    end_line=end,
                    parameters=params,
                    docstring=doc,
                    code_snippet=code_snippet,
                    complexity=len(node.body)
                ))
            elif isinstance(node, ast.Call):
                try:
                    callee = ast.unparse(node.func)
                    if callee and len(callee) < 40 and "(" not in callee:
                        calls.append(callee)
                except Exception:
                    pass

        return symbols, list(set(imports)), list(set(calls))[:30]

    @classmethod
    def _extract_javascript_typescript(cls, file_path: str, content: str) -> Tuple[List[CodeSymbol], List[str], List[str]]:
        symbols: List[CodeSymbol] = []
        imports: List[str] = []
        calls: List[str] = []
        lines = content.splitlines()

        # Imports: import ... from '...'; or require('...')
        import_patterns = [
            r'import\s+(?:[\w*\s{},]+)\s+from\s+[\'"]([^\'"]+)[\'"]',
            r'const\s+[\w\s{},]+\s*=\s*require\([\'"]([^\'"]+)[\'"]\)'
        ]
        for pat in import_patterns:
            for match in re.finditer(pat, content):
                imports.append(match.group(1))

        # Classes
        class_pattern = r'(?:export\s+)?(?:default\s+)?class\s+([A-Za-z0-9_]+)(?:\s+extends\s+([A-Za-z0-9_]+))?'
        for match in re.finditer(class_pattern, content):
            line_no = content[:match.start()].count("\n") + 1
            name = match.group(1)
            parent = match.group(2)
            symbols.append(CodeSymbol(
                name=name,
                symbol_type=SymbolType.CLASS,
                file_path=file_path,
                start_line=line_no,
                end_line=min(len(lines), line_no + 30),
                parent_symbol=parent,
                code_snippet="\n".join(lines[line_no - 1:min(len(lines), line_no + 20)])
            ))

        # Interfaces / Types
        interface_pattern = r'(?:export\s+)?(?:interface|type)\s+([A-Za-z0-9_]+)'
        for match in re.finditer(interface_pattern, content):
            line_no = content[:match.start()].count("\n") + 1
            symbols.append(CodeSymbol(
                name=match.group(1),
                symbol_type=SymbolType.INTERFACE,
                file_path=file_path,
                start_line=line_no,
                end_line=line_no + 10,
                code_snippet="\n".join(lines[line_no - 1:min(len(lines), line_no + 10)])
            ))

        # Functions / React components
        fn_patterns = [
            r'(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\((.*?)\)',
            r'(?:export\s+)?const\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\((.*?)\)\s*=>',
        ]
        for pat in fn_patterns:
            for match in re.finditer(pat, content):
                line_no = content[:match.start()].count("\n") + 1
                name = match.group(1)
                raw_params = match.group(2)
                params = [p.strip().split(":")[0].strip() for p in raw_params.split(",") if p.strip()]
                is_component = name[0].isupper() and ("tsx" in file_path or "jsx" in file_path)
                symbols.append(CodeSymbol(
                    name=name,
                    symbol_type=SymbolType.FUNCTION,
                    file_path=file_path,
                    start_line=line_no,
                    end_line=min(len(lines), line_no + 25),
                    parameters=params,
                    code_snippet="\n".join(lines[line_no - 1:min(len(lines), line_no + 20)]),
                    metadata={"is_react_component": is_component}
                ))

        # API Endpoints (e.g. router.get('/users', ...), app.post(...))
        api_pattern = r'(?:app|router|server)\.(get|post|put|delete|patch)\([\'"]([^\'"]+)[\'"]'
        for match in re.finditer(api_pattern, content):
            line_no = content[:match.start()].count("\n") + 1
            method = match.group(1).upper()
            route = match.group(2)
            symbols.append(CodeSymbol(
                name=f"{method} {route}",
                symbol_type=SymbolType.API_ENDPOINT,
                file_path=file_path,
                start_line=line_no,
                end_line=line_no + 10,
                code_snippet=lines[line_no - 1] if line_no - 1 < len(lines) else ""
            ))

        return symbols, list(set(imports)), calls

    @classmethod
    def _extract_java(cls, file_path: str, content: str) -> Tuple[List[CodeSymbol], List[str], List[str]]:
        symbols: List[CodeSymbol] = []
        imports: List[str] = []
        lines = content.splitlines()

        # Imports
        for match in re.finditer(r'import\s+(?:static\s+)?([A-Za-z0-9_.*]+);', content):
            imports.append(match.group(1))

        # Classes and Interfaces
        class_pattern = r'(?:public\s+|protected\s+|private\s+)?(?:abstract\s+|final\s+)?(class|interface|enum)\s+([A-Za-z0-9_]+)(?:\s+extends\s+([A-Za-z0-9_]+))?'
        for match in re.finditer(class_pattern, content):
            line_no = content[:match.start()].count("\n") + 1
            sym_kind = match.group(1)
            name = match.group(2)
            parent = match.group(3)
            sym_type = SymbolType.INTERFACE if sym_kind == "interface" else SymbolType.CLASS
            symbols.append(CodeSymbol(
                name=name,
                symbol_type=sym_type,
                file_path=file_path,
                start_line=line_no,
                end_line=min(len(lines), line_no + 30),
                parent_symbol=parent,
                code_snippet="\n".join(lines[line_no - 1:min(len(lines), line_no + 25)])
            ))

        # Methods
        method_pattern = r'(?:public|protected|private)\s+(?:static\s+)?[A-Za-z0-9_<>\[\]]+\s+([A-Za-z0-9_]+)\s*\((.*?)\)\s*\{'
        for match in re.finditer(method_pattern, content):
            line_no = content[:match.start()].count("\n") + 1
            name = match.group(1)
            symbols.append(CodeSymbol(
                name=name,
                symbol_type=SymbolType.METHOD,
                file_path=file_path,
                start_line=line_no,
                end_line=min(len(lines), line_no + 20),
                code_snippet="\n".join(lines[line_no - 1:min(len(lines), line_no + 15)])
            ))

        return symbols, list(set(imports)), []

    @classmethod
    def _extract_go(cls, file_path: str, content: str) -> Tuple[List[CodeSymbol], List[str], List[str]]:
        symbols: List[CodeSymbol] = []
        imports: List[str] = []
        lines = content.splitlines()

        for match in re.finditer(r'import\s+[\'"]([^\'"]+)[\'"]', content):
            imports.append(match.group(1))

        # Structs / Interfaces
        type_pattern = r'type\s+([A-Za-z0-9_]+)\s+(struct|interface)'
        for match in re.finditer(type_pattern, content):
            line_no = content[:match.start()].count("\n") + 1
            name = match.group(1)
            kind = match.group(2)
            sym_type = SymbolType.INTERFACE if kind == "interface" else SymbolType.CLASS
            symbols.append(CodeSymbol(
                name=name,
                symbol_type=sym_type,
                file_path=file_path,
                start_line=line_no,
                end_line=min(len(lines), line_no + 20),
                code_snippet="\n".join(lines[line_no - 1:min(len(lines), line_no + 15)])
            ))

        # Functions / Methods
        fn_pattern = r'func\s+(?:\([A-Za-z0-9_\*\s]+\)\s+)?([A-Za-z0-9_]+)\s*\((.*?)\)'
        for match in re.finditer(fn_pattern, content):
            line_no = content[:match.start()].count("\n") + 1
            name = match.group(1)
            symbols.append(CodeSymbol(
                name=name,
                symbol_type=SymbolType.FUNCTION,
                file_path=file_path,
                start_line=line_no,
                end_line=min(len(lines), line_no + 25),
                code_snippet="\n".join(lines[line_no - 1:min(len(lines), line_no + 15)])
            ))

        return symbols, list(set(imports)), []

    @classmethod
    def _extract_rust(cls, file_path: str, content: str) -> Tuple[List[CodeSymbol], List[str], List[str]]:
        symbols: List[CodeSymbol] = []
        imports: List[str] = []
        lines = content.splitlines()

        for match in re.finditer(r'use\s+([A-Za-z0-9_:]+);', content):
            imports.append(match.group(1))

        # Structs / Traits
        type_pattern = r'(?:pub\s+)?(struct|trait|enum)\s+([A-Za-z0-9_]+)'
        for match in re.finditer(type_pattern, content):
            line_no = content[:match.start()].count("\n") + 1
            kind = match.group(1)
            name = match.group(2)
            sym_type = SymbolType.INTERFACE if kind == "trait" else SymbolType.CLASS
            symbols.append(CodeSymbol(
                name=name,
                symbol_type=sym_type,
                file_path=file_path,
                start_line=line_no,
                end_line=min(len(lines), line_no + 20),
                code_snippet="\n".join(lines[line_no - 1:min(len(lines), line_no + 15)])
            ))

        # Functions
        fn_pattern = r'(?:pub\s+)?(?:async\s+)?fn\s+([A-Za-z0-9_]+)'
        for match in re.finditer(fn_pattern, content):
            line_no = content[:match.start()].count("\n") + 1
            symbols.append(CodeSymbol(
                name=match.group(1),
                symbol_type=SymbolType.FUNCTION,
                file_path=file_path,
                start_line=line_no,
                end_line=min(len(lines), line_no + 20),
                code_snippet="\n".join(lines[line_no - 1:min(len(lines), line_no + 15)])
            ))

        return symbols, list(set(imports)), []

    @classmethod
    def _extract_cpp(cls, file_path: str, content: str) -> Tuple[List[CodeSymbol], List[str], List[str]]:
        symbols: List[CodeSymbol] = []
        imports: List[str] = []
        lines = content.splitlines()

        for match in re.finditer(r'#include\s+[<"]([^>"]+)[>"]', content):
            imports.append(match.group(1))

        # Classes
        for match in re.finditer(r'class\s+([A-Za-z0-9_]+)', content):
            line_no = content[:match.start()].count("\n") + 1
            symbols.append(CodeSymbol(
                name=match.group(1),
                symbol_type=SymbolType.CLASS,
                file_path=file_path,
                start_line=line_no,
                end_line=min(len(lines), line_no + 25),
                code_snippet="\n".join(lines[line_no - 1:min(len(lines), line_no + 15)])
            ))

        return symbols, list(set(imports)), []

    @classmethod
    def _extract_generic(cls, file_path: str, content: str) -> Tuple[List[CodeSymbol], List[str], List[str]]:
        symbols: List[CodeSymbol] = []
        lines = content.splitlines()
        # Find functions or classes generically
        for i, line in enumerate(lines[:100]):
            match = re.match(r'^(?:def|function|class|type|struct)\s+([A-Za-z0-9_]+)', line.strip())
            if match:
                symbols.append(CodeSymbol(
                    name=match.group(1),
                    symbol_type=SymbolType.FUNCTION,
                    file_path=file_path,
                    start_line=i + 1,
                    end_line=min(len(lines), i + 20),
                    code_snippet="\n".join(lines[i:min(len(lines), i + 10)])
                ))
        return symbols, [], []
