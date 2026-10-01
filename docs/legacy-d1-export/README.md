# Legacy portfolio source archive

Read-only archive of remote Cloudflare D1 `portfolio_content_prod`, plus every static case study in `src/content/work` at repository commit `de99a7d77b2a2b147115aa03692a743aefd3c6cb` (`origin/main` at export). The application and main branch were not changed.

## Inventory

- case_studies: 4 rows (four projects).
- documents: 31 rows (4 roots and 27 children).
- outline_collections: 2 rows.
- document_assets: 0 rows.
- Static case studies: 13 files, preserved byte-for-byte.
- Static supporting diagrams and images: 12 files.

The user explicitly approved including all four D1 projects, including the OCS application material, and all static repository projects.

## Preservation rules

Each D1 document has archival YAML frontmatter followed immediately by the original body_md UTF-8 bytes, without rewriting, normalizing newlines or appending a final newline. Root documents also retain their complete case_studies metadata. All source columns, including summaries, excerpts, nulls, rendered body_html, relationships, timestamps and ordering, are retained losslessly as values in source-data JSON. No missing values or legacy URLs were invented. Original slug_path values are retained. The manifest lists each project and document separately, although project metadata and its root document share index.md.

Static Markdown and assets are exact Git blob copies under static/, with original directory structure and frontmatter. Original absolute asset links remain unchanged; this is an archive, not a standalone rendered website. Remote images, external linked resources, and binaries outside the copied static asset directories have not been downloaded.

## Schema and exclusions

source-data/schema.sql records the content table schemas. documents.case_study_id references case_studies.id; documents.parent_id references documents.id; document_assets.document_id references documents.id. case_studies.source_collection_id carries collection membership. document_search is a derived FTS5 index; comparison found no content discrepancies. Its backing tables (document_search_config/content/data/docsize/idx) are omitted as generated search storage. _cf_KV and sync_runs operational contents were not exported. No application runtime, credentials, or environment configuration is included.

## Validation

All D1 operations were SELECT queries. Wrangler reported zero rows written and changed_db=false for every archived query result. Source counts match the exported JSON row counts and Markdown document count. Every Markdown body was compared byte-for-byte to its source body; all static files were compared to their Git blobs. source-data/checksums.json records SHA-256 hashes. Duplicate and orphan findings and source overlaps are recorded in manifest.md. No duplicate records were silently dropped.
