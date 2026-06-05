from __future__ import annotations

from typing import Any

DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100


def normalize_page(page: int) -> int:
    return max(1, page)


def normalize_page_size(page_size: int) -> int:
    return min(MAX_PAGE_SIZE, max(1, page_size))


def paginate_items(items: list[dict[str, Any]], *, page: int = 1, page_size: int = DEFAULT_PAGE_SIZE) -> dict[str, Any]:
    normalized_page = normalize_page(page)
    normalized_page_size = normalize_page_size(page_size)
    total = len(items)
    start = (normalized_page - 1) * normalized_page_size
    end = start + normalized_page_size
    return {
        "items": items[start:end],
        "pagination": {
            "page": normalized_page,
            "page_size": normalized_page_size,
            "total": total,
            "has_next": end < total,
        },
    }
