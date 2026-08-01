import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import type { OilMartClient } from "@core/types";
import {
  createOilMartClient,
  listOilMartClients,
  updateOilMartClient,
  type SaveOilMartClientInput,
} from "../../../../api";

export function useOilMartClients() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [editing, setEditing] = useState<OilMartClient | undefined>();
  const [formOpen, setFormOpen] = useState(false);

  const query = useQuery({ queryKey: qk.oilMartClients(), queryFn: () => listOilMartClients() });

  const clients = useMemo(() => {
    const all = query.data ?? [];
    const needle = search.trim().toLowerCase();
    return all.filter((client) => {
      if (status !== "ALL" && client.status !== status) return false;
      if (!needle) return true;
      return [client.code, client.name, client.contactPerson]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(needle));
    });
  }, [query.data, search, status]);

  const save = useMutation({
    mutationFn: (values: SaveOilMartClientInput) =>
      editing ? updateOilMartClient(editing.id, values) : createOilMartClient(values),
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: qk.oilMartClients() });
      notifySuccess(editing ? `${client.name} updated` : `${client.name} added`);
      closeForm();
    },
    onError: notifyError,
  });

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(client: OilMartClient) {
    setEditing(client);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(undefined);
  }

  return {
    query,
    clients,
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
    openDetail: (client: OilMartClient) => navigate(`/oil-mart/clients/${client.id}`),
  };
}
