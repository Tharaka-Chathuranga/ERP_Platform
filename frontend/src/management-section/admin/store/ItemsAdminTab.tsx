import { useState } from "react";
import { Anchor, Group } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useItems } from "@core/hooks/useItems";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { CreateItemModal } from "@store/inventory";
import { AppButton } from "@ui/buttons/AppButton";
import { DataTable } from "@ui/data/DataTable";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { Item } from "@core/types";
import { deactivateItem } from "./items.admin.api";
import { ItemEditModal } from "./ItemEditModal";

export function ItemsAdminTab() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useItems();
  const [editing, setEditing] = useState<Item | null>(null);
  const [creating, setCreating] = useState(false);

  const deactivate = useMutation({
    mutationFn: (id: string) => deactivateItem(id),
    onSuccess: () => {
      notifySuccess("Item deactivated");
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: qk.adminSummary() });
    },
    onError: notifyError,
  });

  return (
    <>
      <Group justify="flex-end" mb="md">
        <AppButton label="New item" onClick={() => setCreating(true)} />
      </Group>

      <DataTable<Item>
        data={data?.content}
        loading={isLoading}
        error={error}
        rowKey={(r) => r.id}
        columns={[
          { header: "Code", render: (r) => r.itemCode, emphasis: true },
          { header: "Name", render: (r) => r.name },
          { header: "Category", render: (r) => r.category ?? "—" },
          { header: "Reorder", render: (r) => r.reorderLevel, align: "right" },
          { header: "Critical", render: (r) => (r.criticalItem ? <StatusBadge status="CRITICAL" /> : "—") },
          { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            header: "",
            align: "right",
            render: (r) => (
              <Group gap="xs" justify="flex-end" wrap="nowrap">
                <Anchor component="button" type="button" onClick={() => setEditing(r)}>
                  Edit
                </Anchor>
                {r.status === "ACTIVE" && (
                  <Anchor
                    component="button"
                    type="button"
                    c="red"
                    onClick={() => deactivate.mutate(r.id)}
                  >
                    Deactivate
                  </Anchor>
                )}
              </Group>
            ),
          },
        ]}
      />

      <ItemEditModal item={editing} onClose={() => setEditing(null)} />
      <CreateItemModal opened={creating} onClose={() => setCreating(false)} />
    </>
  );
}
