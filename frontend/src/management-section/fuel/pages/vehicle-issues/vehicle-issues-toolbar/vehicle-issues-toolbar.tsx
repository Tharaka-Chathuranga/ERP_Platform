import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { TableToolbar } from "@ui/data";

interface VehicleFilterOption {
  label: string;
  value: string;
}

interface VehicleIssuesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  dateRange: [Date | null, Date | null];
  onDateRangeChange: (value: [Date | null, Date | null]) => void;
  vehicleId: string | null;
  onVehicleChange: (value: string | null) => void;
  vehicleFilterOptions: VehicleFilterOption[];
  canCreate: boolean;
  onCreate: () => void;
}

export function VehicleIssuesToolbar({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  vehicleId,
  onVehicleChange,
  vehicleFilterOptions,
  canCreate,
  onCreate,
}: VehicleIssuesToolbarProps) {
  return (
    <TableToolbar
      search={{ value: search, onChange: onSearchChange, placeholder: "Search vehicle, issuer or receiver…" }}
      filters={[
        {
          type: "daterange",
          label: "Date",
          value: dateRange,
          onChange: onDateRangeChange,
        },
        {
          type: "select",
          label: "Vehicle",
          value: vehicleId ?? "ALL",
          onChange: (v) => onVehicleChange(v === "ALL" ? null : v),
          options: vehicleFilterOptions,
        },
      ]}
      actions={
        canCreate ? (
          <Button leftSection={<IconPlus size={16} />} onClick={onCreate}>
            New issue
          </Button>
        ) : undefined
      }
    />
  );
}
