package com.enlear.erp.store.service.agent;

import com.enlear.erp.notification.exposed.NotificationSeverity;
import com.enlear.erp.store.service.agent.ReorderAssessment.SupplierOption;
import java.math.BigDecimal;
import java.util.stream.Collectors;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "erp.store.agent.mode", havingValue = "rule-based",
        matchIfMissing = true)
public class RuleBasedStockAgent implements StockManagementAgent {

    @Override
    public AgentOutcome handle(ReorderAssessment a) {
        NotificationSeverity severity = a.criticalItem()
                ? NotificationSeverity.CRITICAL
                : NotificationSeverity.WARNING;

        String title = "%s reorder level reached: %s".formatted(
                a.criticalItem() ? "CRITICAL item" : "Item", a.itemCode());

        String body = buildBody(a);

        return new AgentOutcome(title, body, severity);
    }

    private String buildBody(ReorderAssessment a) {
        StringBuilder sb = new StringBuilder();
        sb.append("%s (%s) is at %s, at or below its reorder level of %s (short by %s)."
                .formatted(a.itemName(), a.itemCode(), plain(a.onHand()),
                        plain(a.reorderLevel()), plain(a.shortfall())));

        if (a.criticalItem()) {
            sb.append(" This item is flagged CRITICAL.");
        }

        if (a.hasSuppliers()) {
            String options = a.suppliers().stream()
                    .map(RuleBasedStockAgent::describeSupplier)
                    .collect(Collectors.joining("; "));
            sb.append(" Suggested suppliers (soonest first): ").append(options).append('.');
            sb.append(" Consider requesting quotations.");
        } else {
            sb.append(" No suppliers are on file for this item — add one before purchasing.");
        }

        return sb.toString();
    }

    private static String describeSupplier(SupplierOption s) {
        StringBuilder sb = new StringBuilder(s.supplierName()).append(" (").append(s.supplierCode()).append(')');
        if (s.leadTimeDays() != null) {
            sb.append(" — ").append(s.leadTimeDays()).append("d lead");
        } else {
            sb.append(" — lead time unknown");
        }
        if (s.lastPurchasePrice() != null) {
            sb.append(", last ").append(plain(s.lastPurchasePrice()));
        }
        return sb.toString();
    }

    /** Trim trailing zeros so quantities/prices read cleanly (10.0000 → 10). */
    private static String plain(BigDecimal value) {
        return value == null ? "-" : value.stripTrailingZeros().toPlainString();
    }
}
