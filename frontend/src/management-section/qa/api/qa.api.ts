import { api } from "@core/http/client";
import type { NonconformityReport, NonconformityStatus, QaNonconformitySummary } from "@core/types";

// ── Quality-assurance read-side. Mirrors /api/store/qa/* and the nonconformity
//    by-status listing, both gated to QA + admins on the backend. ──

export async function getQaNonconformitySummary(): Promise<QaNonconformitySummary> {
  const { data } = await api.get<QaNonconformitySummary>("/store/qa/dashboard/summary");
  return data;
}

export async function listNonconformitiesByStatus(
  status?: NonconformityStatus,
): Promise<NonconformityReport[]> {
  const { data } = await api.get<NonconformityReport[]>("/store/nonconformities/by-status", {
    params: status ? { status } : undefined,
  });
  return data;
}
