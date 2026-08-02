package com.enlear.erp.oilmart.config;

import java.math.BigDecimal;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "erp.oilmart")
public record OilMartProperties(BigDecimal gstRatePercent,
                                String currencyCode,
                                Company company,
                                BankAccount bank) {

    private static final BigDecimal DEFAULT_GST_RATE_PERCENT = new BigDecimal("10.00");
    private static final String DEFAULT_CURRENCY_CODE = "LKR";

    public OilMartProperties {
        if (gstRatePercent == null) {
            gstRatePercent = DEFAULT_GST_RATE_PERCENT;
        }
        if (currencyCode == null || currencyCode.isBlank()) {
            currencyCode = DEFAULT_CURRENCY_CODE;
        }
        if (company == null) {
            company = Company.blank();
        }
        if (bank == null) {
            bank = BankAccount.blank();
        }
    }

    public record Company(String name,
                          String address,
                          String phone,
                          String fax,
                          String email,
                          String registrationNumber,
                          String taxNumber,
                          String logoPath) {

        static Company blank() {
            return new Company(null, null, null, null, null, null, null, null);
        }
    }

    public record BankAccount(String accountName,
                              String bankName,
                              String branch,
                              String accountNumber,
                              String swiftCode) {

        static BankAccount blank() {
            return new BankAccount(null, null, null, null, null);
        }
    }
}
