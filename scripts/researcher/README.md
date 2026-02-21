# Playground Researcher

CLI tool that uses deep research APIs (OpenAI, Gemini) to generate research companion documents for playgrounds.

For each playground it produces:
- `research/content.md` — a 5-10 page research companion
- `research/suggestions.md` — improvement recommendations
- `research/page.tsx` — a Next.js page serving the research document at `/playgrounds/<name>/research`


## Setup

Requires [uv](https://docs.astral.sh/uv/).

```bash
cp .env.example .env
# fill in your API keys in .env
```

Or set keys in the project root `.env.local` (the script loads it automatically).

| Variable | Provider | Required for |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI | `--providers openai` (default) |
| `GOOGLE_API_KEY` | Google | `--providers gemini` |


## Usage

Run from `scripts/researcher/`:

```bash
cd scripts/researcher
```

### List available playgrounds

```bash
uv run researcher.py --list
```

### Research a playground

```bash
# Both providers (default)
uv run researcher.py hsp90-canalization

# OpenAI only
uv run researcher.py hsp90-canalization --providers openai

# Gemini only
uv run researcher.py hsp90-canalization --providers gemini
```

### Steer the research focus

```bash
uv run researcher.py hsp90-canalization --focus "historical context and experimental evidence"
```

### Resume after interruption

Partial results are saved to `research/.partial/` as each provider completes. If the process is interrupted, resume to skip finished providers and go straight to synthesis:

```bash
uv run researcher.py hsp90-canalization --resume
```

### Override the OpenAI model

```bash
uv run researcher.py hsp90-canalization --model o3-deep-research
```


## How it works

1. **Discovery** — finds the playground directory under `app/playgrounds/(YYYY)/(MM)/`
2. **Context** — reads `page.tsx`, `playground.tsx`, `logic/*.ts`, `ideation/info.md`, and the `data.ts` registry entry
3. **Query generation** — GPT-4o proposes 4-6 research queries based on the playground context; you review, edit, or remove them interactively
4. **Deep research** — sends queries to selected providers (OpenAI `o3-deep-research`, Gemini `deep-research-pro-preview`), polls with a live progress table
5. **Synthesis** — GPT-4o (standard call) synthesizes all provider results into `content.md` and `suggestions.md`
6. **Output** — writes the research files and generates `page.tsx`


## Output structure

```
app/playgrounds/(YYYY)/(MM)/playground-name/research/
  content.md        # committed — the research document
  suggestions.md    # committed — improvement suggestions
  page.tsx          # committed — Next.js page (server component)
  .partial/         # gitignored — interim provider results
```

The research page is accessible at `/playgrounds/<playground-name>/research` and includes an "Export PDF" button for print.


## Options

| Flag | Default | Description |
|---|---|---|
| `playground` | — | Playground slug (e.g. `hsp90-canalization`) |
| `--providers` | `openai,gemini` | Comma-separated provider list |
| `--focus` | — | Focus area to steer query generation |
| `--model` | `o3-deep-research` | Override OpenAI deep research model |
| `--resume` | `false` | Skip completed providers, resynthesize |
| `--list` | — | List all playgrounds and exit |
| `--project-root` | auto-detect | Override project root path |
