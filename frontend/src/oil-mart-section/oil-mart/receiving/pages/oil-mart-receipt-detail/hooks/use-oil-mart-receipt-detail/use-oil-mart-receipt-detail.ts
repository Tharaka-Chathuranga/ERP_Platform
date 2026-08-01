import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { getOilMartReceipt, listOilMartReceiptMovements } from "../../../../api";

export function useOilMartReceiptDetail() {
  const { receiptId = "" } = useParams();

  const receiptQuery = useQuery({
    queryKey: qk.oilMartReceipt(receiptId),
    queryFn: () => getOilMartReceipt(receiptId),
    enabled: Boolean(receiptId),
  });

  const movementsQuery = useQuery({
    queryKey: qk.oilMartReceiptMovements(receiptId),
    queryFn: () => listOilMartReceiptMovements(receiptId),
    enabled: Boolean(receiptId),
  });

  return { receiptId, receiptQuery, movementsQuery };
}
