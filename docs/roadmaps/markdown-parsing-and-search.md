# Markdown Parsing & Search Implementation Roadmap

**Status:** In Planning  
**Priority:** High  
**Estimated Complexity:** Major Feature (4 phases)  
**Start Date:** TBD  

## Overview

Transform Prospector from a vault management tool to a search-first knowledge discovery interface. This involves scanning markdown files, parsing metadata, and providing intelligent search capabilities.

## Key Architectural Decisions

- **Search-first UI:** Pivot from file browser to search-focused interface
- **Metadata-first storage:** Store frontmatter and statistics in SQLite, read content on-demand
- **Hybrid file handling:** Eager file discovery, lazy content parsing
- **Incremental implementation:** 4 phases with discrete, testable steps

## Implementation Phases

### 🚀 Phase 1: File Discovery & Basic UI (High Priority)

**Goal:** Establish file scanning infrastructure and transform UI to search-first paradigm.

**Key Deliverables:**
- File system scanning utility
- Database schema for notes
- Search-first UI layout
- Basic file listing with metadata

**Technical Details:**
- Scan vault directory for `.md` files recursively
- Store file paths, names, and modification dates
- Replace current vault management UI with search interface
- Display files in a searchable list format

**Detailed Steps:**
1. Create file scanning utility function
2. Add database schema for notes table
3. Create file scanning Server Action
4. Design search-first UI layout
5. Replace vault management UI with search interface
6. Display file list with basic metadata (name, path, modified date)
7. Add comprehensive tests for file scanning

### 📊 Phase 2: Metadata Parsing & Storage (Medium Priority)

**Goal:** Parse markdown frontmatter and content to extract searchable metadata.

**Key Deliverables:**
- YAML frontmatter parsing
- Content analysis (word count, statistics)
- Batch processing for large vaults
- Database indexing for performance

**Technical Details:**
- Parse YAML frontmatter for title, tags, custom fields
- Calculate word count, character count, content hash
- Store parsed metadata in SQLite with proper indexing
- Handle batch processing for vaults with 1000+ notes

**Detailed Steps:**
1. Install and configure YAML frontmatter parsing library
2. Create frontmatter parsing utility functions
3. Add content analysis utilities (word count, char count)
4. Create note metadata Server Actions (create, update, get)
5. Implement batch processing for large vaults
6. Add database indexing for search performance
7. Add tests for frontmatter parsing and metadata storage

### 🔍 Phase 3: Search & Discovery (Medium Priority)

**Goal:** Implement search functionality and vault statistics dashboard.

**Key Deliverables:**
- Text search across note content and metadata
- Tag-based filtering
- Vault statistics calculation and display
- Search performance optimization

**Technical Details:**
- Full-text search across titles, content, and frontmatter
- Filter by tags, creation date, modification date
- Calculate and display vault statistics (note count, tag usage, etc.)
- Optimize search queries with proper indexing

**Detailed Steps:**
1. Implement basic text search Server Action
2. Add search UI with real-time filtering
3. Implement tag-based filtering
4. Create vault statistics calculation Server Action
5. Add vault statistics dashboard to UI
6. Add search performance optimizations
7. Add comprehensive search and filtering tests

### 📖 Phase 4: Content Display (Low Priority)

**Goal:** Add note preview and reading capabilities with proper markdown rendering.

**Key Deliverables:**
- Note content reading from filesystem
- Markdown rendering with Obsidian compatibility
- Note preview/reading interface
- Basic note navigation

**Technical Details:**
- Read full markdown content on-demand from files
- Render markdown with support for Obsidian-style wiki links
- Create reading interface for individual notes
- Handle internal linking between notes

**Detailed Steps:**
1. Create note content reading Server Action
2. Add markdown rendering library and configuration
3. Create note preview/reading UI component
4. Implement proper Obsidian-style markdown rendering
5. Add note navigation and linking
6. Add tests for note content display

## Success Criteria

### Phase 1 Complete When:
- ✅ File scanning works reliably for vaults of various sizes
- ✅ UI successfully transformed to search-first paradigm
- ✅ Basic file listing displays with correct metadata
- ✅ All existing tests continue to pass
- ✅ New functionality has comprehensive test coverage

### Phase 2 Complete When:
- ✅ Frontmatter parsing handles various YAML formats correctly
- ✅ Content analysis provides accurate statistics
- ✅ Batch processing works efficiently for large vaults (1000+ notes)
- ✅ Database queries perform well with proper indexing

### Phase 3 Complete When:
- ✅ Search functionality works intuitively and quickly
- ✅ Filtering provides expected results
- ✅ Vault statistics accurately reflect vault contents
- ✅ Search performance is acceptable for target vault sizes

### Phase 4 Complete When:
- ✅ Note content displays properly with markdown rendering
- ✅ Obsidian-style features work as expected
- ✅ Note navigation provides smooth user experience
- ✅ Reading interface is polished and functional

## Risk Assessment

**High Risk:**
- UI transformation may break existing functionality
- File system performance on large vaults
- Frontmatter parsing edge cases

**Medium Risk:**
- Search performance optimization
- Database migration complexity
- Cross-platform file system compatibility

**Mitigation Strategies:**
- Implement incremental changes with rollback capability
- Add comprehensive testing at each phase
- Performance testing with large sample vaults
- Graceful error handling for file parsing failures

## Dependencies

**External:**
- YAML parsing library (likely `gray-matter` or `js-yaml`)
- Markdown rendering library (likely `remark` ecosystem)

**Internal:**
- Existing vault infrastructure
- Server Actions architecture
- SQLite database schema
- Test infrastructure

## Future Considerations

This roadmap focuses on core functionality. Future enhancements might include:
- Semantic search with vector embeddings
- Advanced filtering and sorting options
- Note editing capabilities
- Export functionality
- Performance optimizations for very large vaults

---

**Last Updated:** 2025-01-26  
**Next Review:** After Phase 1 completion