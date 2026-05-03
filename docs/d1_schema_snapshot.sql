-- D1 schema snapshot for astro-portfolio
-- Source: wrangler binding DB (database: portfolio_content_prod)
-- Captured: 2026-05-03
-- Notes:
-- 1) This file is a structural snapshot (DDL + relationship/index notes).
-- 2) SQLite auto indexes are implicit and are listed in the inventory section.

PRAGMA foreign_keys = ON;

-- ============================================================================
-- RELATIONSHIP MAP (from pragma_foreign_key_list)
-- ============================================================================
-- documents.case_study_id -> case_studies.id (ON DELETE CASCADE)
-- documents.parent_id -> documents.id (ON DELETE CASCADE)
-- document_assets.document_id -> documents.id (ON DELETE CASCADE)

-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE _cf_KV (
        key TEXT PRIMARY KEY,
        value BLOB
      ) WITHOUT ROWID;

CREATE TABLE case_studies (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'outline',
  source_root_doc_id TEXT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  nav_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  synced_at TEXT,
  source_collection_id TEXT
);

CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  case_study_id TEXT NOT NULL,
  parent_id TEXT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  slug_path TEXT NOT NULL UNIQUE,
  depth INTEGER NOT NULL DEFAULT 0,
  nav_order INTEGER NOT NULL DEFAULT 0,
  is_root INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 1,
  outline_updated_at TEXT,
  checksum TEXT,
  excerpt TEXT,
  body_md TEXT NOT NULL,
  body_html TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  synced_at TEXT,
  FOREIGN KEY (case_study_id) REFERENCES case_studies(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE TABLE document_assets (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE VIRTUAL TABLE document_search USING fts5(
  document_id UNINDEXED,
  case_study_id UNINDEXED,
  title,
  excerpt,
  body_md,
  tokenize='unicode61'
);

CREATE TABLE 'document_search_config'(k PRIMARY KEY, v) WITHOUT ROWID;
CREATE TABLE 'document_search_content'(id INTEGER PRIMARY KEY, c0, c1, c2, c3, c4);
CREATE TABLE 'document_search_data'(id INTEGER PRIMARY KEY, block BLOB);
CREATE TABLE 'document_search_docsize'(id INTEGER PRIMARY KEY, sz BLOB);
CREATE TABLE 'document_search_idx'(segid, term, pgno, PRIMARY KEY(segid, term)) WITHOUT ROWID;

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

CREATE TABLE sync_runs (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL DEFAULT 'outline',
  started_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  finished_at TEXT,
  status TEXT NOT NULL,
  docs_total INTEGER NOT NULL DEFAULT 0,
  docs_inserted INTEGER NOT NULL DEFAULT 0,
  docs_updated INTEGER NOT NULL DEFAULT 0,
  docs_deleted INTEGER NOT NULL DEFAULT 0,
  error_text TEXT
);

-- ============================================================================
-- INDEXES (explicit, non-auto)
-- ============================================================================

CREATE INDEX idx_assets_doc_order ON document_assets(document_id, sort_order);

CREATE INDEX idx_case_studies_nav ON case_studies(is_visible, nav_order, title);
CREATE INDEX idx_case_studies_source_collection
  ON case_studies(source_collection_id, is_visible, nav_order);
CREATE INDEX idx_case_studies_visible_order
  ON case_studies(is_visible, nav_order);

CREATE INDEX idx_documents_case_order
  ON documents(case_study_id, is_published, depth, nav_order);
CREATE INDEX idx_documents_case_parent_order
  ON documents(case_study_id, parent_id, nav_order, title);
CREATE INDEX idx_documents_case_path
  ON documents(case_study_id, slug_path);
CREATE INDEX idx_documents_outline_updated
  ON documents(outline_updated_at);
CREATE INDEX idx_documents_parent
  ON documents(parent_id);

CREATE INDEX idx_outline_collections_visible_order
  ON outline_collections(is_visible, nav_order);

-- ============================================================================
-- AUTO INDEX INVENTORY (implicit by PK/UNIQUE, shown for reference)
-- ============================================================================
-- sqlite_autoindex_case_studies_1
-- sqlite_autoindex_case_studies_2
-- sqlite_autoindex_document_assets_1
-- sqlite_autoindex_documents_1
-- sqlite_autoindex_documents_2
-- sqlite_autoindex_outline_collections_1
-- sqlite_autoindex_sync_runs_1

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER trg_documents_ai AFTER INSERT ON documents BEGIN
  INSERT INTO document_search (rowid, document_id, case_study_id, title, excerpt, body_md)
  VALUES (new.rowid, new.id, new.case_study_id, new.title, coalesce(new.excerpt,''), coalesce(new.body_md,''));
END;

CREATE TRIGGER trg_documents_au AFTER UPDATE ON documents BEGIN
  UPDATE document_search
  SET document_id = new.id,
      case_study_id = new.case_study_id,
      title = new.title,
      excerpt = coalesce(new.excerpt,''),
      body_md = coalesce(new.body_md,'')
  WHERE rowid = new.rowid;
END;

CREATE TRIGGER trg_documents_ad AFTER DELETE ON documents BEGIN
  DELETE FROM document_search WHERE rowid = old.rowid;
END;
