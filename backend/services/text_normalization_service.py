from __future__ import annotations

from collections.abc import Iterable


def normalize_text_list(items: Iterable[str] | None, *, limit: int = 50) -> list[str]:
    if not items:
        return []

    normalized: list[str] = []
    seen: set[str] = set()
    for item in items:
        if not isinstance(item, str):
            continue
        text = item.strip()
        if not text or text in seen:
            continue
        normalized.append(text)
        seen.add(text)
        if len(normalized) >= limit:
            break
    return normalized
