import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { OilMartStockBalance } from "@core/types";
import { listOilMartItems } from "../../../../../master-data/api";
import {
  adjustOilMartStock,
  listOilMartStock,
  type AdjustOilMartStockInput,
} from "../../../../api";

export function useOilMartStock() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [oilType, setOilType] = useState("ALL");
  const [lowOnly, setLowOnly] = useState(false);
  const [adjustingItemId, setAdjustingItemId] = useState<string | undefined>();
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);

  const query = useQuery({ queryKey: qk.oilMartStock(), queryFn: listOilMartStock });

  const itemsQuery = useQuery({
    queryKey: qk.oilMartItems(),
    queryFn: () => listOilMartItems(),
    enabled: adjustmentOpen,
  });

  const adjust = useMutation({
    mutationFn: (values: AdjustOilMartStockInput) => adjustOilMartStock(values),
    onSuccess: (movement) => {
      queryClient.invalidateQueries({ queryKey: qk.oilMartStock() });
      queryClient.invalidateQueries({ queryKey: qk.oilMartMovements(movement.itemId) });
      queryClient.invalidateQueries({ queryKey: qk.oilMartOverview() });
      notifySuccess(
        `Stock ${movement.quantityDelta >= 0 ? "added" : "removed"}: ${Math.abs(movement.quantityDelta).toLocaleString()} L`,
      );
      closeAdjustment();
    },
    onError: notifyError,
  });

  const balances = useMemo(() => {
    const all = query.data ?? [];
    const needle = search.trim().toLowerCase();
    return all.filter((balance) => {
      if (oilType !== "ALL" && balance.oilType !== oilType) return false;
      if (lowOnly && balance.quantityOnHand >= balance.reorderLevelLitres) return false;
      if (!needle) return true;
      return [balance.itemCode, balance.itemName].some((field) =>
        field.toLowerCase().includes(needle),
      );
    });
  }, [query.data, search, oilType, lowOnly]);

  const totals = useMemo(() => {
    const all = query.data ?? [];
    return {
      stockValue: all.reduce((sum, balance) => sum + balance.stockValue, 0),
      lowCount: all.filter((balance) => balance.quantityOnHand < balance.reorderLevelLitres).length,
    };
  }, [query.data]);

  function openAdjustment(itemId?: string) {
    setAdjustingItemId(itemId);
    setAdjustmentOpen(true);
  }

  function closeAdjustment() {
    setAdjustmentOpen(false);
    setAdjustingItemId(undefined);
  }

  return {
    query,
    balances,
    totals,
    search,
    setSearch,
    oilType,
    setOilType,
    lowOnly,
    setLowOnly,
    openItem: (balance: OilMartStockBalance) => navigate(`/oil-mart/items/${balance.itemId}`),
    items: itemsQuery.data ?? [],
    adjustmentOpen,
    adjustingItemId,
    openAdjustment,
    closeAdjustment,
    adjust,
  };
}
