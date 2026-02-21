#!/usr/bin/env python3
"""
Playground Researcher — CLI tool for deep research on playground topics.

Usage:
    uv run scripts/researcher/researcher.py <playground-name> [options]

Examples:
    uv run scripts/researcher/researcher.py hsp90-canalization
    uv run scripts/researcher/researcher.py hsp90-canalization --providers openai
    uv run scripts/researcher/researcher.py hsp90-canalization --providers gemini,openai --focus "historical context"
    uv run scripts/researcher/researcher.py hsp90-canalization --resume
    uv run scripts/researcher/researcher.py --list
"""

import argparse
import asyncio
import sys
from pathlib import Path

from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel

from config import MODEL_DEEP_RESEARCH_OPENAI
from context import build_context
from discovery import find_playground, list_playgrounds
from output import load_partials, save_partial, write_output
from progress import ResearchProgress
from providers.base import ResearchResult
from providers.gemini_deep import GeminiDeepResearchProvider
from providers.openai_deep import OpenAIDeepResearchProvider
from queries import generate_queries, review_queries
from synthesis import synthesize

console = Console()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Deep research companion generator for playgrounds.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )

    parser.add_argument(
        "playground",
        nargs="?",
        help="Playground slug name (e.g. hsp90-canalization)",
    )
    parser.add_argument(
        "--providers",
        default="openai,gemini",
        help="Comma-separated list of providers to use (default: openai,gemini)",
    )
    parser.add_argument(
        "--focus",
        help="Optional focus area to steer research query generation",
    )
    parser.add_argument(
        "--model",
        help="Override the deep research model for OpenAI provider",
    )
    parser.add_argument(
        "--resume",
        action="store_true",
        help="Resume from partial results (skip completed providers, go to synthesis)",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        dest="list_playgrounds",
        help="List all available playgrounds and exit",
    )
    parser.add_argument(
        "--project-root",
        type=Path,
        help="Project root directory (default: auto-detect)",
    )

    return parser.parse_args()


def detect_project_root() -> Path:
    """Walk up from this script to find the Next.js project root."""
    # This script is at scripts/researcher/researcher.py
    # Project root has package.json and app/ directory
    current = Path(__file__).resolve().parent
    for _ in range(5):
        if (current / "package.json").exists() and (current / "app").is_dir():
            return current
        current = current.parent

    # Fallback to cwd
    cwd = Path.cwd()
    if (cwd / "package.json").exists():
        return cwd

    console.print("[bold red]Could not detect project root. Use --project-root.[/bold red]")
    sys.exit(1)


