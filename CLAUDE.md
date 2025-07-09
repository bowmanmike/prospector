# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prospector is an AI-powered knowledge discovery tool for Obsidian vaults that helps users find, connect, and rediscover their notes through intelligent search and passive organization. It's built as a Next.js/TypeScript application that provides a search-first interface for existing Obsidian vaults, using local LLMs for content understanding and semantic search.

## Core Architecture

- **Frontend**: Next.js 15+ with TypeScript and App Router
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming
- **Code Quality**: Biome for linting and formatting
- **Local LLM Integration**: Planned integration with Ollama or LM Studio
- **Search**: Vector embeddings for semantic search (planned)
- **Database**: Local SQLite for metadata and embeddings (planned)
- **Deployment**: Docker/Docker Compose for local distribution (planned)

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format

# Check and fix code issues
npm run fix
```

## Testing Strategy

The project uses modern TypeScript/Next.js testing patterns:

- **Jest + React Testing Library**: Unit and integration tests for React components and utility functions
- **Playwright**: End-to-end testing for user workflows and full application behavior
- **Testing file organization**: 
  - Unit tests: `*.test.ts` or `*.test.tsx` files alongside source code
  - E2E tests: `tests/` or `e2e/` directory structure
  - Test utilities: `__tests__/utils/` for shared testing helpers

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run all tests
npm run test:all
```

## Key Technical Details

### File Structure
- Uses Next.js App Router (`src/app/`)
- TypeScript with strict mode enabled
- Path mapping configured for `@/*` imports to `./src/*`
- Biome configuration uses 2-space indentation and double quotes

### Styling
- Tailwind CSS with custom theme configuration
- CSS variables for consistent theming (`--background`, `--foreground`)
- Dark mode support via `prefers-color-scheme`
- Geist font family (Sans and Mono variants)

### Code Quality
- Biome handles linting, formatting, and import organization
- TypeScript configured with strict settings
- Recommended Biome rules enabled

## Project Status

This is currently a fresh Next.js project with basic setup. The actual Prospector features (Obsidian vault integration, semantic search, local LLM integration) are planned but not yet implemented. See PROJECT_OVERVIEW.md for detailed user stories and implementation phases.

## Development Notes

- The project is designed to run entirely locally (no cloud dependencies)
- Privacy-first approach with local LLM processing
- Obsidian-compatible markdown parsing will be required
- Vector embeddings and semantic search are core features
- Docker containerization planned for distribution