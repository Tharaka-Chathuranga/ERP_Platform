import { type Column } from "@ui/data";
import type { SupplierItem } from "@core/types";

interface SupplierItemColumnsOptions {
  itemLabel: (id: string) => string;
}

export function buildSupplierItemColumns({ itemLabel }: SupplierItemColumnsOptions): Column<SupplierItem>[] {
  return [
    { header: "Item", render: (si) => itemLabel(si.itemId) },
    { header: "Supplier SKU", render: (si) => si.supplierSku || "—" },
    { header: "Lead days", render: (si) => si.leadTimeDays ?? "—" },
  ];
}
