import { api } from "@core/http/client";
import type { OilMartOverview } from "@core/types";

export async function getOilMartOverview(): Promise<OilMartOverview> {
  const { data } = await api.get<OilMartOverview>("/oilmart/overview");
  return data;
}
