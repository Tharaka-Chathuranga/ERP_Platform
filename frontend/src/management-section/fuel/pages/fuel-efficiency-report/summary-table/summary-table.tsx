import { Stack, Text } from "@mantine/core";
import { DataTable } from "@ui/data";
import type { SummaryRow } from "../types";

interface SummaryTableProps {
  rows: SummaryRow[];
  userLabel: (id: string) => string;
  loading: boolean;
  error: unknown;
  onRowClick: (vehicleId: string) => void;
}

export function SummaryTable({ rows, userLabel, loading, error, onRowClick }: SummaryTableProps) {
  return (
    <Stack gap="xs">
      <Text fw={600} fz="sm" tt="uppercase" c="dimmed" style={{ letterSpacing: "0.05em" }}>
        Summary
      </Text>
      <DataTable<SummaryRow>
        data={rows}
        columns={[
          { header: "Vehicle", emphasis: true, render: (r) => r.vehicleNumber },
          { header: "Driver", render: (r) => userLabel(r.driverUserId) },
          { header: "Avg km/L", align: "right", render: (r) => r.avgKmPerLitre.toFixed(2) },
          { header: "Total km", align: "right", render: (r) => r.totalKm.toFixed(1) },
          { header: "Total litres", align: "right", render: (r) => r.totalLitres.toFixed(2) },
          { header: "Data points", align: "right", render: (r) => r.readings },
        ]}
        rowKey={(r) => r.vehicleId}
        loading={loading}
        error={error}
        onRowClick={(r) => onRowClick(r.vehicleId)}
      />
    </Stack>
  );
}
