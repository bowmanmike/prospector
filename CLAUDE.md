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

### Session: 2025-07-16 - SQLite Database Layer Implementation

**Key Accomplishments:**
- **Storage Architecture Design**: Established files-first architecture with hybrid storage strategy (IndexedDB for UI state, SQLite for content metadata)
- **Complete Database Schema**: Created comprehensive schema for vaults, notes, tags, and relationships with proper indexing
- **Type-Safe Query Layer**: Implemented VaultQueries, NoteQueries, and TagQueries classes with full CRUD operations
- **Transaction Support**: Added atomic operations with rollback on failure for data consistency
- **Comprehensive Testing**: Built test suite with 59 passing tests covering all database operations and edge cases
- **Database Infrastructure**: Set up connection management, initialization, and migration system

**Technical Details:**
- Built SQLite3 integration with promisified interface and proper error handling
- Created database schema with foreign key constraints and performance indexes
- Implemented query classes with search capabilities, statistics, and tag management
- Added transaction wrapper for batch operations and data integrity
- Created isolated test database utilities with cleanup and mock data

**Architecture Decisions:**
- **Files as Source of Truth**: Markdown files remain authoritative, database stores only metadata
- **Hybrid Storage**: Browser storage for vault paths/UI state, server storage for parsed content metadata
- **On-Demand Processing**: Parse markdown files on-the-fly while caching metadata for performance
- **Raw SQL**: Chose raw SQL over ORM for performance and flexibility with future vector search

**Current Status:**
- Database layer is complete with full test coverage
- Ready for Next.js API routes and markdown parsing integration
- Foundation established for search functionality and semantic features

**Next Steps:**
- Create Next.js API routes for vault operations and note management
- Implement markdown parser with frontmatter support
- Integrate parsing with SQLite storage via API layer