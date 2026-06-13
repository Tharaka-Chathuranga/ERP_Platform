package com.enlear.erp.user.exposed;

import com.enlear.erp.user.exposed.dto.CurrentUser;
import java.util.List;
import java.util.Optional;

public interface UserApi {

    Optional<CurrentUser> findByUsername(String username);

    List<CurrentUser> listAll();

    List<CurrentUser> listByDepartment(String department);
}
