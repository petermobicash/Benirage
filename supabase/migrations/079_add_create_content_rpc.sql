-- Create RPC function to create content for comments
-- This function allows creating content entries when they don't exist yet

-- Drop existing function if it exists with different signature
DROP FUNCTION IF EXISTS create_content_for_comments;

CREATE OR REPLACE FUNCTION create_content_for_comments(
  p_title TEXT,
  p_slug TEXT,
  p_content TEXT,
  p_type TEXT,
  p_status TEXT,
  p_author TEXT,
  p_author_id UUID DEFAULT NULL
)
RETURNS TABLE (id UUID) AS $$
DECLARE
  v_content_id UUID;
BEGIN
  -- Check if content already exists
  SELECT c.id INTO v_content_id
  FROM content c
  WHERE c.slug = p_slug;

  -- If content doesn't exist, create it
  IF v_content_id IS NULL THEN
    INSERT INTO content (
      title,
      slug,
      content,
      type,
      status,
      author,
      author_id,
      created_at,
      updated_at,
      published_at,
      allow_comments,
      version_number
    ) VALUES (
      p_title,
      p_slug,
      p_content,
      p_type,
      p_status,
      p_author,
      p_author_id,
      NOW(),
      NOW(),
      CASE WHEN p_status = 'published' THEN NOW() ELSE NULL END,
      true,
      1
    )
    RETURNING content.id INTO v_content_id;
  END IF;

  -- Return the content ID
  RETURN QUERY SELECT v_content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION create_content_for_comments TO authenticated, anon;

-- Add comment explaining the function
COMMENT ON FUNCTION create_content_for_comments IS 'Creates a content entry for comment systems when one does not exist. Used by the comment system to initialize content entries on-demand.';