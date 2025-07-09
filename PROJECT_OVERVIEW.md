# Prospector

An AI-powered knowledge discovery tool for Obsidian vaults that helps you find,
connect, and rediscover your notes through intelligent search and passive
organization.

## Project Overview

Prospector is a Next.js/TypeScript application that provides a search-first
interface for your existing Obsidian vault. Instead of forcing manual
organization, it uses a local LLM (via Ollama or LM Studio) to understand your
notes' content and surface relevant connections automatically.

### Core Philosophy

- **Search-first**: Built for people who prefer searching over manual sorting
- **Passive organization**: Organize in the background without user overhead
- **Privacy-first**: All processing happens locally with your own LLM
- **Local-only**: No cloud deployment, runs entirely on your machine
- **Obsidian-compatible**: Works with your existing vault structure

### Technology Stack

- **Frontend**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS
- **Local LLM**: Ollama or LM Studio integration
- **File Processing**: Direct filesystem access to Obsidian vault
- **Search**: Vector embeddings for semantic search
- **Database**: Local SQLite for metadata and embeddings
- **Deployment**: Docker/Docker Compose for local distribution

## User Stories (Priority Order)

### Phase 1: Core Search & Discovery

#### 1. Basic Vault Connection

**As a user, I want to connect my Obsidian vault so the app can read my notes**

- [ ] File browser to select vault directory
- [ ] Parse markdown files with frontmatter
- [ ] Handle Obsidian-specific syntax (wiki links, tags, etc.)
- [ ] Display basic vault statistics (note count, tag count)

#### 2. Enhanced Search Interface

**As a user, I want to search my notes using natural language**

- [ ] Natural language search input
- [ ] Display search results with context snippets
- [ ] Highlight relevant passages in search results
- [ ] Show note metadata (created date, tags, folder)

#### 3. Semantic Search

**As a user, I want to find notes by concept, not just keywords**

- [ ] Generate embeddings for all notes using local LLM
- [ ] Store embeddings in local database
- [ ] Implement semantic similarity search
- [ ] Combine keyword and semantic search results

#### 4. Note Preview & Reading

**As a user, I want to read my notes within the app**

- [ ] Full note display with proper markdown rendering
- [ ] Render Obsidian wiki links and tags
- [ ] Show note metadata and creation date
- [ ] Basic navigation between linked notes

### Phase 2: Intelligent Discovery

#### 5. Related Notes Discovery

**As a user, I want to see notes related to what I'm currently reading**

- [ ] Show similar notes in sidebar while reading
- [ ] Calculate content similarity using embeddings
- [ ] Surface notes from different time periods
- [ ] Exclude overly similar/duplicate content

#### 6. Contextual Search

**As a user, I want search results that understand what I'm working on**

- [ ] "Find notes like this one" functionality
- [ ] Context-aware search based on current note
- [ ] Time-based search ("notes from when I wrote this")
- [ ] Topic clustering to find related work

#### 7. Rediscovery Features

**As a user, I want to rediscover forgotten but relevant notes**

- [ ] "Notes you haven't seen in a while" suggestions
- [ ] Surface old notes when writing about similar topics
- [ ] Identify patterns in note-taking topics
- [ ] Suggest relevant notes during active writing

### Phase 3: Passive Organization

#### 8. Automatic Tagging Suggestions

**As a user, I want the system to suggest tags without forcing me to use them**

- [ ] Analyze note content to suggest relevant tags
- [ ] Learn from existing tagging patterns
- [ ] Show suggested tags in note view
- [ ] Batch tag similar notes with user approval

#### 9. Content Analysis Dashboard

**As a user, I want insights into my knowledge base**

- [ ] Show topic clusters and themes
- [ ] Identify gaps or areas of focus
- [ ] Display note creation patterns over time
- [ ] Surface notes that need attention

#### 10. Virtual Collections

**As a user, I want automatic groupings without manual folder management**

- [ ] Create virtual folders based on content similarity
- [ ] Show topic-based collections
- [ ] Generate project-based groupings
- [ ] Provide time-based views (recent work, etc.)

### Phase 4: Advanced Features

#### 11. Note Connections Graph

**As a user, I want to visualize connections between my notes**

