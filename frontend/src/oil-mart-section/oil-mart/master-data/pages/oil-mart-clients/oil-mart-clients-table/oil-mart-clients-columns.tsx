import { ActionIcon } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import type { Column } from "@ui/data";
import { StackedCell } from "@ui/data";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { OilMartClient } from "@core/types";

export function buildOilMartClientsColumns(
  canManage: boolean,
  onEdit: (client: OilMartClient) => void,
): Column<OilMartClient>[] {
  const columns: Column<OilMartClient>[] = [
    {
      header: "Client",
      emphasis: true,
      render: (client) => <StackedCell primary={client.name} secondary={client.code} />,
    },
    { header: "Contact person", render: (client) => client.contactPerson ?? "—" },
    { header: "Phone", render: (client) => client.phone ?? "—" },
    { header: "Email", render: (client) => client.email ?? "—" },
    { header: "Status", render: (client) => <StatusBadge status={client.status} /> },
  ];

  if (canManage) {
    columns.push({
      header: "",
      width: 56,
      align: "right",
      render: (client) => (
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label={`Edit ${client.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onEdit(client);
          }}
        >
          <IconPencil size={16} />
        </ActionIcon>
      ),
    });
  }

  return columns;
}
