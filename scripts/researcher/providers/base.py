"""
Abstract base class for deep research providers.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ResearchResult:
    """Result from a deep research provider."""
    provider: str
    content: str
    model: str
    status: str  # "completed", "failed", "partial"
    error: str = ""


class DeepResearchProvider(ABC):
    """Abstract interface for deep research API providers."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable provider name."""
        ...

    @abstractmethod
    async def research(
        self,
        prompt: str,
        on_status: "callable[[str], None] | None" = None,
    ) -> ResearchResult:
        """
        Send a research prompt and wait for results.

        Args:
            prompt: The concatenated research queries as a single prompt.
            on_status: Optional callback for status updates during polling.

        Returns:
            ResearchResult with the provider's findings.
        """
        ...
