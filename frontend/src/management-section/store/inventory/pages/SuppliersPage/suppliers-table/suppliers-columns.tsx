import { Anchor } from "@mantine/core";
import { type Column } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { Supplier } from "@core/types";

interface SupplierColumnsOptions {
  canManage: boolean;
  togglePending: boolean;
  onToggle: (supplier: Supplier) => void;
}

export function buildSupplierColumns({ canManage, togglePending, onToggle }: SupplierColumnsOptions): Column<Supplier>[] {
  const columns: Column<Supplier>[] = [
    { header: "Code", emphasis: true, render: (s) => s.code },
    { header: "Name", render: (s) => s.name },
    { header: "Status", render: (s) => <StatusBadge status={s.status} /> },
  ];

  if (canManage) {
    columns.push({
      header: "",
      align: "right",
      render: (s) => (
        <Anchor
          component="button"
          type="button"
          c={s.status === "ACTIVE" ? "red" : "green"}
          onClick={(e) => {
            e.stopPropagation();
            if (!togglePending) onToggle(s);
          }}
        >
          {s.status === "ACTIVE" ? "Deactivate" : "Activate"}
        </Anchor>
      ),
    });
  }

  return columns;
}
