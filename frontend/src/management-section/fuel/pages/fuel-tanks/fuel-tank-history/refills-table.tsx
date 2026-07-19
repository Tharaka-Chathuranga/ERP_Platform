import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { DataTable, type Column } from "@ui/data";
import { Text } from "@mantine/core";
import { qk } from "@core/queryKeys";
import type { FuelTankRefill } from "@core/types";
import { listRefills } from "../../../api";

export function RefillsTable({ tankId }: { tankId: string }) {
  const refills = useQuery({
    queryKey: qk.tankRefills(tankId),
    queryFn: () => listRefills(tankId),
  });
  const columns: Column<FuelTankRefill>[] = [
    { header: "Time", render: (r) => dayjs(r.refilledAt).format("MMM D, YYYY HH:mm") },
    { header: "Litres", align: "right", render: (r) => r.litres },
    { header: "Note", render: (r) => r.note ?? "—" },
  ];
  return (
    <DataTable
      columns={columns}
      data={refills.data}
      rowKey={(r) => r.id}
      loading={refills.isLoading}
      error={refills.error}
      empty={<Text c="dimmed" p="md">No refills recorded yet.</Text>}
    />
  );
}
