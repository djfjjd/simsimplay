UPDATE posts
SET slug = 'post-' || id,
    updated_at = CURRENT_TIMESTAMP
WHERE slug IS NULL OR TRIM(slug) = '';
