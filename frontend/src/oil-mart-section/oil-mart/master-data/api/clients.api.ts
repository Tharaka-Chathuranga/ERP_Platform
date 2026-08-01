import { api } from "@core/http/client";
import type { OilMartClient, OilMartClientStatus, OilMartSale } from "@core/types";

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

export async function listOilMartClientSales(clientId: string): Promise<OilMartSale[]> {
  const { data } = await api.get<OilMartSale[]>(`/oilmart/clients/${clientId}/sales`);
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
