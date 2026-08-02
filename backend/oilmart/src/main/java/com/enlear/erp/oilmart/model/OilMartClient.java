package com.enlear.erp.oilmart.model;

import com.enlear.erp.shared.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "oil_mart_clients", schema = "oilmart")
@Getter
@NoArgsConstructor
public class OilMartClient extends BaseEntity {

    @Column(nullable = false, unique = true, length = 64)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "contact_person", length = 150)
    private String contactPerson;

    @Column(length = 50)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(length = 500)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private OilMartClientStatus status = OilMartClientStatus.ACTIVE;

    public OilMartClient(String code, String name, String contactPerson, String phone,
                           String email, String address, OilMartClientStatus status) {
        apply(code, name, contactPerson, phone, email, address, status);
    }

    public void update(String code, String name, String contactPerson, String phone,
                       String email, String address, OilMartClientStatus status) {
        apply(code, name, contactPerson, phone, email, address, status);
    }

    private void apply(String code, String name, String contactPerson, String phone,
                       String email, String address, OilMartClientStatus status) {
        this.code = code;
        this.name = name;
        this.contactPerson = contactPerson;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.status = status != null ? status : OilMartClientStatus.ACTIVE;
    }

    public boolean isActive() {
        return status == OilMartClientStatus.ACTIVE;
    }

    public boolean isProfileIncomplete() {
        return isBlank(address) || (isBlank(phone) && isBlank(email));
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
