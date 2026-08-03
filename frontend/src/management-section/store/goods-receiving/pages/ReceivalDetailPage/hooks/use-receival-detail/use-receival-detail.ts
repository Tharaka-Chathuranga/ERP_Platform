import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { getGoodsReceipt, getReceival } from "../../../../api";
import { listSuppliers } from "@store/inventory";

export function useReceivalDetail() {
  const { id = "" } = useParams();
  const [search, setSearch] = useState("");

  const receivalQuery = useQuery({
    queryKey: qk.receival(id),
    queryFn: () => getReceival(id),
  });
  const suppliersQuery = useQuery({ queryKey: qk.suppliers(), queryFn: listSuppliers });
  const receival = receivalQuery.data;
  const grnQuery = useQuery({
    queryKey: qk.goodsReceipt(receival?.goodReceiveNoteId ?? ""),
    queryFn: () => getGoodsReceipt(receival!.goodReceiveNoteId!),
    enabled: !!receival?.goodReceiveNoteId,
  });

  return { receivalQuery, suppliersQuery, grnQuery, search, setSearch };
}
