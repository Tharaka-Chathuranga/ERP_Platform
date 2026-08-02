package com.enlear.erp.oilmart.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@NoArgsConstructor
public class OilMartBankDetails {

    @Column(name = "bank_account_name", length = 200)
    private String accountName;

    @Column(name = "bank_name", length = 200)
    private String bankName;

    @Column(name = "bank_branch", length = 200)
    private String branch;

    @Column(name = "bank_account_number", length = 64)
    private String accountNumber;

    @Column(name = "bank_swift_code", length = 32)
    private String swiftCode;

    public OilMartBankDetails(String accountName, String bankName, String branch,
                              String accountNumber, String swiftCode) {
        this.accountName = accountName;
        this.bankName = bankName;
        this.branch = branch;
        this.accountNumber = accountNumber;
        this.swiftCode = swiftCode;
    }
}
