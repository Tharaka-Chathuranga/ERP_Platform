package com.enlear.erp.user.exposed;

import com.enlear.erp.user.exposed.dto.CurrentUser;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserApi {

    Optional<CurrentUser> findByUsername(String username);

    Optional<CurrentUser> findById(UUID id);

    List<CurrentUser> listAll();

    List<CurrentUser> listByDepartment(String department);
}
