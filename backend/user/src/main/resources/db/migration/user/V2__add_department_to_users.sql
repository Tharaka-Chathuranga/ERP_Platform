-- ════════════════════════════════════════════════════════════════════
--  Add an optional department to users.
--
--  Used by the store module's goods-issuing flow to pick a borrowing user
--  by department. Kept as a plain string (not a separate Department table)
--  for now — the distinct values seed the department picker. A dedicated
--  Department aggregate can replace this later without touching callers,
--  since cross-module access is via the user module API only.
-- ════════════════════════════════════════════════════════════════════

ALTER TABLE users.users ADD COLUMN department VARCHAR(100);

CREATE INDEX idx_users_department ON users.users(department);
