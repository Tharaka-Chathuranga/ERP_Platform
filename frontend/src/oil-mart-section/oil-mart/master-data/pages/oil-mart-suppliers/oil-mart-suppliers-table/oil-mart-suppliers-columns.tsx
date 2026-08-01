import { ActionIcon } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import type { Column } from "@ui/data";
import { StackedCell } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { OilMartSupplier } from "@core/types";

export function buildOilMartSuppliersColumns(
  canManage: boolean,
  onEdit: (supplier: OilMartSupplier) => void,
): Column<OilMartSupplier>[] {
  const columns: Column<OilMartSupplier>[] = [
    {
      header: "Supplier",
      emphasis: true,
      render: (supplier) => <StackedCell primary={supplier.name} secondary={supplier.code} />,
    },
    { header: "Contact person", render: (supplier) => supplier.contactPerson ?? "—" },
    { header: "Phone", render: (supplier) => supplier.phone ?? "—" },
    { header: "Email", render: (supplier) => supplier.email ?? "—" },
    { header: "Status", render: (supplier) => <StatusBadge status={supplier.status} /> },
  ];

  if (canManage) {
    columns.push({
      header: "",
      width: 56,
      align: "right",
      render: (supplier) => (
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label={`Edit ${supplier.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onEdit(supplier);
          }}
        >
          <IconPencil size={16} />
        </ActionIcon>
      ),
    });
  }

  return columns;
}
