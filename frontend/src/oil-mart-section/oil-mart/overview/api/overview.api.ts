import { api } from "@core/http/client";
import type { OilMartOverview, OilMartOverviewPeriod } from "@core/types";

export async function getOilMartOverview(
  period: OilMartOverviewPeriod = "THIS_MONTH",
): Promise<OilMartOverview> {
  const { data } = await api.get<OilMartOverview>("/oilmart/overview", { params: { period } });
  return data;
}
