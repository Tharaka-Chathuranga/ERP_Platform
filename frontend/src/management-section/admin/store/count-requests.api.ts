import { api } from "@core/http/client";
import type { CountAdjustmentRequest, CountAdjustmentStatus } from "@core/types";

// ── Stock count-adjustment requests. Mirrors /api/store/count-requests. ──

export interface CreateCountRequestInput {
  itemId: string;
  requestedQuantity: number;
  reason?: string;
  requestedByUserId: string;
}

export async function listCountRequests(
  status?: CountAdjustmentStatus,
): Promise<CountAdjustmentRequest[]> {
  const { data } = await api.get<CountAdjustmentRequest[]>("/store/count-requests", {
    params: { status: status || undefined },
  });
  return data;
}

export async function createCountRequest(
  input: CreateCountRequestInput,
): Promise<CountAdjustmentRequest> {
  const { data } = await api.post<CountAdjustmentRequest>("/store/count-requests", input);
  return data;
}

export async function approveCountRequest(
  id: string,
  approverId: string,
): Promise<CountAdjustmentRequest> {
  const { data } = await api.post<CountAdjustmentRequest>(
    `/store/count-requests/${id}/approve`,
    null,
    { params: { approverId } },
  );
  return data;
}

export async function rejectCountRequest(
  id: string,
  approverId: string,
): Promise<CountAdjustmentRequest> {
  const { data } = await api.post<CountAdjustmentRequest>(
    `/store/count-requests/${id}/reject`,
    null,
    { params: { approverId } },
  );
  return data;
}
