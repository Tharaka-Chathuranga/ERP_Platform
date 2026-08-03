import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { DataTable, type Column } from "@ui/data";
import { Text } from "@mantine/core";
import { qk } from "@core/queryKeys";
import type { FuelTankReading } from "@core/types";
import { listReadings } from "../../../api";

export function ReadingsTable({ tankId }: { tankId: string }) {
  const readings = useQuery({
    queryKey: qk.tankReadings(tankId),
    queryFn: () => listReadings(tankId),
  });
  const columns: Column<FuelTankReading>[] = [
    { header: "Time", render: (r) => dayjs(r.readingAt).format("MMM D, YYYY HH:mm") },
    { header: "Measured (L)", align: "right", render: (r) => r.litresMeasured },
    {
      header: "Consumed since prev. (L)",
      align: "right",
      render: (r) => (r.consumptionSincePrevious != null ? r.consumptionSincePrevious : "—"),
    },
    { header: "Note", render: (r) => r.note ?? "—" },
  ];
  return (
    <DataTable
      columns={columns}
      data={readings.data}
      rowKey={(r) => r.id}
      loading={readings.isLoading}
      error={readings.error}
      empty={<Text c="dimmed" p="md">No readings recorded yet.</Text>}
    />
  );
}