- [ ] Generate knowledge graph based on content similarity
- [ ] Interactive visualization of note relationships
- [ ] Identify clusters and isolated notes
- [ ] Show connection strength and types

#### 12. AI-Powered Summarization

**As a user, I want AI to help me understand my notes at a glance**

- [ ] Generate summaries of long notes
- [ ] Extract key insights and action items
- [ ] Identify main themes across multiple notes
- [ ] Create topic overviews from related notes

#### 13. Writing Assistant

**As a user, I want help while creating new notes**

- [ ] Suggest related notes while writing
- [ ] Warn about potential duplicates
- [ ] Recommend tags and connections
- [ ] Fill in knowledge gaps with suggestions

#### 14. Bulk Operations

**As a user, I want to make organizational changes efficiently**

- [ ] Batch approve/reject tagging suggestions
- [ ] Bulk organize notes by topic
- [ ] Mass update tags and metadata
- [ ] Generate organizational reports

### Phase 5: Polish & Performance

#### 15. Performance Optimization

**As a user, I want the app to be fast and responsive**

- [ ] Optimize embedding generation and storage
- [ ] Implement incremental indexing
- [ ] Cache search results and computations
- [ ] Background processing for large vaults

#### 16. User Experience Enhancements

**As a user, I want a polished, intuitive interface**

- [ ] Dark/light theme matching Obsidian
- [ ] Keyboard shortcuts for power users
- [ ] Customizable layout and preferences
- [ ] Export/import settings and data

#### 17. Distribution & Deployment

**As a user, I want easy local installation and setup**

- [ ] Create Dockerfile for containerized deployment
- [ ] Docker Compose setup with all dependencies
- [ ] Installation documentation and setup guide
- [ ] Automatic LLM model download and configuration
- [ ] Health checks and service monitoring

## Technical Implementation Notes

### Local LLM Integration

- Support for Ollama and LM Studio APIs
- Model selection for different tasks (embeddings vs. text generation)
- Fallback handling when LLM is unavailable
- Batch processing for large vaults

### File System Integration

- Watch for changes in vault directory
- Handle file moves, renames, and deletions
- Respect Obsidian's file structure and naming conventions
- Support for different markdown flavors

### Search Architecture

- Hybrid search combining keyword and semantic results
- Efficient vector storage and retrieval
- Incremental indexing for large vaults
- Search result ranking and relevance scoring

### Data Storage

- SQLite for metadata, embeddings, and search indices
- File-based cache for processed content
- Backup and restore functionality
- Data migration strategies

### Local Deployment

- Docker containerization for consistent environments
- Docker Compose orchestration with LLM services
- Volume mounting for vault access and data persistence
- Environment configuration for different setups
- No external dependencies or cloud services

## Safe Development Workflow

To protect your main Obsidian vault during development, set up a one-way replica
using Syncthing:

### Syncthing Setup (Recommended)

1. **Install Syncthing** on both your main system and development environment
2. **Configure Main Vault** as a "Send Only" folder in Syncthing
3. **Configure Dev Replica** as a "Receive Only" folder in Syncthing
4. **Point Prospector** to read from the replica directory, never the original

This ensures:

- Real-time sync of changes from main vault → dev environment
- No risk of accidental modifications to your original vault
- Full testing capability with current data
- Easy rollback if anything goes wrong

### Alternative Options

**File Watcher Script**: Create a Node.js script that watches your main vault
and copies changes to dev replica

```bash
# Simple rsync alternative
rsync -av --delete /path/to/main/vault/ /path/to/dev/replica/
```

**Git-based** (if vault is in Git): Clone your vault repo to dev environment,
periodically pull changes, never push from dev

### Development Safety Checklist

- [ ] Prospector only reads from replica, never writes to original vault
- [ ] Sync is one-way: main → dev only
- [ ] Test file operations on replica first
- [ ] Backup your main vault before any major testing
- [ ] Keep dev environment clearly separated from production

## Success Metrics

- **User adopts search-first workflow**: Reduced time spent on manual
  organization
- **Improved note discovery**: Users find and reference older notes more
  frequently
- **Enhanced productivity**: Faster access to relevant information
- **Seamless integration**: Works naturally with existing Obsidian workflows

