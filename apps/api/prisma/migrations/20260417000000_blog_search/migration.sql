-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add generated tsvector column (simple dictionary — language-agnostic)
ALTER TABLE blogs ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('simple',
            coalesce(title, '') || ' ' ||
            coalesce(subtitle, '') || ' ' ||
            coalesce(body, '')
        )
    ) STORED;

-- GIN index for full-text search
CREATE INDEX blogs_search_vector_gin_idx ON blogs USING GIN(search_vector);

-- Trigram indexes for fuzzy matching on title and subtitle
CREATE INDEX blogs_title_trgm_idx ON blogs USING GIN(title gin_trgm_ops);
CREATE INDEX blogs_subtitle_trgm_idx ON blogs USING GIN(subtitle gin_trgm_ops);
