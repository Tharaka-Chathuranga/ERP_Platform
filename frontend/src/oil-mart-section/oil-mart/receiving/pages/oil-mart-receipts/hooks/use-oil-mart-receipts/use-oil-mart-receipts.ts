import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { qk } from "@core/queryKeys";
import type { OilMartReceipt } from "@core/types";
import { listOilMartSuppliers } from "../../../../../master-data/api";
import { listOilMartReceipts } from "../../../../api";

export function useOilMartReceipts() {
  const navigate = useNavigate();
  const [supplierId, setSupplierId] = useState("ALL");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

  const query = useQuery({
    queryKey: qk.oilMartReceipts(supplierId),
    queryFn: () => listOilMartReceipts(supplierId),
  });

  const suppliersQuery = useQuery({
    queryKey: qk.oilMartSuppliers(),
    queryFn: listOilMartSuppliers,
  });

  const receipts = useMemo(() => {
    const all = query.data ?? [];
    const [from, to] = dateRange;
    if (!from && !to) return all;
    return all.filter((receipt) => {
      const receivedAt = dayjs(receipt.receivedAt);
      if (from && receivedAt.isBefore(dayjs(from).startOf("day"))) return false;
      if (to && receivedAt.isAfter(dayjs(to).endOf("day"))) return false;
      return true;
    });
  }, [query.data, dateRange]);

  return {
    query,
    receipts,
    suppliersQuery,
    supplierId,
    setSupplierId,
    dateRange,
    setDateRange,
    openNew: () => navigate("/oil-mart/receipts/new"),
    openDetail: (receipt: OilMartReceipt) => navigate(`/oil-mart/receipts/${receipt.id}`),
  };
}
