import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@auth/AuthContext";
import { qk } from "@core/queryKeys";
import { getLowStockItems } from "@store/inventory/items.api";
import { listDeviations } from "@store/defects/deviations.api";
import { listCountRequests } from "@store/count-adjustments/count-requests.api";
import { getDashboardSummary } from "@admin/admin.api";
import { getQaDefectSummary } from "@qa/qa.api";

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  severity: "error" | "warning" | "info";
  href: string;
}

function plural(count: number, word: string) {
  return `${count} ${word}${count !== 1 ? "s" : ""}`;
}

export function useNotifications(): AppNotification[] {
  const { role } = useAuth();
  const isAdmin = role === "ADMIN";
  const isStoreKeeper = role === "STORE_KEEPER";
  const isQA = role === "QUALITY_ASSURANCE";

  const summary = useQuery({
    queryKey: qk.adminSummary(),
    queryFn: getDashboardSummary,
    enabled: isAdmin,
  });

  const lowStock = useQuery({
    queryKey: qk.lowStock(),
    queryFn: getLowStockItems,
    enabled: isStoreKeeper,
  });

  const pendingCounts = useQuery({
    queryKey: qk.countRequests("PENDING"),
    queryFn: () => listCountRequests("PENDING"),
    enabled: isStoreKeeper,
  });

  const incomingDeviations = useQuery({
    queryKey: qk.deviations("INCOMING"),
    queryFn: () => listDeviations("INCOMING"),
    enabled: isStoreKeeper,
  });

  const qaSummary = useQuery({
    queryKey: qk.qaDefectSummary(),
    queryFn: getQaDefectSummary,
    enabled: isQA,
  });

  const notifications: AppNotification[] = [];

  if (isAdmin) {
    const s = summary.data;
    if (s) {
      if (s.lowStockItemCount > 0) {
        notifications.push({
          id: "low-stock",
          title: `${plural(s.lowStockItemCount, "item")} below reorder level`,
          description: "Review stock levels and initiate reorders.",
          severity: "warning",
          href: "/warnings",
        });
      }
      if (s.pendingIssueApprovalCount > 0) {
        notifications.push({
          id: "pending-approvals",
          title: `${plural(s.pendingIssueApprovalCount, "issue")} awaiting approval`,
          description: "Approve or reject pending goods issue requests.",
          severity: "info",
          href: "/issuing",
        });
      }
      if (s.pendingDeviationCount > 0) {
        notifications.push({
          id: "pending-deviations",
          title: `${plural(s.pendingDeviationCount, "defect report")} pending`,
          description: "Defect requests are awaiting quality review.",
          severity: "warning",
          href: "/defects",
        });
      }
      if (s.pendingCountAdjustmentCount > 0) {
        notifications.push({
          id: "pending-counts",
          title: `${plural(s.pendingCountAdjustmentCount, "count adjustment")} pending`,
          description: "Stock count requests are awaiting your approval.",
          severity: "info",
          href: "/count-requests",
        });
      }
    }
  }

  if (isStoreKeeper) {
    if (lowStock.data && lowStock.data.length > 0) {
      const hasCritical = lowStock.data.some((i) => i.criticalItem);
      notifications.push({
        id: "low-stock",
        title: `${plural(lowStock.data.length, "item")} below reorder level`,
        description: "Review and reorder items to avoid stockouts.",
        severity: hasCritical ? "error" : "warning",
        href: "/warnings",
      });
    }
    if (pendingCounts.data && pendingCounts.data.length > 0) {
      notifications.push({
        id: "pending-counts",
        title: `${plural(pendingCounts.data.length, "count request")} pending`,
        description: "Stock count adjustments are awaiting approval.",
        severity: "info",
        href: "/count-requests",
      });
    }
    if (incomingDeviations.data && incomingDeviations.data.length > 0) {
      notifications.push({
        id: "incoming-deviations",
        title: `${plural(incomingDeviations.data.length, "open defect report")}`,
        description: "Defect requests have been submitted and need attention.",
        severity: "warning",
        href: "/defects",
      });
    }
  }

  if (isQA) {
    const s = qaSummary.data;
    if (s && s.pendingCount > 0) {
      notifications.push({
        id: "qa-pending",
        title: `${plural(s.pendingCount, "defect report")} awaiting review`,
        description: "Review and make decisions on incoming defect reports.",
        severity: "warning",
        href: "/qa/defects",
      });
    }
  }

  return notifications;
}
