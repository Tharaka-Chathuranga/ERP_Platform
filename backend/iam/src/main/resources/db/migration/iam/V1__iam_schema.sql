-- ════════════════════════════════════════════════════════════════════
--  IAM module schema: users, roles, and their association.
--  Owned exclusively by the iam module. No other module may reference
--  these tables directly — cross-module access goes through APIs/events.
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE iam.roles (
    id          UUID PRIMARY KEY,
    version     BIGINT      NOT NULL DEFAULT 0,
    name        VARCHAR(64) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMPTZ,
    created_by  VARCHAR(100),
    updated_at  TIMESTAMPTZ,
    updated_by  VARCHAR(100)
);

CREATE TABLE iam.users (
    id            UUID PRIMARY KEY,
    version       BIGINT       NOT NULL DEFAULT 0,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(150),
    enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ,
    created_by    VARCHAR(100),
    updated_at    TIMESTAMPTZ,
    updated_by    VARCHAR(100)
);

CREATE TABLE iam.user_roles (
    user_id UUID NOT NULL REFERENCES iam.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES iam.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_users_username ON iam.users(username);

-- Seed the standard role set. The default admin USER is created at startup by
-- DefaultUserInitializer so the password can be hashed with the live encoder.
INSERT INTO iam.roles (id, name, description) VALUES
    (gen_random_uuid(), 'ADMIN',         'Full administrative access'),
    (gen_random_uuid(), 'STORE_MANAGER', 'Manage items, warehouses and stock'),
    (gen_random_uuid(), 'STORE_CLERK',   'Record stock receipts and issues');
