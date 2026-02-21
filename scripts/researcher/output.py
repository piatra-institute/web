"""
Write research output files and generate the Next.js page.

Creates:
  - research/content.md
  - research/suggestions.md
  - research/page.tsx (from template)
  - research/.partial/ (interim results)
"""

from pathlib import Path

from context import PlaygroundContext


PAGE_TEMPLATE = '''\
import {{ Metadata }} from 'next';
import {{ defaultOpenGraph }} from '@/data/metadata';
import fs from 'fs';
import path from 'path';

import ResearchRenderer from '@/components/ResearchRenderer';

const content = fs.readFileSync(
    path.join(process.cwd(), '{content_path}'),
    'utf-8',
);

export const metadata: Metadata = {{
    title: '{title} · research · playgrounds',
    description: 'research companion for {title}',

    openGraph: {{
        ...defaultOpenGraph,
        title: '{title} · research · playgrounds · piatra.institute',
        description: 'research companion for {title}',
    }},
}};

export default function ResearchPage() {{
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-16">
                <ResearchRenderer content={{content}} />
            </div>
        </div>
    );
}}
'''


def write_output(
    playground_dir: Path,
    ctx: PlaygroundContext,
    content_md: str,
    suggestions_md: str,
) -> Path:
    """
    Write research output files to the playground's research/ directory.

    Args:
        playground_dir: Path to the playground directory.
        ctx: Playground context (for metadata).
        content_md: The synthesized research document.
        suggestions_md: The improvement suggestions.

    Returns:
        Path to the research/ directory.
    """
    research_dir = playground_dir / "research"
    research_dir.mkdir(exist_ok=True)

    # Write content.md
    (research_dir / "content.md").write_text(content_md)

    # Write suggestions.md
    (research_dir / "suggestions.md").write_text(suggestions_md)

    # Generate page.tsx from template
    # Build the relative path from project root to content.md
    # playground_dir is like: app/playgrounds/(2025)/(07)/meaning-autogenesis
    # We need: app/playgrounds/(2025)/(07)/meaning-autogenesis/research/content.md
    content_path = str(research_dir / "content.md")
    # Make it relative to project root by finding 'app/' prefix
    idx = content_path.find("app/")
    if idx >= 0:
        content_path = content_path[idx:]
    else:
        content_path = str(Path("app") / "playgrounds" / playground_dir.name / "research" / "content.md")

    page_content = PAGE_TEMPLATE.format(
        content_path=content_path,
        title=ctx.title,
    )

    (research_dir / "page.tsx").write_text(page_content)

    return research_dir


def save_partial(
    playground_dir: Path,
    provider_name: str,
    content: str,
) -> Path:
    """
    Save an interim result from a provider to .partial/ for resumability.

    Args:
        playground_dir: Path to the playground directory.
        provider_name: Name of the provider (e.g. "openai", "gemini").
        content: The raw research content from the provider.

    Returns:
        Path to the saved partial file.
    """
    partial_dir = playground_dir / "research" / ".partial"
    partial_dir.mkdir(parents=True, exist_ok=True)

    filepath = partial_dir / f"{provider_name}.md"
    filepath.write_text(content)

    return filepath


def load_partials(playground_dir: Path) -> dict[str, str]:
    """
    Load any existing partial results.

    Returns:
        Dict mapping provider name to content.
    """
    partial_dir = playground_dir / "research" / ".partial"
    if not partial_dir.is_dir():
        return {}

    partials = {}
    for f in partial_dir.iterdir():
        if f.suffix == ".md":
            partials[f.stem] = f.read_text()

    return partials
