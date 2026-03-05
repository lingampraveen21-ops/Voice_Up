-- Add missing columns to sessions table to match frontend expectations
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS lesson_id text;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS type text;

-- Add comment to clarify usage
COMMENT ON COLUMN sessions.type IS 'Deprecated: use activity_type for new sessions. Kept for compatibility.';
COMMENT ON COLUMN sessions.activity_type IS 'Primary column for session activity types (e.g., speaking, quiz, etc.)';
