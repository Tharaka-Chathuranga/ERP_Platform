package com.enlear.erp.user.service;

import com.enlear.erp.user.exposed.UserApi;
import com.enlear.erp.user.exposed.dto.CurrentUser;
import com.enlear.erp.user.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserApiService implements UserApi {

    private final UserRepository users;

    public UserApiService(UserRepository users) {
        this.users = users;
    }

    @Override
    public Optional<CurrentUser> findByUsername(String username) {
        return users.findByUsername(username).map(UserApiService::toView);
    }

    @Override
    public List<CurrentUser> listAll() {
        return users.findAll(Sort.by("username")).stream().map(UserApiService::toView).toList();
    }

    @Override
    public List<CurrentUser> listByDepartment(String department) {
        return users.findByDepartmentOrderByUsername(department).stream()
                .map(UserApiService::toView)
                .toList();
    }

    private static CurrentUser toView(com.enlear.erp.user.model.User u) {
        return new CurrentUser(
                u.getId(), u.getUsername(), u.getDisplayName(), u.getRole(), u.getDepartment());
    }
}
