# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prospector is an AI-powered knowledge discovery tool for Obsidian vaults that helps users find, connect, and rediscover their notes through intelligent search and passive organization. It's built as a Next.js/TypeScript application that provides a search-first interface for existing Obsidian vaults, using local LLMs for content understanding and semantic search.

## Core Architecture

- **Frontend**: Next.js 15+ with TypeScript and App Router
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming
- **Code Quality**: Biome for linting and formatting
- **Testing**: Jest + React Testing Library with comprehensive unit tests
- **Storage**: IndexedDB for vault metadata and file persistence
- **Local LLM Integration**: Planned integration with Ollama or LM Studio
- **Search**: Vector embeddings for semantic search (planned)
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

# Run tests with coverage
npm run test:coverage
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

**Current Implementation:**
- ✅ Vault directory selection with persistent browser storage
- ✅ Obsidian vault validation and error handling
- ✅ IndexedDB storage layer with comprehensive testing
- ✅ Responsive landing page with loading states and vault management

**Upcoming Features:**
- Parse markdown files with frontmatter support
- Display basic vault statistics (note count, tag count)
- Implement search functionality and semantic search with local LLM integration

See PROJECT_OVERVIEW.md for detailed user stories and implementation phases.

## Development Notes

- The project is designed to run entirely locally (no cloud dependencies)
- Privacy-first approach with local LLM processing
- Obsidian-compatible markdown parsing will be required
- Vector embeddings and semantic search are core features
- Docker containerization planned for distribution

## Previous Session Summary

*This section should be updated at the end of each Claude Code session with a brief summary of what was accomplished. Replace this content with the current session's work.*

### Session: 2025-01-09 - Vault Selection and Persistence

**Key Accomplishments:**
- **Vault Directory Selection**: Implemented landing page with file browser to select Obsidian vault directories
- **IndexedDB Persistence**: Built comprehensive storage layer that persists vault connections across browser sessions
- **Vault Validation**: Added automatic detection of valid Obsidian vaults (checks for .obsidian folder)
- **Simplified Architecture**: Unified approach using webkitdirectory API for all browsers instead of complex File System Access API branching
- **Performance Optimizations**: Addressed Firefox slowness with deferred validation and reduced data redundancy
- **Comprehensive Testing**: Set up Jest + React Testing Library with 100% coverage for VaultStorage class

**Technical Details:**
- Built `VaultStorage` class with IndexedDB integration for persistent file metadata storage
- Created responsive landing page with loading states, error handling, and vault management UI
- Implemented vault clearing/changing functionality with proper state management
- Added 14 comprehensive unit tests covering all storage operations and edge cases

**Current Status:**
- Phase 1, Task 1 of PROJECT_OVERVIEW.md is complete (Basic Vault Connection)
- Users can select a vault directory once and it persists across browser sessions
- Foundation is ready for next phase: parsing and displaying vault contents

**Next Steps:**
- Parse markdown files with frontmatter support
- Display basic vault statistics (note count, tag count)
- Begin implementing search functionality