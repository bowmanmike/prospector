-- Vault tracking
CREATE TABLE IF NOT EXISTS vaults (
  id INTEGER PRIMARY KEY,
  path TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_scanned TIMESTAMP
);

-- Note metadata and frontmatter
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY,
  vault_id INTEGER NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  modified_time TIMESTAMP,
  created_time TIMESTAMP,
  content_hash TEXT,
  -- Frontmatter fields
  title TEXT,
  frontmatter_tags TEXT, -- JSON array
  frontmatter_data TEXT, -- JSON blob for custom fields
  -- Computed fields
  word_count INTEGER,
  character_count INTEGER,
  UNIQUE(vault_id, file_path)
);

-- Tags extracted from frontmatter and content
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY,
  vault_id INTEGER NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  UNIQUE(vault_id, name)
);

-- Note-tag relationships
CREATE TABLE IF NOT EXISTS note_tags (
  note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notes_vault_id ON notes(vault_id);
CREATE INDEX IF NOT EXISTS idx_notes_file_path ON notes(vault_id, file_path);
CREATE INDEX IF NOT EXISTS idx_notes_modified_time ON notes(modified_time);
CREATE INDEX IF NOT EXISTS idx_tags_vault_id ON tags(vault_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(vault_id, name);
CREATE INDEX IF NOT EXISTS idx_note_tags_note_id ON note_tags(note_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_tag_id ON note_tags(tag_id);