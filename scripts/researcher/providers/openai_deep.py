"""
OpenAI deep research provider using o3/o4-mini deep research models.

Uses the Responses API with background=True for long-running research.
"""

import asyncio
import time
from typing import Callable

from openai import OpenAI

from config import MODEL_DEEP_RESEARCH_OPENAI
from .base import DeepResearchProvider, ResearchResult


POLL_INTERVAL = 30  # seconds


class OpenAIDeepResearchProvider(DeepResearchProvider):
    """Deep research via OpenAI's o3-deep-research model."""

    def __init__(self, model: str = MODEL_DEEP_RESEARCH_OPENAI, client: OpenAI | None = None):
        self._model = model
        self._client = client or OpenAI()

    @property
    def name(self) -> str:
        return "openai"

    async def research(
        self,
        prompt: str,
        on_status: Callable[[str], None] | None = None,
    ) -> ResearchResult:
        """
        Submit a deep research request and poll for completion.

        The deep research model runs in background mode, returning a response ID
        that we poll until the research is complete.
        """
        try:
            if on_status:
                on_status("Submitting to OpenAI deep research...")

            # Submit as background task
            response = self._client.responses.create(
                model=self._model,
                input=prompt,
                tools=[{"type": "web_search_preview"}],
                background=True,
            )

            response_id = response.id

            if on_status:
                on_status(f"Submitted. Polling response {response_id[:12]}...")

            # Poll for completion
            while response.status in ("queued", "in_progress"):
                await asyncio.sleep(POLL_INTERVAL)

                response = self._client.responses.retrieve(response_id)

                if on_status:
                    elapsed = "polling"
                    on_status(f"Status: {response.status} ({elapsed})")

            if response.status == "completed":
                # Extract text content from the response
                content = ""
                for item in response.output:
                    if item.type == "message":
                        for block in item.content:
                            if block.type == "output_text":
                                content += block.text

                if not content:
                    return ResearchResult(
                        provider=self.name,
                        content="",
                        model=self._model,
                        status="failed",
                        error="Response completed but no text content found.",
                    )

                return ResearchResult(
                    provider=self.name,
                    content=content,
                    model=self._model,
                    status="completed",
                )
            else:
                error_msg = f"Response ended with status: {response.status}"
                if hasattr(response, "error") and response.error:
                    error_msg += f" — {response.error}"
                return ResearchResult(
                    provider=self.name,
                    content="",
                    model=self._model,
                    status="failed",
                    error=error_msg,
                )

        except Exception as e:
            return ResearchResult(
                provider=self.name,
                content="",
                model=self._model,
                status="failed",
                error=str(e),
            )
