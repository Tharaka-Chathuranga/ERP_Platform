import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCan } from "@auth/useCan";
import { useItemLabels } from "@core/hooks/useLookups";
import { SUPPLIER_MANAGE } from "@auth/permissions";
import { notifyError, notifySuccess } from "@core/notify";
import type { Supplier } from "@core/types";
import {
  activateSupplier,
  deactivateSupplier,
  listSupplierItems,
  listSuppliers,
} from "../../../../api";

export function useSuppliers() {
  const qc = useQueryClient();
  const canManage = useCan()(SUPPLIER_MANAGE);
  const itemLabel = useItemLabels();
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  const suppliers = useQuery({ queryKey: ["suppliers"], queryFn: listSuppliers });
  const supplierItems = useQuery({
    queryKey: ["supplierItems", selected?.id],
    queryFn: () => listSupplierItems(selected!.id),
    enabled: !!selected,
  });

  const toggle = useMutation({
    mutationFn: (s: Supplier) =>
      s.status === "ACTIVE" ? deactivateSupplier(s.id) : activateSupplier(s.id),
    onSuccess: () => {
      notifySuccess("Supplier updated");
      qc.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: notifyError,
  });

  const term = search.trim().toLowerCase();
  const filteredSuppliers = (suppliers.data ?? []).filter(
    (s) => s.code.toLowerCase().includes(term) || s.name.toLowerCase().includes(term),
  );

  return {
    canManage,
    itemLabel,
    selected,
    setSelected,
    creating,
    setCreating,
    search,
    setSearch,
    suppliers,
    supplierItems,
    toggle,
    filteredSuppliers,
  };
}
