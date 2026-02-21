"""
Gemini deep research provider using the deep-research-pro-preview model.

Uses the google-genai SDK's async interactions API for background research.
"""

import asyncio
from typing import Callable

from google import genai

from config import MODEL_DEEP_RESEARCH_GEMINI
from .base import DeepResearchProvider, ResearchResult


POLL_INTERVAL = 30  # seconds


class GeminiDeepResearchProvider(DeepResearchProvider):
    """Deep research via Google's Gemini deep-research-pro-preview model."""

    def __init__(self, model: str = MODEL_DEEP_RESEARCH_GEMINI, api_key: str | None = None):
        self._model = model
        self._client = genai.Client(api_key=api_key) if api_key else genai.Client()

    @property
    def name(self) -> str:
        return "gemini"

    async def research(
        self,
        prompt: str,
        on_status: Callable[[str], None] | None = None,
    ) -> ResearchResult:
        """
        Submit a deep research request and poll for completion.

        Uses the interactions API with background=True.
        """
        try:
            if on_status:
                on_status("Submitting to Gemini deep research...")

            # Create a background interaction
            interaction = await self._client.aio.interactions.create(
                agent=self._model,
                config=genai.types.InteractionConfig(
                    background=True,
                ),
            )

            interaction_id = interaction.name

            # Send the research prompt
            await self._client.aio.interactions.send_message(
                interaction=interaction_id,
                message=prompt,
            )

            if on_status:
                on_status(f"Submitted. Polling interaction...")

            # Poll for completion
            while True:
                await asyncio.sleep(POLL_INTERVAL)

                interaction = await self._client.aio.interactions.get(
                    name=interaction_id,
                )

                status = interaction.status if hasattr(interaction, "status") else "unknown"

                if on_status:
                    on_status(f"Status: {status}")

                if status in ("COMPLETED", "completed", "DONE", "done"):
                    break
                elif status in ("FAILED", "failed", "ERROR", "error"):
                    return ResearchResult(
                        provider=self.name,
                        content="",
                        model=self._model,
                        status="failed",
                        error=f"Interaction failed with status: {status}",
                    )
                elif status not in ("RUNNING", "running", "IN_PROGRESS", "in_progress",
                                     "QUEUED", "queued", "PENDING", "pending"):
                    # Unknown terminal status
                    if on_status:
                        on_status(f"Unknown status: {status}, continuing to poll...")

            # Retrieve the final response
            messages = []
            async for message in self._client.aio.interactions.list_messages(
                interaction=interaction_id,
            ):
                if hasattr(message, "content") and message.content:
                    for part in message.content:
                        if hasattr(part, "text") and part.text:
                            messages.append(part.text)

            content = "\n\n".join(messages)

            if not content:
                return ResearchResult(
                    provider=self.name,
                    content="",
                    model=self._model,
                    status="failed",
                    error="Interaction completed but no text content found.",
                )

            return ResearchResult(
                provider=self.name,
                content=content,
                model=self._model,
                status="completed",
            )

        except Exception as e:
            return ResearchResult(
                provider=self.name,
                content="",
                model=self._model,
                status="failed",
                error=str(e),
            )
