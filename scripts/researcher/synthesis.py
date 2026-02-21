"""
Cross-provider synthesis.

Takes research results from multiple providers and synthesizes them
into a coherent content.md and suggestions.md.
"""

from openai import OpenAI

from config import MODEL_SYNTHESIS
from context import PlaygroundContext
from providers.base import ResearchResult


SYNTHESIS_SYSTEM_PROMPT = """\
You are a scientific writer producing a research companion document for an interactive \
educational playground on piatra.institute.

Your task is to synthesize deep research findings into two documents:

1. **content.md** — A 5-10 page research companion (3000-6000 words) that:
   - Opens with a brief introduction connecting to the playground's topic
   - Covers theoretical foundations with proper academic depth
   - Includes relevant empirical evidence and experimental results
   - Discusses cross-disciplinary connections
   - Addresses limitations and open questions
   - Concludes with future directions
   - Uses markdown formatting with headers (##, ###), emphasis, and lists
   - Includes inline citations as markdown links where available
   - Is written for an educated general audience (undergrad+ level)

2. **suggestions.md** — Improvement recommendations for the playground:
   - Scientific accuracy improvements
   - Additional parameters or visualizations to add
   - Missing concepts or models to incorporate
   - UI/UX suggestions for better learning
   - References to key papers or datasets
   - Each suggestion should be actionable and specific

Format your response as:

```content.md
[full content here]
```

```suggestions.md
[full suggestions here]
```
"""


def synthesize(
    ctx: PlaygroundContext,
    results: list[ResearchResult],
    client: OpenAI | None = None,
) -> tuple[str, str]:
    """
    Synthesize multiple research results into content.md and suggestions.md.

    Args:
        ctx: Playground context for additional grounding.
        results: Research results from providers.
        client: OpenAI client. Created from env if not provided.

    Returns:
        Tuple of (content_md, suggestions_md).
    """
    if client is None:
        client = OpenAI()

    # Build the user prompt with all research findings
    research_sections = []
    for result in results:
        if result.status == "completed" and result.content:
            research_sections.append(
                f"## Research from {result.provider} ({result.model})\n\n{result.content}"
            )

    if not research_sections:
        raise ValueError("No successful research results to synthesize.")

    user_prompt = f"""\
## Playground Context

**Title:** {ctx.title}
**Description:** {ctx.description}
**Topics:** {', '.join(ctx.topics)}
**Operations:** {', '.join(ctx.operations)}
**Date:** {ctx.date}

{ctx.to_prompt()}

---

## Deep Research Findings

{chr(10).join(research_sections)}

---

Please synthesize the above research findings into a content.md and suggestions.md as described in your instructions.
"""

    response = client.responses.create(
        model=MODEL_SYNTHESIS,
        instructions=SYNTHESIS_SYSTEM_PROMPT,
        input=user_prompt,
    )

    raw = response.output_text or ""

    # Parse the two documents from the response
    content_md = _extract_block(raw, "content.md")
    suggestions_md = _extract_block(raw, "suggestions.md")

    # Fallback: if parsing fails, put everything in content
    if not content_md and not suggestions_md:
        content_md = raw
        suggestions_md = "No suggestions could be extracted from the synthesis."

    return content_md, suggestions_md


def _extract_block(text: str, label: str) -> str:
    """Extract a labeled code block from the synthesis output."""
    import re

    # Try ```label\n...\n``` pattern
    pattern = rf"```{re.escape(label)}\s*\n(.*?)```"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()

    # Try ## label or # label header-based splitting
    pattern = rf"(?:^|\n)#+\s*{re.escape(label)}\s*\n(.*?)(?=\n#+\s|$)"
    match = re.search(pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()

    return ""
