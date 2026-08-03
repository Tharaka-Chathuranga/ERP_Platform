import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { OilMartSupplier } from "@core/types";
import {
  createOilMartSupplier,
  listOilMartSuppliers,
  updateOilMartSupplier,
  type SaveOilMartSupplierInput,
} from "../../../../api";

export function useOilMartSuppliers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [editing, setEditing] = useState<OilMartSupplier | undefined>();
  const [formOpen, setFormOpen] = useState(false);

  const query = useQuery({ queryKey: qk.oilMartSuppliers(), queryFn: listOilMartSuppliers });

  const suppliers = useMemo(() => {
    const all = query.data ?? [];
    const needle = search.trim().toLowerCase();
    return all.filter((supplier) => {
      if (status !== "ALL" && supplier.status !== status) return false;
      if (!needle) return true;
      return [supplier.code, supplier.name, supplier.contactPerson]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(needle));
    });
  }, [query.data, search, status]);

  const save = useMutation({
    mutationFn: (values: SaveOilMartSupplierInput) =>
      editing ? updateOilMartSupplier(editing.id, values) : createOilMartSupplier(values),
    onSuccess: (supplier) => {
      queryClient.invalidateQueries({ queryKey: qk.oilMartSuppliers() });
      notifySuccess(editing ? `${supplier.name} updated` : `${supplier.name} added`);
      closeForm();
    },
    onError: notifyError,
  });

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(supplier: OilMartSupplier) {
    setEditing(supplier);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(undefined);
  }

  return {
    query,
    suppliers,
    search,
    setSearch,
    status,
    setStatus,
    formOpen,
    editing,
    openCreate,
    openEdit,
    closeForm,
    save,
  };
}
