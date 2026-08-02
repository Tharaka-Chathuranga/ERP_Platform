package com.enlear.erp.shared.model;

import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Version;
import lombok.Getter;

@Getter
@MappedSuperclass
public abstract class BaseEntity extends AuditedEntity {

    @Version
    private Long version;
}
