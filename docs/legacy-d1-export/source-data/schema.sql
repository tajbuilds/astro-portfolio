CREATE TABLE case_studies (   id TEXT PRIMARY KEY,   source TEXT NOT NULL DEFAULT 'outline',   source_root_doc_id TEXT,   title TEXT NOT NULL,   slug TEXT NOT NULL UNIQUE,   summary TEXT,   status TEXT NOT NULL DEFAULT 'published',   nav_order INTEGER NOT NULL DEFAULT 0,   is_visible INTEGER NOT NULL DEFAULT 1,   created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),   updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),   synced_at TEXT , source_collection_id TEXT);

CREATE TABLE documents (   id TEXT PRIMARY KEY,   case_study_id TEXT NOT NULL,   parent_id TEXT,   title TEXT NOT NULL,   slug TEXT NOT NULL,   slug_path TEXT NOT NULL UNIQUE,   depth INTEGER NOT NULL DEFAULT 0,   nav_order INTEGER NOT NULL DEFAULT 0,   is_root INTEGER NOT NULL DEFAULT 0,   is_published INTEGER NOT NULL DEFAULT 1,   outline_updated_at TEXT,   checksum TEXT,   excerpt TEXT,   body_md TEXT NOT NULL,   body_html TEXT,   created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),   updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),   synced_at TEXT,   FOREIGN KEY (case_study_id) REFERENCES case_studies(id) ON DELETE CASCADE,   FOREIGN KEY (parent_id) REFERENCES documents(id) ON DELETE CASCADE );

CREATE TABLE document_assets (   id TEXT PRIMARY KEY,   document_id TEXT NOT NULL,   asset_type TEXT NOT NULL,   url TEXT NOT NULL,   alt_text TEXT,   sort_order INTEGER NOT NULL DEFAULT 0,   created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),   FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE );

CREATE VIRTUAL TABLE document_search USING fts5(   document_id UNINDEXED,   case_study_id UNINDEXED,   title,   excerpt,   body_md,   tokenize='unicode61' );

CREATE TABLE outline_collections (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL DEFAULT 'outline',
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      nav_order INTEGER NOT NULL DEFAULT 0,
      is_visible INTEGER NOT NULL DEFAULT 1,
      synced_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
