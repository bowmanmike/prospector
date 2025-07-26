export interface Vault {
  id: number;
  path: string;
  name: string;
  created_at: string;
  last_scanned: string | null;
}

export interface Note {
  id: number;
  vault_id: number;
  file_path: string;
  file_name: string;
  file_size: number | null;
  modified_time: string | null;
  created_time: string | null;
  content_hash: string | null;
  title: string | null;
  frontmatter_tags: string | null; // JSON array
  frontmatter_data: string | null; // JSON object
  word_count: number | null;
  character_count: number | null;
}

export interface Tag {
  id: number;
  vault_id: number;
  name: string;
  usage_count: number;
}

export interface NoteTag {
  note_id: number;
  tag_id: number;
}

export interface VaultStatistics {
  note_count: number;
  tag_count: number;
  total_words: number;
  total_characters: number;
  last_modified: string | null;
}

export interface CreateVaultInput {
  path: string;
  name: string;
}

export interface CreateNoteInput {
  vault_id: number;
  file_path: string;
  file_name: string;
  file_size?: number;
  modified_time?: string;
  created_time?: string;
  content_hash?: string;
  title?: string;
  frontmatter_tags?: string[];
  frontmatter_data?: Record<string, unknown>;
  word_count?: number;
  character_count?: number;
}

export interface UpdateNoteInput {
  file_size?: number;
  modified_time?: string;
  content_hash?: string;
  title?: string;
  frontmatter_tags?: string[];
  frontmatter_data?: Record<string, unknown>;
  word_count?: number;
  character_count?: number;
}
