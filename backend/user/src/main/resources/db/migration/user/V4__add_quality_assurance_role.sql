ALTER TABLE users.users DROP CONSTRAINT chk_users_role;

ALTER TABLE users.users
    ADD CONSTRAINT chk_users_role
    CHECK (role IN ('ADMIN', 'STORE_KEEPER', 'QUALITY_ASSURANCE'));
