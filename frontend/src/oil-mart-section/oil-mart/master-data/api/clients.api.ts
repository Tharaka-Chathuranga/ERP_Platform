import { api } from "@core/http/client";
import type { OilMartClient, OilMartClientStatus, OilMartQuotation } from "@core/types";

export interface SaveOilMartClientInput {
  code: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: OilMartClientStatus;
}

export async function listOilMartClients(search?: string): Promise<OilMartClient[]> {
  const { data } = await api.get<OilMartClient[]>("/oilmart/clients", {
    params: { search: search || undefined },
  });
  return data;
}

export async function getOilMartClient(clientId: string): Promise<OilMartClient> {
  const { data } = await api.get<OilMartClient>(`/oilmart/clients/${clientId}`);
  return data;
}

export async function listOilMartClientQuotations(
  clientId: string,
): Promise<OilMartQuotation[]> {
  const { data } = await api.get<OilMartQuotation[]>(`/oilmart/clients/${clientId}/quotations`);
  return data;
}

export async function quickAddOilMartClient(name: string): Promise<OilMartClient> {
  const { data } = await api.post<OilMartClient>("/oilmart/clients/quick-add", { name });
  return data;
}

export async function createOilMartClient(input: SaveOilMartClientInput): Promise<OilMartClient> {
  const { data } = await api.post<OilMartClient>("/oilmart/clients", input);
  return data;
}

export async function updateOilMartClient(
  clientId: string,
  input: SaveOilMartClientInput,
): Promise<OilMartClient> {
  const { data } = await api.put<OilMartClient>(`/oilmart/clients/${clientId}`, input);
  return data;
}
