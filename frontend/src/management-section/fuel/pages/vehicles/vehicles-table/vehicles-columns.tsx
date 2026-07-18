import { ActionIcon } from "@mantine/core";
import { IconPencil } from "@tabler/icons-react";
import type { Column } from "@ui/data";
import type { Vehicle } from "@core/types";

interface VehiclesColumnsOptions {
  canManage: boolean;
  userName: (id?: string) => string;
  onEdit: (vehicle: Vehicle) => void;
}

export function buildVehiclesColumns({
  canManage,
  userName,
  onEdit,
}: VehiclesColumnsOptions): Column<Vehicle>[] {
  return [
    { header: "Vehicle no.", emphasis: true, render: (v) => v.vehicleNumber },
    { header: "Name", render: (v) => v.name ?? "—" },
    { header: "Category", render: (v) => v.category ?? "—" },
    { header: "Capacity", align: "right", render: (v) => `${v.fullTankCapacityLitres} L` },
    { header: "Driver", render: (v) => userName(v.driverUserId) },
    { header: "Description", render: (v) => v.description ?? "—" },
    ...(canManage
      ? [
          {
            header: "",
            align: "right" as const,
            render: (v: Vehicle) => (
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label="Edit vehicle"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(v);
                }}
              >
                <IconPencil size={16} />
              </ActionIcon>
            ),
          },
        ]
      : []),
  ];
}
