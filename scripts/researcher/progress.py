"""
Rich-based terminal progress display for long-running deep research calls.
"""

import time

from rich.console import Console
from rich.live import Live
from rich.table import Table
from rich.text import Text


console = Console()


class ResearchProgress:
    """
    Displays a live-updating table of provider research status.

    Usage:
        progress = ResearchProgress(["openai", "gemini"])
        with progress:
            progress.update("openai", "polling", "Waiting for response...")
            ...
            progress.update("openai", "completed", "Done")
    """

    def __init__(self, providers: list[str]):
        self.providers = providers
        self.status: dict[str, str] = {p: "pending" for p in providers}
        self.messages: dict[str, str] = {p: "Waiting to start..." for p in providers}
        self.start_times: dict[str, float] = {}
        self._live: Live | None = None

    def _build_table(self) -> Table:
        table = Table(
            title="[bold #84cc16]Deep Research Progress[/bold #84cc16]",
            border_style="#84cc16",
            show_header=True,
            header_style="bold #84cc16",
        )
        table.add_column("Provider", style="white", width=12)
        table.add_column("Status", width=12)
        table.add_column("Elapsed", width=10)
        table.add_column("Details", style="dim")

        for provider in self.providers:
            status = self.status[provider]
            message = self.messages[provider]

            # Color-code status
            if status == "completed":
                status_text = Text(status, style="bold green")
            elif status == "failed":
                status_text = Text(status, style="bold red")
            elif status == "polling":
                status_text = Text(status, style="bold yellow")
            elif status == "submitting":
                status_text = Text(status, style="bold cyan")
            else:
                status_text = Text(status, style="dim")

            # Calculate elapsed time
            elapsed = ""
            if provider in self.start_times:
                seconds = int(time.time() - self.start_times[provider])
                minutes, secs = divmod(seconds, 60)
                elapsed = f"{minutes}m {secs:02d}s"

            table.add_row(provider, status_text, elapsed, message)

        return table

    def __enter__(self) -> "ResearchProgress":
        self._live = Live(
            self._build_table(),
            console=console,
            refresh_per_second=1,
        )
        self._live.__enter__()
        return self

    def __exit__(self, *args: object) -> None:
        if self._live:
            self._live.__exit__(*args)

    def update(self, provider: str, status: str, message: str = "") -> None:
        """Update a provider's status and message."""
        self.status[provider] = status
        if message:
            self.messages[provider] = message
        if status == "submitting" and provider not in self.start_times:
            self.start_times[provider] = time.time()
        if self._live:
            self._live.update(self._build_table())

    def mark_started(self, provider: str) -> None:
        """Mark a provider as started (sets start time)."""
        self.start_times[provider] = time.time()
        self.update(provider, "submitting", "Sending request...")
