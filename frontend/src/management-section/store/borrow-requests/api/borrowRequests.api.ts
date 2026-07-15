import { api } from "@core/http/client";
import type { BorrowRequest, BorrowRequestStatus } from "@core/types";

export interface CreateBorrowRequestInput {
  issueId: string;
  reason?: string;
  requestedByUserId: string;
}

/** Processing list: all borrow requests, or filtered by status. */
export async function listBorrowRequests(status?: BorrowRequestStatus): Promise<BorrowRequest[]> {
  const { data } = await api.get<BorrowRequest[]>("/store/borrow-requests", {
    params: { status: status || undefined },
  });
  return data;
}

export async function getBorrowRequest(id: string): Promise<BorrowRequest> {
  const { data } = await api.get<BorrowRequest>(`/store/borrow-requests/${id}`);
  return data;
}

export async function createBorrowRequest(
  input: CreateBorrowRequestInput
): Promise<BorrowRequest> {
  const { data } = await api.post<BorrowRequest>("/store/borrow-requests", input);
  return data;
}

export async function approveBorrowRequest(id: string, approverId: string): Promise<BorrowRequest> {
  const { data } = await api.post<BorrowRequest>(`/store/borrow-requests/${id}/approve`, null, {
    params: { approverId },
  });
  return data;
}

export async function rejectBorrowRequest(id: string, approverId: string): Promise<BorrowRequest> {
  const { data } = await api.post<BorrowRequest>(`/store/borrow-requests/${id}/reject`, null, {
    params: { approverId },
  });
  return data;
}
