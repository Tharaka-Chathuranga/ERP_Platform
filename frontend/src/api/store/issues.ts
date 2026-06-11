import { api } from "../client";
import type { Issue, IssueStatus, Page } from "../../types";

export interface IssueLineInput {
  itemId: string;
  quantity: number;
  returnable: boolean;
}

export interface CreateIssueInput {
  borrowingUserId: string;
  storeKeeperId: string;
  lines: IssueLineInput[];
}

export interface ReturnLineInput {
  itemId: string;
  quantity: number;
}

/** Lists issues; filter by status, or pass nothing for all. */
export async function listIssues(status?: IssueStatus): Promise<Page<Issue>> {
  const { data } = await api.get<Page<Issue>>("/store/issues", {
    params: { status: status || undefined, size: 50 },
  });
  return data;
}

export async function getIssue(id: string): Promise<Issue> {
  const { data } = await api.get<Issue>(`/store/issues/${id}`);
  return data;
}

export async function createIssue(input: CreateIssueInput): Promise<Issue> {
  const { data } = await api.post<Issue>("/store/issues", input);
  return data;
}

export async function approveIssue(id: string, approverId: string): Promise<Issue> {
  const { data } = await api.post<Issue>(`/store/issues/${id}/approve`, null, {
    params: { approverId },
  });
  return data;
}

export async function rejectIssue(id: string, approverId: string): Promise<Issue> {
  const { data } = await api.post<Issue>(`/store/issues/${id}/reject`, null, {
    params: { approverId },
  });
  return data;
}

/** Physically issue an APPROVED document — posts ISSUE movements. */
export async function issueDocument(id: string): Promise<Issue> {
  const { data } = await api.post<Issue>(`/store/issues/${id}/issue`);
  return data;
}

export async function returnIssueItems(id: string, lines: ReturnLineInput[]): Promise<Issue> {
  const { data } = await api.post<Issue>(`/store/issues/${id}/returns`, { lines });
  return data;
}
