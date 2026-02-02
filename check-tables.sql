-- First, let's see what tables already exist
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;