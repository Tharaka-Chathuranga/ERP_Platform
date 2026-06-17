package com.enlear.erp.user.service;

import com.enlear.erp.shared.error.BusinessRuleException;
import com.enlear.erp.shared.error.ResourceNotFoundException;
import com.enlear.erp.user.model.User;
import com.enlear.erp.user.repository.UserRepository;
import com.enlear.erp.user.service.command.CreateUserCommand;
import com.enlear.erp.user.service.command.UpdateUserCommand;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Administrative user management: create, edit, enable/disable and password
 * resets. Kept separate from {@link UserApiService} (the read-only cross-module
 * lookup) so the management concern and its write rules live in one place.
 *
 * <p>The "last admin" guard prevents the system from being locked out by
 * disabling or demoting the only remaining enabled administrator.
 */
@Service
@Transactional
public class UserAdminService {

    private static final String ADMIN_ROLE = "ADMIN";

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    public UserAdminService(UserRepository users, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    public User create(CreateUserCommand cmd) {
        if (users.existsByUsername(cmd.username())) {
            throw new BusinessRuleException("USER_DUPLICATE_USERNAME",
                    "Username '%s' is already taken".formatted(cmd.username()));
        }
        User user = new User();
        user.setUsername(cmd.username());
        user.setPasswordHash(passwordEncoder.encode(cmd.rawPassword()));
        user.setDisplayName(cmd.displayName());
        user.setRole(cmd.role());
        user.setDepartment(cmd.department());
        user.setEnabled(true);
        return users.save(user);
    }

    public User update(UUID id, UpdateUserCommand cmd) {
        User user = get(id);
        if (isLastEnabledAdmin(user) && !ADMIN_ROLE.equals(cmd.role())) {
            throw lastAdminError("change the role of");
        }
        user.setDisplayName(cmd.displayName());
        user.setRole(cmd.role());
        user.setDepartment(cmd.department());
        return users.save(user);
    }

    public User setEnabled(UUID id, boolean enabled) {
        User user = get(id);
        if (!enabled && isLastEnabledAdmin(user)) {
            throw lastAdminError("disable");
        }
        user.setEnabled(enabled);
        return users.save(user);
    }

    public User resetPassword(UUID id, String rawPassword) {
        User user = get(id);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        return users.save(user);
    }

    @Transactional(readOnly = true)
    public User get(UUID id) {
        return users.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    @Transactional(readOnly = true)
    public List<User> listAll() {
        return users.findAll(Sort.by("username"));
    }

    private boolean isLastEnabledAdmin(User user) {
        return ADMIN_ROLE.equals(user.getRole()) && user.isEnabled()
                && users.countByRoleAndEnabledTrue(ADMIN_ROLE) <= 1;
    }

    private BusinessRuleException lastAdminError(String action) {
        return new BusinessRuleException("USER_LAST_ADMIN",
                "Cannot " + action + " the last enabled administrator");
    }
}
