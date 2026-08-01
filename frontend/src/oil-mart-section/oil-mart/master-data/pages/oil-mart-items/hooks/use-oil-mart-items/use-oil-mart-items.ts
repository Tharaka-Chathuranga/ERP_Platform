import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { OilMartItem } from "@core/types";
import {
  createOilMartItem,
  listOilMartItems,
  updateOilMartItem,
  type SaveOilMartItemInput,
} from "../../../../api";

export function useOilMartItems() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [oilType, setOilType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [editing, setEditing] = useState<OilMartItem | undefined>();
  const [formOpen, setFormOpen] = useState(false);

  const query = useQuery({ queryKey: qk.oilMartItems(), queryFn: () => listOilMartItems() });

  const items = useMemo(() => {
    const all = query.data ?? [];
    const needle = search.trim().toLowerCase();
    return all.filter((item) => {
      if (oilType !== "ALL" && item.oilType !== oilType) return false;
      if (status !== "ALL" && item.status !== status) return false;
      if (!needle) return true;
      return [item.code, item.name, item.brand, item.grade]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(needle));
    });
  }, [query.data, search, oilType, status]);

  const save = useMutation({
    mutationFn: (values: SaveOilMartItemInput) =>
      editing ? updateOilMartItem(editing.id, values) : createOilMartItem(values),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: qk.oilMartItems() });
      queryClient.invalidateQueries({ queryKey: qk.oilMartItem(item.id) });
      queryClient.invalidateQueries({ queryKey: qk.oilMartStock() });
      notifySuccess(editing ? `${item.name} updated` : `${item.name} added`);
      closeForm();
    },
    onError: notifyError,
  });

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(item: OilMartItem) {
    setEditing(item);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(undefined);
  }

  return {
    query,
    items,
    search,
    setSearch,
    oilType,
    setOilType,
    status,
    setStatus,
    formOpen,
    editing,
    openCreate,
    openEdit,
    closeForm,
    save,
    openDetail: (item: OilMartItem) => navigate(`/oil-mart/items/${item.id}`),
  };
}
