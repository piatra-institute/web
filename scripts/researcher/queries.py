"""
Generate research queries from playground context and present them for interactive review.
"""

from openai import OpenAI
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Confirm, Prompt
from rich.text import Text

from config import MODEL_QUERY_GENERATION
from context import PlaygroundContext

console = Console()

QUERY_GENERATION_PROMPT = """\
You are a research assistant for an interactive scientific playground website.

Given the following playground context, generate 4-6 deep research queries that would help produce a comprehensive research companion document for this playground.

The queries should:
1. Cover the core scientific foundations and key theories behind the playground
2. Explore recent advances and open questions in the field
3. Investigate cross-disciplinary connections suggested by the playground's topics
4. Look for empirical evidence, experimental results, or real-world applications
5. Examine critical perspectives or limitations of the models used

{focus_instruction}

Output ONLY the queries, one per line, numbered. Each query should be a complete, specific research question suitable for deep research APIs.

## Playground Context

{context}
"""


def generate_queries(
    ctx: PlaygroundContext,
    focus: str | None = None,
    client: OpenAI | None = None,
) -> list[str]:
    """
    Generate research queries from playground context using GPT-4o.

    Args:
        ctx: The playground context bundle.
        focus: Optional focus area to steer query generation.
        client: OpenAI client instance. Created from env if not provided.

    Returns:
        List of generated query strings.
    """
    if client is None:
        client = OpenAI()

    focus_instruction = ""
    if focus:
        focus_instruction = f"Pay special attention to this focus area: {focus}"

    response = client.responses.create(
        model=MODEL_QUERY_GENERATION,
        input=QUERY_GENERATION_PROMPT.format(
            context=ctx.to_prompt(),
            focus_instruction=focus_instruction,
        ),
    )

    raw = response.output_text or ""

    queries = []
    for line in raw.strip().splitlines():
        line = line.strip()
        if not line:
            continue
        # Strip leading number and punctuation (e.g., "1. ", "1) ")
        import re
        cleaned = re.sub(r"^\d+[\.\)]\s*", "", line)
        if cleaned:
            queries.append(cleaned)

    return queries


def review_queries(queries: list[str]) -> list[str]:
    """
    Present queries for interactive review using Rich panels.

    Users can keep, edit, remove, or add queries.

    Args:
        queries: List of proposed queries.

    Returns:
        Final list of approved queries.
    """
    console.print()
    console.print(
        Panel(
            "[bold #84cc16]Research Queries[/bold #84cc16]\n\n"
            "Review the proposed queries below. You can keep, edit, or remove them.",
            border_style="#84cc16",
        )
    )

    final_queries: list[str] = []

    for i, query in enumerate(queries, 1):
        console.print()
        console.print(
            Panel(
                Text(query, style="white"),
                title=f"[bold #84cc16]Query {i}/{len(queries)}[/bold #84cc16]",
                border_style="dim",
            )
        )

        action = Prompt.ask(
            "[#84cc16]Action[/#84cc16]",
            choices=["keep", "edit", "remove"],
            default="keep",
        )

        if action == "keep":
            final_queries.append(query)
        elif action == "edit":
            edited = Prompt.ask("[#84cc16]Enter edited query[/#84cc16]", default=query)
            if edited.strip():
                final_queries.append(edited.strip())
        # "remove" → skip

    # Option to add more
    while True:
        console.print()
        add_more = Confirm.ask("[#84cc16]Add another query?[/#84cc16]", default=False)
        if not add_more:
            break
        new_query = Prompt.ask("[#84cc16]Enter new query[/#84cc16]")
        if new_query.strip():
            final_queries.append(new_query.strip())

    if not final_queries:
        console.print("[bold red]No queries selected. At least one query is required.[/bold red]")
        console.print("[dim]Re-adding all original queries.[/dim]")
        return queries

    console.print()
    console.print(
        Panel(
            "\n".join(f"  {i}. {q}" for i, q in enumerate(final_queries, 1)),
            title=f"[bold #84cc16]Final Queries ({len(final_queries)})[/bold #84cc16]",
            border_style="#84cc16",
        )
    )

    return final_queries
