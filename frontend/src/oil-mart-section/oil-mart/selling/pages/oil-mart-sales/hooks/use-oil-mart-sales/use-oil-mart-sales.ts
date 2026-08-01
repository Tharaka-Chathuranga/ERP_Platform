import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { qk } from "@core/queryKeys";
import type { OilMartSale } from "@core/types";
import { listOilMartClients } from "../../../../../master-data/api";
import { listOilMartSales } from "../../../../api";
import { applySaleFilters, type SaleFilters } from "../../oil-mart-sales-board";

export function useOilMartSales() {
  const navigate = useNavigate();

  const [clientId, setClientId] = useState("ALL");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [showTerminal, setShowTerminal] = useState(false);

  const query = useQuery({ queryKey: qk.oilMartSales(), queryFn: () => listOilMartSales() });
  const clientsQuery = useQuery({
    queryKey: qk.oilMartClients(),
    queryFn: () => listOilMartClients(),
  });

  const filters: SaleFilters = { clientId, dateRange, showTerminal };

  const sales = useMemo(
    () => applySaleFilters(query.data ?? [], filters),
    [query.data, clientId, dateRange, showTerminal],
  );

  const awaitingApproval = useMemo(
    () => (query.data ?? []).filter((sale) => sale.status === "ORDERED").length,
    [query.data],
  );

  return {
    query,
    sales,
    clientsQuery,
    clientId,
    setClientId,
    dateRange,
    setDateRange,
    showTerminal,
    setShowTerminal,
    awaitingApproval,
    openNew: () => navigate("/oil-mart/sales/new"),
    openDetail: (sale: OilMartSale) => navigate(`/oil-mart/sales/${sale.id}`),
  };
}
