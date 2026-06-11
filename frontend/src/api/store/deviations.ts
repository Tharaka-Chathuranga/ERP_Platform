import { api } from "../client";
import type { DeviationRequest, DeviationStage } from "../../types";

export interface DeviationItemInput {
  itemId: string;
  quantity: number;
}

export interface CreateDeviationInput {
  reason?: string;
  requestedByUserId: string;
  items: DeviationItemInput[];
}

export async function listDeviations(stage: DeviationStage): Promise<DeviationRequest[]> {
  const { data } = await api.get<DeviationRequest[]>("/store/deviation-requests", {
    params: { stage },
  });
  return data;
}

export async function getDeviation(id: string): Promise<DeviationRequest> {
  const { data } = await api.get<DeviationRequest>(`/store/deviation-requests/${id}`);
  return data;
}

export async function createDeviation(input: CreateDeviationInput): Promise<DeviationRequest> {
  const { data } = await api.post<DeviationRequest>("/store/deviation-requests", input);
  return data;
}

export async function approveDeviation(id: string, approverId: string): Promise<DeviationRequest> {
  const { data } = await api.post<DeviationRequest>(`/store/deviation-requests/${id}/approve`, null, {
    params: { approverId },
  });
  return data;
}

export async function rejectDeviation(id: string, approverId: string): Promise<DeviationRequest> {
  const { data } = await api.post<DeviationRequest>(`/store/deviation-requests/${id}/reject`, null, {
    params: { approverId },
  });
  return data;
}

export async function advanceDeviationStage(
  id: string,
  stage: DeviationStage
): Promise<DeviationRequest> {
  const { data } = await api.post<DeviationRequest>(`/store/deviation-requests/${id}/stage`, null, {
    params: { stage },
  });
  return data;
}
