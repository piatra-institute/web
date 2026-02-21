"""
Find a playground directory by name within the app/playgrounds/ structure.

Walks (YYYY)/(MM)/ route groups to locate the matching playground directory.
"""

from pathlib import Path


def find_playground(name: str, project_root: Path | None = None) -> Path:
    """
    Find a playground directory by its slug name.

    Walks app/playgrounds/(YYYY)/(MM)/<name> looking for an exact directory match.

    Args:
        name: The playground slug (e.g. "hsp90-canalization")
        project_root: Root of the Next.js project. Defaults to cwd.

    Returns:
        Path to the playground directory.

    Raises:
        FileNotFoundError: If no matching playground is found.
    """
    if project_root is None:
        project_root = Path.cwd()

    playgrounds_dir = project_root / "app" / "playgrounds"

    if not playgrounds_dir.is_dir():
        raise FileNotFoundError(f"Playgrounds directory not found: {playgrounds_dir}")

    # Walk (YYYY)/(MM)/ route groups
    for year_dir in sorted(playgrounds_dir.iterdir()):
        if not year_dir.is_dir() or not year_dir.name.startswith("("):
            continue
        for month_dir in sorted(year_dir.iterdir()):
            if not month_dir.is_dir() or not month_dir.name.startswith("("):
                continue
            candidate = month_dir / name
            if candidate.is_dir() and (candidate / "page.tsx").exists():
                return candidate

    raise FileNotFoundError(
        f"Playground '{name}' not found under {playgrounds_dir}. "
        f"Expected a directory matching app/playgrounds/(YYYY)/(MM)/{name}/"
    )


def list_playgrounds(project_root: Path | None = None) -> list[dict[str, str]]:
    """
    List all available playgrounds.

    Returns:
        List of dicts with 'name', 'path', 'year', 'month' keys.
    """
    if project_root is None:
        project_root = Path.cwd()

    playgrounds_dir = project_root / "app" / "playgrounds"
    results = []

    if not playgrounds_dir.is_dir():
        return results

    for year_dir in sorted(playgrounds_dir.iterdir()):
        if not year_dir.is_dir() or not year_dir.name.startswith("("):
            continue
        year = year_dir.name.strip("()")
        for month_dir in sorted(year_dir.iterdir()):
            if not month_dir.is_dir() or not month_dir.name.startswith("("):
                continue
            month = month_dir.name.strip("()")
            for pg_dir in sorted(month_dir.iterdir()):
                if pg_dir.is_dir() and (pg_dir / "page.tsx").exists():
                    results.append({
                        "name": pg_dir.name,
                        "path": str(pg_dir),
                        "year": year,
                        "month": month,
                    })

    return results
