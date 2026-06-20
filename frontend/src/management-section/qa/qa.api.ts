import { api } from "@core/http/client";
import type { DeviationRequest, DeviationStatus, QaDefectSummary } from "@core/types";

// ── Quality-assurance read-side. Mirrors /api/store/qa/* and the defect-request
//    by-status listing, both gated to QA + admins on the backend. ──

export async function getQaDefectSummary(): Promise<QaDefectSummary> {
  const { data } = await api.get<QaDefectSummary>("/store/qa/dashboard/summary");
  return data;
}

export async function listDeviationsByStatus(
  status: DeviationStatus,
): Promise<DeviationRequest[]> {
  const { data } = await api.get<DeviationRequest[]>("/store/deviation-requests/by-status", {
    params: { status },
  });
  return data;
}
