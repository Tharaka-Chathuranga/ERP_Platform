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
        users.save(newUser("admin", "Administrator", "ADMIN", "Stores"));
        log.warn("Created default admin user 'admin' / 'admin123' — CHANGE THIS PASSWORD.");

        users.save(newUser("k.silva", "Kasun Silva", "STORE_KEEPER", "Maintenance"));
        users.save(newUser("n.perera", "Nimal Perera", "STORE_KEEPER", "Maintenance"));
        users.save(newUser("a.fernando", "Amaya Fernando", "STORE_KEEPER", "Production"));
        users.save(newUser("r.jayasuriya", "Ravi Jayasuriya", "STORE_KEEPER", "Production"));
        users.save(newUser("s.bandara", "Sahan Bandara", "STORE_KEEPER", "Logistics"));
        log.warn("Seeded demo store-keeper users (password 'admin123') for development.");

        users.save(newUser("q.wijesinghe", "Dilani Wijesinghe", "QUALITY_ASSURANCE", "Quality"));
        log.warn("Seeded demo quality-assurance user (password 'admin123') for development.");
    }

    private User newUser(String username, String displayName, String role, String department) {
        User user = new User();
        user.setUsername(username);
        user.setDisplayName(displayName);
        user.setPasswordHash(passwordEncoder.encode("admin123"));
        user.setRole(role);
        user.setDepartment(department);
        user.setEnabled(true);
        return user;
    }
}
