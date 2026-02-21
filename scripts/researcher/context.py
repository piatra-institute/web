"""
Read playground files and build a context bundle for research query generation.

Extracts metadata, description, logic, ideation materials, and the data.ts entry.
"""

import re
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class PlaygroundContext:
    """All extracted context for a playground."""
    name: str
    title: str
    description: str
    date: str
    topics: list[str]
    operations: list[str]
    page_tsx: str
    playground_tsx: str
    logic_files: dict[str, str] = field(default_factory=dict)
    ideation_info: str = ""
    ideation_demo: str = ""
    data_entry: str = ""

    def to_prompt(self) -> str:
        """Format context as a prompt section for LLM consumption."""
        sections = [
            f"# Playground: {self.title}",
            f"**Slug:** {self.name}",
            f"**Description:** {self.description}",
            f"**Date:** {self.date}",
            f"**Topics:** {', '.join(self.topics)}",
            f"**Operations:** {', '.join(self.operations)}",
        ]

        if self.ideation_info:
            sections.append(f"\n## Ideation / Concept Document\n\n{self.ideation_info}")

        if self.playground_tsx:
            sections.append(f"\n## Main Playground Component (playground.tsx)\n\n```tsx\n{self.playground_tsx}\n```")

        for filename, content in self.logic_files.items():
            sections.append(f"\n## Logic: {filename}\n\n```ts\n{content}\n```")

        if self.ideation_demo:
            sections.append(f"\n## Ideation Demo Code\n\n```tsx\n{self.ideation_demo}\n```")

        return "\n".join(sections)


def _extract_metadata_field(content: str, field_name: str) -> str:
    """Extract a string field value from page.tsx metadata."""
    pattern = rf"{field_name}:\s*['\"](.+?)['\"]"
    match = re.search(pattern, content)
    if match:
        return match.group(1)

    pattern = rf"{field_name}:\s*\n\s*['\"](.+?)['\"]"
    match = re.search(pattern, content)
    return match.group(1) if match else ""


def _extract_data_entry(data_ts_path: Path, playground_link: str) -> tuple[str, list[str], list[str], str]:
    """
    Extract a playground's entry from data.ts.

    Returns (raw_entry, topics, operations, date).
    """
    if not data_ts_path.exists():
        return "", [], [], ""

    content = data_ts_path.read_text()

    # Find the block containing this playground's link
    pattern = rf"\{{[^}}]*link:\s*'{playground_link}'[^}}]*\}}"
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        # Try with double quotes
        pattern = rf'\{{[^}}]*link:\s*"{playground_link}"[^}}]*\}}'
        match = re.search(pattern, content, re.DOTALL)

    if not match:
        return "", [], [], ""

    entry = match.group(0)

    # Extract topics
    topics_match = re.search(r"topics:\s*\[([^\]]+)\]", entry)
    topics = []
    if topics_match:
        topics = [t.strip().strip("'\"") for t in topics_match.group(1).split(",")]

    # Extract operations
    ops_match = re.search(r"operations:\s*\[([^\]]+)\]", entry)
    operations = []
    if ops_match:
        operations = [o.strip().strip("'\"") for o in ops_match.group(1).split(",")]

    # Extract date
    date_match = re.search(r"date:\s*['\"](.+?)['\"]", entry)
    date = date_match.group(1) if date_match else ""

    return entry, topics, operations, date


def build_context(playground_dir: Path, project_root: Path) -> PlaygroundContext:
    """
    Build a complete context bundle from a playground directory.

    Args:
        playground_dir: Path to the playground directory.
        project_root: Root of the Next.js project.

    Returns:
        PlaygroundContext with all extracted information.
    """
    name = playground_dir.name
    link = f"/playgrounds/{name}"

    # Read page.tsx for metadata
    page_tsx = ""
    title = name.replace("-", " ")
    description = ""
    page_path = playground_dir / "page.tsx"
    if page_path.exists():
        page_tsx = page_path.read_text()
        extracted_title = _extract_metadata_field(page_tsx, "title")
        if extracted_title:
            # title is usually "playground name · playgrounds", extract just the name
            title = extracted_title.split("·")[0].strip()
        extracted_desc = _extract_metadata_field(page_tsx, "description")
        if extracted_desc:
            description = extracted_desc

    # Read playground.tsx (the main component, including the outro text)
    playground_tsx = ""
    playground_path = playground_dir / "playground.tsx"
    if playground_path.exists():
        playground_tsx = playground_path.read_text()

    # Read logic files
    logic_files: dict[str, str] = {}
    logic_dir = playground_dir / "logic"
    if logic_dir.is_dir():
        for f in sorted(logic_dir.iterdir()):
            if f.suffix in (".ts", ".tsx"):
                logic_files[f.name] = f.read_text()

    # Read ideation materials
    ideation_info = ""
    ideation_demo = ""
    ideation_dir = playground_dir / "ideation"
    if ideation_dir.is_dir():
        info_path = ideation_dir / "info.md"
        if info_path.exists():
            ideation_info = info_path.read_text()
        demo_path = ideation_dir / "demo.xtsx"
        if demo_path.exists():
            ideation_demo = demo_path.read_text()

    # Extract data.ts entry
    data_ts_path = project_root / "app" / "playgrounds" / "data.ts"
    data_entry, topics, operations, date = _extract_data_entry(data_ts_path, link)

    return PlaygroundContext(
        name=name,
        title=title,
        description=description,
        date=date,
        topics=topics,
        operations=operations,
        page_tsx=page_tsx,
        playground_tsx=playground_tsx,
        logic_files=logic_files,
        ideation_info=ideation_info,
        ideation_demo=ideation_demo,
        data_entry=data_entry,
    )
