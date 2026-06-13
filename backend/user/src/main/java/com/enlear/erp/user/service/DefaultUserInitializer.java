package com.enlear.erp.user.service;

import com.enlear.erp.user.model.User;
import com.enlear.erp.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates a default {@code admin} user on first boot (when no users exist) so
 * the system is usable out of the box. The password is hashed with the live
 * {@link PasswordEncoder} rather than seeded as a literal hash in SQL.
 *
 * <p><b>Change the default credentials immediately</b> in any real deployment.
 */
@Component
public class DefaultUserInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DefaultUserInitializer.class);

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    public DefaultUserInitializer(UserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (users.count() > 0) {
            return;
        }
        User admin = new User();
        admin.setUsername("admin");
        admin.setDisplayName("Administrator");
        admin.setPasswordHash(passwordEncoder.encode("admin123"));
        admin.setRole("ADMIN");
        admin.setEnabled(true);
        users.save(admin);

        log.warn("Created default admin user 'admin' / 'admin123' — CHANGE THIS PASSWORD.");
    }
}
