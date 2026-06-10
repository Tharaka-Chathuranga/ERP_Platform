-- ════════════════════════════════════════════════════════════════════
--  User module schema: users.
--  Owned exclusively by the user module. No other module may reference
--  these tables directly — cross-module access goes through APIs/events.
--
--  A user has exactly one role, stored inline as a string. Only two roles
--  exist for now: ADMIN (manage: approvals, deletes, master data) and
--  STORE_KEEPER (operate: record goods receipts / issues, view stock).
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE users.users (
    id            UUID PRIMARY KEY,
    version       BIGINT       NOT NULL DEFAULT 0,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(150),
    role          VARCHAR(64)  NOT NULL
                  CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'STORE_KEEPER')),
    enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ,
    created_by    VARCHAR(100),
    updated_at    TIMESTAMPTZ,
    updated_by    VARCHAR(100)
);

CREATE INDEX idx_users_username ON users.users(username);

-- The default admin USER is created at startup by DefaultUserInitializer so the
-- password can be hashed with the live encoder; it is assigned role = 'ADMIN'.
