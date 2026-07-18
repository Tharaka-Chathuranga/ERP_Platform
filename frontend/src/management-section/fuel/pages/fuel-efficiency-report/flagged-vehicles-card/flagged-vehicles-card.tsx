import { Badge, Card, Group, Text, ThemeIcon } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { DataTable, type Column } from "@ui/data";
import type { FlagRow, FlagTone } from "../types";

const TONE_META = {
  high: {
    color: "orange",
    rotate: false,
    title: "High fuel consumption",
    description:
      "Vehicles with a sharp drop in km/L since their last fill, or averaging more than 20% below the fleet average. These may need inspection.",
    changeBadge: (pct: number) => ({ color: pct < -40 ? "red" : "orange", text: `${pct.toFixed(0)}%` }),
  },
  improved: {
    color: "teal",
    rotate: true,
    title: "Improved fuel efficiency",
    description:
      "Vehicles showing a significant improvement in km/L since their last fill, or consistently above the fleet average.",
    changeBadge: (pct: number) => ({ color: pct > 40 ? "teal" : "green", text: `+${pct.toFixed(0)}%` }),
  },
} as const;

interface FlaggedVehiclesCardProps {
  tone: FlagTone;
  rows: FlagRow[];
  userLabel: (id: string) => string;
  onRowClick: (vehicleId: string) => void;
}

export function FlaggedVehiclesCard({ tone, rows, userLabel, onRowClick }: FlaggedVehiclesCardProps) {
  const meta = TONE_META[tone];
  const columns: Column<FlagRow>[] = [
    { header: "Vehicle", emphasis: true, render: (r) => r.vehicleNumber },
    { header: "Driver", render: (r) => userLabel(r.driverUserId) },
    { header: "Current km/L", align: "right", render: (r) => r.currentKmL.toFixed(2) },
    { header: "Reference km/L", align: "right", render: (r) => r.referenceKmL.toFixed(2) },
    {
      header: "Change",
      align: "right",
      render: (r) => {
        const badge = meta.changeBadge(r.changePct);
        return (
          <Badge color={badge.color} variant="light" radius="sm">
            {badge.text}
          </Badge>
        );
      },
    },
  ];

  return (
    <Card withBorder radius="md" padding="lg" mb="lg">
      <Group gap="xs" mb="md">
        <ThemeIcon size="sm" variant="light" color={meta.color} radius="xl">
          <IconAlertTriangle size={13} style={meta.rotate ? { transform: "rotate(180deg)" } : undefined} />
        </ThemeIcon>
        <Text fw={600}>{meta.title}</Text>
        <Badge color={meta.color} variant="light" radius="sm" size="sm">
          {rows.length}
        </Badge>
      </Group>
      <Text fz="xs" c="dimmed" mb="md">
        {meta.description}
      </Text>
      <DataTable<FlagRow>
        data={rows}
        columns={columns}
        rowKey={(r) => r.vehicleId + r.type}
        onRowClick={(r) => onRowClick(r.vehicleId)}
      />
    </Card>
  );
}
