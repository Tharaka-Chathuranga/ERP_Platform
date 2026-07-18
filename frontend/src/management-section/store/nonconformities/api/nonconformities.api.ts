import { api } from "@core/http/client";
import type {
  DetectionStage,
  DispositionType,
  NonconformityItemRow,
  NonconformityReport,
} from "@core/types";

export interface NonconformityItemInput {
  itemId: string;
  quantity: number;
}

export interface CreateNonconformityInput {
  description?: string;
  reportedByUserId: string;
  detectionStage: DetectionStage;
  items: NonconformityItemInput[];
}

export async function listNonconformities(
  detectionStage: DetectionStage,
): Promise<NonconformityReport[]> {
  const { data } = await api.get<NonconformityReport[]>("/store/nonconformities", {
    params: { detectionStage },
  });
  return data;
}

/** Flattened nonconforming item lines across all reports (admin analytic). */
export async function getNonconformityItems(
  detectionStage?: DetectionStage,
): Promise<NonconformityItemRow[]> {
  const { data } = await api.get<NonconformityItemRow[]>("/store/dashboard/nonconformity-items", {
    params: { detectionStage: detectionStage || undefined },
  });
  return data;
}

export async function getNonconformity(id: string): Promise<NonconformityReport> {
  const { data } = await api.get<NonconformityReport>(`/store/nonconformities/${id}`);
  return data;
}

export async function createNonconformity(
  input: CreateNonconformityInput,
): Promise<NonconformityReport> {
  const { data } = await api.post<NonconformityReport>("/store/nonconformities", input);
  return data;
}

export async function startNonconformityReview(id: string): Promise<NonconformityReport> {
  const { data } = await api.post<NonconformityReport>(`/store/nonconformities/${id}/review`, null);
  return data;
}

export async function dispositionNonconformity(
  id: string,
  authorityId: string,
  dispositionType: DispositionType,
  note: string,
): Promise<NonconformityReport> {
  const { data } = await api.post<NonconformityReport>(
    `/store/nonconformities/${id}/disposition`,
    { authorityId, dispositionType, note },
  );
  return data;
}

export async function rejectNonconformity(
  id: string,
  authorityId: string,
  note: string,
): Promise<NonconformityReport> {
  const { data } = await api.post<NonconformityReport>(
    `/store/nonconformities/${id}/reject`,
    { authorityId, note },
  );
  return data;
}

export async function closeNonconformity(
  id: string,
  closedByUserId: string,
  verificationNote: string,
): Promise<NonconformityReport> {
  const { data } = await api.post<NonconformityReport>(
    `/store/nonconformities/${id}/close`,
    { closedByUserId, verificationNote },
  );
  return data;
}
