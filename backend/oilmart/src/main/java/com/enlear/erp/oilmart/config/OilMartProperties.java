package com.enlear.erp.oilmart.config;

import java.math.BigDecimal;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "erp.oilmart")
public record OilMartProperties(BigDecimal gstRatePercent, BankAccount bank) {

    private static final BigDecimal DEFAULT_GST_RATE_PERCENT = new BigDecimal("10.00");

    public OilMartProperties {
        if (gstRatePercent == null) {
            gstRatePercent = DEFAULT_GST_RATE_PERCENT;
        }
        if (bank == null) {
            bank = BankAccount.blank();
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
