-- ════════════════════════════════════════════════════════════════════
--  Seed testing departments + borrowing users onto an existing database.
--
--  V2 added the department column as NULL. The app's DefaultUserInitializer
--  seeds demo users only on a brand-new (empty) user table, so databases
--  created before this feature have just the admin user and an empty
--  department picker. This migration:
--    1. gives admin a home department, and
--    2. inserts a handful of demo store-keepers across several departments,
--       reusing admin's password hash so they can sign in with the same
--       password ('admin123' on the default install).
--
--  Guards keep it correct on a fresh database too: at migration time a fresh
--  DB has no users yet (admin is created later by the app runner), so the
--  EXISTS check skips the inserts and the runner seeds the demo users itself.
-- ════════════════════════════════════════════════════════════════════

-- 1. Give the bootstrap admin a home department.
UPDATE users.users SET department = 'Stores'
WHERE username = 'admin' AND department IS NULL;

-- 2. Insert demo borrowing users (only when admin exists and they don't already).
INSERT INTO users.users
    (id, version, username, password_hash, display_name, role, department, enabled, created_at)
SELECT gen_random_uuid(), 0, d.username,
       (SELECT password_hash FROM users.users WHERE username = 'admin'),
       d.display_name, 'STORE_KEEPER', d.department, TRUE, now()
FROM (VALUES
    ('k.silva',       'Kasun Silva',        'Maintenance'),
    ('n.perera',      'Nimal Perera',       'Maintenance'),
    ('a.fernando',    'Amaya Fernando',     'Production'),
    ('r.jayasuriya',  'Ravi Jayasuriya',    'Production'),
    ('s.bandara',     'Sahan Bandara',      'Logistics'),
    ('t.dias',        'Tharindu Dias',      'Quality'),
    ('m.gunawardena', 'Malsha Gunawardena', 'Engineering')
) AS d(username, display_name, department)
WHERE EXISTS (SELECT 1 FROM users.users WHERE username = 'admin')
  AND NOT EXISTS (SELECT 1 FROM users.users e WHERE e.username = d.username);

-- 3. Catch-all: any other pre-existing user without a department lands in Stores.
UPDATE users.users SET department = 'Stores' WHERE department IS NULL;
