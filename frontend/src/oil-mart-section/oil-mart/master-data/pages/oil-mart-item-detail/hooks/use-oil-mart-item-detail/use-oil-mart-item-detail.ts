import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { listOilMartStock } from "../../../../../stock/api";
import {
  addOilMartItemPrice,
  getOilMartItem,
  listOilMartItemPrices,
  type AddOilMartItemPriceInput,
} from "../../../../api";

export function useOilMartItemDetail() {
  const { itemId = "" } = useParams();
  const queryClient = useQueryClient();
  const [priceModalOpen, setPriceModalOpen] = useState(false);

  const itemQuery = useQuery({
    queryKey: qk.oilMartItem(itemId),
    queryFn: () => getOilMartItem(itemId),
    enabled: Boolean(itemId),
  });

  const pricesQuery = useQuery({
    queryKey: qk.oilMartItemPrices(itemId),
    queryFn: () => listOilMartItemPrices(itemId),
    enabled: Boolean(itemId),
  });

  const stockQuery = useQuery({ queryKey: qk.oilMartStock(), queryFn: listOilMartStock });

  const balance = useMemo(
    () => stockQuery.data?.find((s) => s.itemId === itemId),
    [stockQuery.data, itemId],
  );

  const currentPrice = useMemo(() => {
    const today = dayjs().format("YYYY-MM-DD");
    return (pricesQuery.data ?? []).find(
      (p) => p.effectiveFrom <= today && (!p.effectiveTo || p.effectiveTo >= today),
    );
  }, [pricesQuery.data]);

  const addPrice = useMutation({
    mutationFn: (values: AddOilMartItemPriceInput) => addOilMartItemPrice(itemId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.oilMartItemPrices(itemId) });
      queryClient.invalidateQueries({ queryKey: qk.oilMartStock() });
      notifySuccess("Price added");
      setPriceModalOpen(false);
    },
    onError: notifyError,
  });

  return {
    itemId,
    itemQuery,
    pricesQuery,
    balance,
    currentPrice,
    priceModalOpen,
    setPriceModalOpen,
    addPrice,
  };
}
