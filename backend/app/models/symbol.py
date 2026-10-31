"""Symbol models for extracted code entities."""
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class SymbolType(str, Enum):
    CLASS = "class"
    INTERFACE = "interface"
    FUNCTION = "function"
    METHOD = "method"
    VARIABLE = "variable"
    API_ENDPOINT = "api_endpoint"
    DATABASE_OP = "database_op"
    SERVICE = "service"
    CONFIG = "config"
    TYPE_DEF = "type_definition"


class CodeSymbol(BaseModel):
    name: str
    symbol_type: SymbolType
    file_path: str
    start_line: int
    end_line: int
    parent_symbol: Optional[str] = None
    docstring: Optional[str] = None
    parameters: List[str] = Field(default_factory=list)
    return_type: Optional[str] = None
    calls: List[str] = Field(default_factory=list)
    called_by: List[str] = Field(default_factory=list)
    complexity: int = 1
    code_snippet: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
