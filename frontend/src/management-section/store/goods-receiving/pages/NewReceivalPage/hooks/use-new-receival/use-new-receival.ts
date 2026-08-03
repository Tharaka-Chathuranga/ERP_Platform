import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { newLine, type EditableLine } from "@ui/primitives/LineItemsEditor";
import { useAuth } from "@auth/AuthContext";
import { listSuppliers } from "@store/inventory";
import { createReceival } from "../../../../api";
import { notifyError, notifySuccess } from "@core/notify";
import { qk } from "@core/queryKeys";

export type SupplierSource = "registered" | "unregistered";

export function useNewReceival() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId } = useAuth();

  const suppliers = useQuery({ queryKey: qk.suppliers(), queryFn: listSuppliers });
  const [source, setSource] = useState<SupplierSource>("registered");
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [supplierName, setSupplierName] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [allReceivedForPo, setAllReceivedForPo] = useState(false);
  const [receivedAt, setReceivedAt] = useState<Date | null>(new Date());
  const [lines, setLines] = useState<EditableLine[]>([newLine(true)]);

  const hasPo = poNumber.trim().length > 0;
  const validLines = lines.filter((l) => l.itemId && l.quantity !== "" && Number(l.quantity) > 0);
  const supplierOk =
    source === "registered" ? !!supplierId : supplierName.trim().length > 0;
  const canSubmit = supplierOk && !!userId && validLines.length > 0;

  const mutation = useMutation({
    mutationFn: () =>
      createReceival({
        supplierId: source === "registered" ? supplierId! : undefined,
        supplierName: source === "unregistered" ? supplierName.trim() : undefined,
        storeKeeperId: userId!,
        poNumber: hasPo ? poNumber.trim() : undefined,
        invoiceNumber: invoiceNumber.trim() || undefined,
        allReceivedForPo: hasPo && allReceivedForPo,
        receivedAt: receivedAt ? receivedAt.toISOString() : undefined,
        receivalItems: validLines.map((l) => ({
          itemId: l.itemId!,
          quantity: Number(l.quantity),
          unitCost: l.unitCost === "" || l.unitCost == null ? undefined : Number(l.unitCost),
          rack: l.rack?.trim() || undefined,
          row: l.row?.trim() || undefined,
          column: l.column?.trim() || undefined,
        })),
      }),
    onSuccess: (receival) => {
      notifySuccess(
        receival.goodReceiveNoteId
          ? `Receival ${receival.receivalNumber} recorded — GRN generated`
          : `Receival ${receival.receivalNumber} recorded`,
      );
      qc.invalidateQueries({ queryKey: qk.receivals() });
      qc.invalidateQueries({ queryKey: qk.goodsReceipts() });
      validLines.forEach((l) => qc.invalidateQueries({ queryKey: qk.item(l.itemId!) }));
      navigate(`/receiving/${receival.id}`);
    },
    onError: notifyError,
  });

  return {
    navigate,
    suppliers,
    source,
    setSource,
    supplierId,
    setSupplierId,
    supplierName,
    setSupplierName,
    poNumber,
    setPoNumber,
    invoiceNumber,
    setInvoiceNumber,
    allReceivedForPo,
    setAllReceivedForPo,
    receivedAt,
    setReceivedAt,
    lines,
    setLines,
    hasPo,
    canSubmit,
    mutation,
  };
}
