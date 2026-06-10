package com.enlear.erp.iam.service;

import com.enlear.erp.iam.api.IamApi;
import com.enlear.erp.iam.api.dto.CurrentUser;
import com.enlear.erp.iam.domain.Role;
import com.enlear.erp.iam.repository.UserRepository;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implements the public {@link IamApi} facade by delegating to the module's
 * repository, mapping the internal {@code User} aggregate to a boundary-safe
 * {@link CurrentUser} view.
 */
@Service
@Transactional(readOnly = true)
public class IamApiService implements IamApi {

    private final UserRepository users;

    public IamApiService(UserRepository users) {
        this.users = users;
    }

    @Override
    public Optional<CurrentUser> findByUsername(String username) {
        return users.findByUsername(username)
                .map(u -> new CurrentUser(u.getId(), u.getUsername(), u.getDisplayName(),
                        u.getRoles().stream().map(Role::getName).collect(Collectors.toSet())));
    }
}
