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
- ✅ Complete SQLite database layer with comprehensive testing
- ✅ Three-layer architecture (Database → Business Logic → HTTP)
- ✅ Full CRUD API for vault operations with pre-initialized handlers
- ✅ Comprehensive business logic testing (11 passing tests)

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

### Session: 2025-07-25 - Complete Vault API with Three-Layer Architecture

**Key Accomplishments:**
- **Three-Layer Architecture**: Implemented clean separation between Database → Business Logic → HTTP layers
- **Pre-Initialized Handlers**: Created performance-optimized handler system with database connection at boot time
- **Complete Vault CRUD API**: Built full REST API for vault operations (GET, POST, DELETE) with proper HTTP status codes
- **Comprehensive Testing**: Added 11 passing tests for business logic layer using real SQLite databases
- **Manual API Testing**: Verified all endpoints work correctly with proper error handling and validation

**Technical Implementation:**
- **Database Layer**: VaultQueries classes with raw SQL and type safety
- **Business Logic Layer**: Pure handler functions with domain validation and error handling
- **HTTP Layer**: Next.js API routes handling only HTTP concerns (request parsing, status codes, JSON responses)
- **Handler Initialization**: Singleton pattern with lazy initialization and explicit dependency injection for testing
- **Real Database Testing**: Used actual SQLite databases in tests instead of complex mocking

**Architecture Benefits:**
- **Performance**: Database connection established once at boot, not per request
- **Testability**: Each layer tested independently with clear boundaries
- **Maintainability**: Business logic completely separate from HTTP and database concerns
- **Type Safety**: Full TypeScript coverage with proper error handling

**API Endpoints Implemented:**
- `GET /api/vaults` - List all vaults
- `POST /api/vaults` - Create vault with validation and duplicate checking
- `GET /api/vaults/[id]` - Get vault details with statistics
- `DELETE /api/vaults/[id]` - Delete vault with existence validation

**Current Status:**
- Vault API is fully functional and manually tested
- Business logic has comprehensive test coverage
- Clean architecture established for future features
- Ready for markdown parsing and note management APIs

**Outstanding TODOs:**
1. Fix API route HTTP tests (NextRequest mocking issues)
2. Address Next.js 15 async params warning in dynamic routes
3. Consider consolidating handlers.ts and handlers-instance.ts files

**Next Steps:**
- Resolve remaining test issues and Next.js warnings
- Implement markdown parsing with frontmatter support
- Create note management API using the same three-layer pattern