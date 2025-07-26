# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Guidelines & Expectations

### Code Quality Standards

**MANDATORY: Pre-commit Quality Checks**
- **ALWAYS run `npm run fix` before any commit** to ensure consistent linting and formatting
- **NEVER commit with failing tests** - All tests must pass (75/75) before any feature is considered complete
- **NEVER commit with linting errors or warnings** - The codebase must maintain zero linting issues
- Run `npm test && npm run lint` to verify quality before any commit

### Decision Making & Technical Discussions

**Critical Thinking Expected**
- **Push back on user suggestions** when they may not be optimal solutions
- **Justify technical decisions in detail** - explain trade-offs, alternatives, and reasoning
- **Don't just agree** - Challenge approaches and suggest better alternatives when appropriate
- **Consider long-term maintainability** over quick fixes
- **Question architectural choices** that might introduce complexity or technical debt

Examples of good pushback:
- "That approach might work, but have you considered X? It would provide Y benefits and avoid Z risks"
- "I understand the request, but this could lead to [specific problem]. Here's an alternative that achieves the same goal"
- "While that's possible, it goes against [established pattern/best practice]. Let me explain why and suggest a better approach"

### Feature Completion Definition

A feature is **ONLY complete** when:
- ✅ All functionality works as specified
- ✅ All existing tests continue to pass (75/75)
- ✅ New functionality has appropriate test coverage
- ✅ Zero linting errors or warnings (`npm run lint`)
- ✅ Code is properly formatted (`npm run fix`)
- ✅ Documentation is updated to reflect changes
- ✅ No console errors or warnings in development

**NO EXCEPTIONS** - Failing tests or linting issues mean the feature is incomplete, regardless of functional requirements.

## Project Overview

Prospector is an AI-powered knowledge discovery tool for Obsidian vaults that helps users find, connect, and rediscover their notes through intelligent search and passive organization. It's built as a Next.js/TypeScript application that provides a search-first interface for existing Obsidian vaults, using local LLMs for content understanding and semantic search.

## Core Architecture

- **Frontend**: Next.js 15+ with TypeScript and App Router
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming
- **Code Quality**: Biome for linting and formatting
- **Testing**: Jest + React Testing Library with comprehensive unit tests
- **Storage**: SQLite for vault metadata and file persistence
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
- ✅ SQLite database layer with comprehensive testing
- ✅ Responsive landing page with loading states and vault management
- ✅ Complete SQLite database layer with comprehensive testing
- ✅ Three-layer architecture (Database → Business Logic → HTTP)
- ✅ Full CRUD API for vault operations with pre-initialized handlers
- ✅ Comprehensive business logic testing (11 passing tests)

**Upcoming Features:**
- Parse markdown files with frontmatter support
- Display basic vault statistics (note count, tag count)
- Implement search functionality and semantic search with local LLM integration

See PROJECT_OVERVIEW.md for detailed user stories and implementation phases.

## Project Planning & Roadmaps

**Implementation roadmaps** are maintained in `docs/roadmaps/` with detailed breakdowns of major features:
- Current focus: [Markdown Parsing & Search](docs/roadmaps/markdown-parsing-and-search.md)

These roadmaps provide phase-by-phase implementation plans that persist across Claude sessions and serve as the definitive reference for complex features.

## Development Notes

- The project is designed to run entirely locally (no cloud dependencies)
- Privacy-first approach with local LLM processing
- Obsidian-compatible markdown parsing will be required
- Vector embeddings and semantic search are core features
- Docker containerization planned for distribution

## Previous Session Summary

*This section should be updated at the end of each Claude Code session with a brief summary of what was accomplished. Replace this content with the current session's work.*

### Session: 2025-07-26 - Modernize Architecture & Fix All Linting Issues

**Key Accomplishments:**
- **Architecture Modernization**: Successfully migrated from API routes to Next.js 15 Server Actions for better performance and developer experience
- **Complete IndexedDB Removal**: Eliminated all IndexedDB code and references, simplifying to SQLite-only architecture
- **Code Quality Improvements**: Fixed all linting and formatting issues (Node.js imports, type safety, unused variables)
- **Test Infrastructure Cleanup**: Reorganized test utilities and ensured all 75 tests pass after migration
- **Handler Consolidation**: Merged redundant handler files into clean, maintainable structure

**Technical Changes:**
- **Server Actions Migration**: Replaced REST API routes with Next.js Server Actions (`createVault`, `getVaults`, `deleteVault`, `getVaultWithStats`)
- **Frontend Integration**: Updated React components to use Server Actions with `useTransition` for loading states
- **Type Safety Enhancements**: Replaced `any` types with `unknown`, fixed null assertions, improved TypeScript compliance
- **Import Modernization**: Updated all Node.js imports to use `node:` protocol (`node:fs`, `node:path`, `node:util`)
- **Test Utilities Reorganization**: Moved shared test utilities from `__tests__/` to proper location (`src/lib/database/test-utils.ts`)

**Architecture Benefits:**
- **Modern Next.js Patterns**: Using Server Actions instead of API routes aligns with Next.js 15 best practices
- **Simplified Data Flow**: Direct server-side function calls eliminate HTTP layer complexity
- **Better Performance**: Server Actions provide automatic loading states and optimistic updates
- **Type Safety**: End-to-end TypeScript type safety from frontend to database
- **Cleaner Testing**: Direct function testing instead of HTTP mocking

**Code Quality Results:**
- **Linting**: ✅ Clean (0 errors, 0 warnings)
- **Tests**: ✅ All passing (75/75 tests)
- **Formatting**: ✅ Consistent across all files
- **Type Safety**: ✅ Improved with `unknown` instead of `any`

**Files Removed:**
- All API route files (`src/app/api/vaults/`)
- IndexedDB implementation (`src/lib/storage.ts` and tests)
- Duplicate handler files (`handlers-instance.ts`)
- Old test utilities in wrong location

**Files Added:**
- Server Actions (`src/app/actions/vault-actions.ts`)
- Consolidated handlers (`src/lib/handlers/vault-handlers.ts`)
- Properly located test utilities (`src/lib/database/test-utils.ts`)

**Current Status:**
- Modern Next.js 15 architecture with Server Actions
- Clean, lint-free codebase with consistent formatting
- Complete test coverage with proper organization
- SQLite-only data persistence (no IndexedDB complexity)
- Ready for markdown parsing and note management features

**Outstanding TODOs:**
1. Implement proper logging system to replace console.* usage (low priority)

**Next Steps:**
- Implement markdown parsing with frontmatter support
- Create note management using the established Server Actions pattern
- Add semantic search capabilities with local LLM integration