import { useState } from "react";
import { Anchor } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@core/queryKeys";
import { notifyError, notifySuccess } from "@core/notify";
import { listSuppliers } from "@store/inventory/suppliers.api";
import { AppButton } from "@ui/buttons/AppButton";
import { DataTable } from "@ui/data/DataTable";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { PageHeader } from "@ui/layout/PageHeader";
import type { Supplier } from "@core/types";
import { activateSupplier, deactivateSupplier } from "./suppliers.admin.api";
import { SupplierFormModal } from "./SupplierFormModal";

export function SuppliersAdminPage() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: qk.suppliers(),
    queryFn: listSuppliers,
  });

  const toggle = useMutation({
    mutationFn: (s: Supplier) =>
      s.status === "ACTIVE" ? deactivateSupplier(s.id) : activateSupplier(s.id),
    onSuccess: () => {
      notifySuccess("Supplier updated");
      qc.invalidateQueries({ queryKey: qk.suppliers() });
    },
    onError: notifyError,
  });

  return (
    <div>
      <PageHeader
        title="Suppliers"
        actions={<AppButton label="New supplier" onClick={() => setCreating(true)} />}
      />

      <DataTable<Supplier>
        data={data}
        loading={isLoading}
        error={error}
        rowKey={(r) => r.id}
        columns={[
          { header: "Code", render: (r) => r.code, emphasis: true },
          { header: "Name", render: (r) => r.name },
          { header: "Country", render: (r) => r.country ?? "—" },
          { header: "Email", render: (r) => r.email ?? "—" },
          { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
          {
            header: "",
            align: "right",
            render: (r) => (
              <Anchor
                component="button"
                type="button"
                c={r.status === "ACTIVE" ? "red" : "green"}
                onClick={() => !toggle.isPending && toggle.mutate(r)}
              >
                {r.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </Anchor>
            ),
          },
        ]}
      />

      <SupplierFormModal opened={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