async def run_research(
    playground_dir: Path,
    project_root: Path,
    provider_names: list[str],
    focus: str | None,
    model_override: str | None,
    resume: bool,
) -> None:
    """Run the full research pipeline."""
    # Build context
    console.print("\n[bold #84cc16]Building playground context...[/bold #84cc16]")
    ctx = build_context(playground_dir, project_root)

    console.print(
        Panel(
            f"[bold]{ctx.title}[/bold]\n"
            f"{ctx.description}\n\n"
            f"Topics: {', '.join(ctx.topics)}\n"
            f"Operations: {', '.join(ctx.operations)}\n"
            f"Date: {ctx.date}\n"
            f"Logic files: {len(ctx.logic_files)}\n"
            f"Has ideation: {'yes' if ctx.ideation_info else 'no'}",
            title="[bold #84cc16]Playground Context[/bold #84cc16]",
            border_style="#84cc16",
        )
    )

    # Check for existing partials if resuming
    existing_partials = {}
    if resume:
        existing_partials = load_partials(playground_dir)
        if existing_partials:
            console.print(
                f"\n[bold #84cc16]Found partial results for: "
                f"{', '.join(existing_partials.keys())}[/bold #84cc16]"
            )

    # Determine which providers still need to run
    providers_to_run = [
        p for p in provider_names
        if not (resume and p in existing_partials)
    ]

    results: list[ResearchResult] = []

    # Convert existing partials to ResearchResults
    for provider_name, content in existing_partials.items():
        if provider_name in provider_names:
            results.append(ResearchResult(
                provider=provider_name,
                content=content,
                model="resumed",
                status="completed",
            ))
            console.print(f"  [dim]Using cached result for {provider_name}[/dim]")

    if providers_to_run:
        # Generate and review queries
        console.print("\n[bold #84cc16]Generating research queries...[/bold #84cc16]")
        queries = generate_queries(ctx, focus=focus)
        queries = review_queries(queries)

        # Concatenate queries into a single prompt
        research_prompt = (
            f"# Deep Research Request: {ctx.title}\n\n"
            f"## Context\n\n"
            f"This research is for an interactive scientific playground about: {ctx.description}\n"
            f"Topics: {', '.join(ctx.topics)}\n"
            f"Operations: {', '.join(ctx.operations)}\n\n"
            f"## Research Questions\n\n"
            + "\n".join(f"{i}. {q}" for i, q in enumerate(queries, 1))
            + "\n\n## Instructions\n\n"
            "Please provide comprehensive, well-sourced answers to the above research questions. "
            "Include specific citations, data, and references where available. "
            "Focus on academic and scientific rigor while remaining accessible. "
            "Cover both established knowledge and recent developments."
        )

        # Initialize providers
        provider_instances = []
        for name in providers_to_run:
            if name == "openai":
                model = model_override or MODEL_DEEP_RESEARCH_OPENAI
                provider_instances.append(OpenAIDeepResearchProvider(model=model))
            elif name == "gemini":
                provider_instances.append(GeminiDeepResearchProvider())
            else:
                console.print(f"[bold red]Unknown provider: {name}[/bold red]")
                continue

        # Run providers with progress tracking
        console.print()
        with ResearchProgress(providers_to_run) as progress:

            async def run_provider(provider: OpenAIDeepResearchProvider | GeminiDeepResearchProvider) -> ResearchResult:
                def on_status(msg: str) -> None:
                    progress.update(provider.name, "polling", msg)

                progress.mark_started(provider.name)
                result = await provider.research(research_prompt, on_status=on_status)

                if result.status == "completed":
                    progress.update(provider.name, "completed", f"Got {len(result.content)} chars")
                    # Save partial
                    save_partial(playground_dir, provider.name, result.content)
                else:
                    progress.update(provider.name, "failed", result.error[:60])

                return result

            # Run all providers concurrently
            provider_results = await asyncio.gather(
                *[run_provider(p) for p in provider_instances],
                return_exceptions=True,
            )

            for r in provider_results:
                if isinstance(r, Exception):
                    console.print(f"[bold red]Provider error: {r}[/bold red]")
                else:
                    results.append(r)

    # Check we have at least one successful result
    successful = [r for r in results if r.status == "completed"]
    if not successful:
        console.print("\n[bold red]No successful research results. Cannot synthesize.[/bold red]")
        for r in results:
            if r.error:
                console.print(f"  [red]{r.provider}: {r.error}[/red]")
        sys.exit(1)

    console.print(
        f"\n[bold #84cc16]Synthesizing {len(successful)} research result(s)...[/bold #84cc16]"
    )

    # Synthesize
    content_md, suggestions_md = synthesize(ctx, successful)

    # Write output
    research_dir = write_output(playground_dir, ctx, content_md, suggestions_md)

    console.print()
    console.print(
        Panel(
            f"[bold green]Research complete![/bold green]\n\n"
            f"  content.md:     {research_dir / 'content.md'}\n"
            f"  suggestions.md: {research_dir / 'suggestions.md'}\n"
            f"  page.tsx:       {research_dir / 'page.tsx'}\n\n"
            f"View at: /playgrounds/{ctx.name}/research\n\n"
            f"[dim]To link from the playground, add to PlaygroundLayout:[/dim]\n"
            f'[dim]  researchUrl="/playgrounds/{ctx.name}/research"[/dim]',
            title="[bold #84cc16]Output[/bold #84cc16]",
            border_style="#84cc16",
        )
    )


def main() -> None:
    # Load .env.local from project root
    project_root_env = detect_project_root()
    load_dotenv(project_root_env / ".env.local")

    args = parse_args()

    project_root = args.project_root or detect_project_root()

    if args.list_playgrounds:
        playgrounds = list_playgrounds(project_root)
        console.print(
            Panel(
                "\n".join(f"  {p['name']}" for p in playgrounds),
                title=f"[bold #84cc16]Available Playgrounds ({len(playgrounds)})[/bold #84cc16]",
                border_style="#84cc16",
            )
        )
        return

    if not args.playground:
        console.print("[bold red]Please provide a playground name or use --list.[/bold red]")
        sys.exit(1)

    # Find the playground
    try:
        playground_dir = find_playground(args.playground, project_root)
    except FileNotFoundError as e:
        console.print(f"[bold red]{e}[/bold red]")
        sys.exit(1)

    console.print(
        Panel(
            f"[bold #84cc16]Playground Researcher[/bold #84cc16]\n\n"
            f"  Playground: {args.playground}\n"
            f"  Directory:  {playground_dir}\n"
            f"  Providers:  {args.providers}\n"
            f"  Focus:      {args.focus or '(none)'}\n"
            f"  Resume:     {args.resume}",
            border_style="#84cc16",
        )
    )

    provider_names = [p.strip() for p in args.providers.split(",")]

    asyncio.run(
        run_research(
            playground_dir=playground_dir,
            project_root=project_root,
            provider_names=provider_names,
            focus=args.focus,
            model_override=args.model,
            resume=args.resume,
        )
    )


if __name__ == "__main__":
    main()
