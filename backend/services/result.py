from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ServiceResult:
    status: str
    data: Any = None
    message: str | None = None
