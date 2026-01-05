# piatra.institute

Interactive research playgrounds exploring ideas at the intersection of science, mathematics, economics, and philosophy.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js development server |
| `pnpm build` | Run prebuild and build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint on app and components |
| `pnpm test` | Run tests with Vitest |
| `pnpm og` | Generate Open Graph images for playgrounds |
| `pnpm og:dry` | Preview OG image generation (dry run) |

## Project Structure

```
piatra-institute-web/
├── app/                    # Next.js App Router
│   ├── (primary)/          # Primary route group (home)
│   ├── papers/             # Research papers section
│   ├── platforms/          # Platforms section
│   ├── playgrounds/        # Interactive playgrounds
│   │   ├── (2024)/         # 2024 playgrounds
│   │   ├── (2025)/         # 2025 playgrounds
│   │   ├── (2026)/         # 2026 playgrounds
│   │   └── data.ts         # Playground registry
│   ├── press/              # Press section
│   ├── provocations/       # Provocations section
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── assets/                 # Static assets (fonts, templates)
├── components/             # Shared React components
├── data/                   # Shared data and configuration
├── docs/                   # Documentation
├── logic/                  # Shared utilities
├── public/                 # Public static files
│   └── assets-playgrounds/ # Playground assets
│       └── og/             # Open Graph images
├── scripts/                # Build and utility scripts
├── CLAUDE.md               # AI assistant instructions
└── package.json
```

## Tech Stack

- **Framework**: Next.js 16.1 with App Router
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS 4.1
- **UI Libraries**:
  - React Three Fiber (3D graphics)
  - Recharts (data visualization)
  - KaTeX (mathematical notation)
  - D3-Delaunay (computational geometry)
- **Database**: Drizzle ORM with libSQL
- **Testing**: Vitest

## Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and patterns
- [Implementation](docs/IMPLEMENTATION.md) - Development guide

## Design System

The site uses a **black and lime** color palette:

- Background: `#000000` (black)
- Primary accent: `#84cc16` (lime-500)
- Text: lime-tinted whites (`lime-100`, `lime-200`)

See `CLAUDE.md` for detailed design guidelines.

## License

Private repository.
