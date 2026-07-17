import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ActionIcon, Card, Group, Paper, SimpleGrid, Text, Title } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconArrowLeft } from "@tabler/icons-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { PageHeader } from "@ui/layout/PageHeader";
import { EmptyState } from "@ui/feedback/EmptyState";
import { useUserLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { getEfficiencyReport, getVehicle } from "../../api";

const BAR_COLOR = "var(--mantine-color-blue-5)";

export function VehicleEfficiencyPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const userLabel = useUserLabels();

  const [range, setRange] = useState<[Date | null, Date | null]>([
    dayjs().subtract(29, "day").toDate(),
    dayjs().toDate(),
  ]);
  const [from, to] = range;
  const fromStr = from ? dayjs(from).format("YYYY-MM-DD") : null;
  const toStr = to ? dayjs(to).format("YYYY-MM-DD") : null;
  const ready = !!fromStr && !!toStr && !!vehicleId;

  const vehicle = useQuery({
    queryKey: qk.vehicle(vehicleId!),
    queryFn: () => getVehicle(vehicleId!),
    enabled: !!vehicleId,
  });

  const report = useQuery({
    queryKey: qk.fuelEfficiency(fromStr ?? "", toStr ?? "", vehicleId),
    queryFn: () => getEfficiencyReport(fromStr!, toStr!, vehicleId),
    enabled: ready,
  });

  const vehicleReport = report.data?.[0];

  const dateLookup = useMemo(() => {
    const map = new Map<string, number>();
    for (const pt of vehicleReport?.points ?? []) {
      map.set(pt.date, Number(pt.kmPerLitre.toFixed(2)));
    }
    return map;
  }, [vehicleReport]);

  const chartData = useMemo(() => {
    if (!fromStr || !toStr) return [];
    const rows: { date: string; "km/L": number }[] = [];
    let cursor = dayjs(fromStr);
    const end = dayjs(toStr);
    while (!cursor.isAfter(end)) {
      const iso = cursor.format("YYYY-MM-DD");
      rows.push({ date: cursor.format("MMM D"), "km/L": dateLookup.get(iso) ?? 0 });
      cursor = cursor.add(1, "day");
    }
    return rows;
  }, [fromStr, toStr, dateLookup]);

  const totalKm = vehicleReport?.points.reduce((s, p) => s + p.kmDriven, 0) ?? 0;
  const totalL = vehicleReport?.points.reduce((s, p) => s + p.litresConsumed, 0) ?? 0;
  const avgKmL = totalL > 0 ? totalKm / totalL : 0;
  const fills = vehicleReport?.points.length ?? 0;
  const hasData = fills > 0;

  const xAxisProps = {
    dataKey: "date",
    fontSize: 11,
    tickMargin: 8,
    interval: Math.max(0, Math.floor(chartData.length / 10) - 1),
    angle: chartData.length > 14 ? -35 : 0,
    textAnchor: (chartData.length > 14 ? "end" : "middle") as "end" | "middle",
    height: chartData.length > 14 ? 48 : 30,
  };

  return (
    <div>
      <Group mb="xs" gap={4} align="center">
        <ActionIcon variant="subtle" color="gray" onClick={() => navigate("/fuel/efficiency")}>
          <IconArrowLeft size={18} />
        </ActionIcon>
        <PageHeader
          title={vehicle.data ? `${vehicle.data.vehicleNumber} — Efficiency` : "Vehicle Efficiency"}
        />
      </Group>

      {vehicle.data && (
        <Text c="dimmed" fz="sm" mb="lg">
          Driver: {userLabel(vehicle.data.driverUserId ?? "")}
        </Text>
      )}

      <Group mb="lg">
        <DatePickerInput
          type="range"
          placeholder="Pick date range"
          value={range}
          onChange={setRange}
          valueFormat="MMM D, YYYY"
          clearable
          w={280}
        />
      </Group>

      {hasData && (
        <SimpleGrid cols={{ base: 2, sm: 4 }} mb="lg">
          <Paper withBorder radius="md" p="md">
            <Text fz="xs" c="dimmed" tt="uppercase" fw={500}>Avg km/L</Text>
            <Title order={3} fw={700} mt={4}>{avgKmL.toFixed(2)}</Title>
          </Paper>
          <Paper withBorder radius="md" p="md">
            <Text fz="xs" c="dimmed" tt="uppercase" fw={500}>Total km</Text>
            <Title order={3} fw={700} mt={4}>{totalKm.toFixed(0)}</Title>
          </Paper>
          <Paper withBorder radius="md" p="md">
            <Text fz="xs" c="dimmed" tt="uppercase" fw={500}>Fuel consumed</Text>
            <Title order={3} fw={700} mt={4}>{totalL.toFixed(1)} <Text span fz="sm" fw={400} c="dimmed">L</Text></Title>
          </Paper>
          <Paper withBorder radius="md" p="md">
            <Text fz="xs" c="dimmed" tt="uppercase" fw={500}>Fills recorded</Text>
            <Title order={3} fw={700} mt={4}>{fills}</Title>
          </Paper>
        </SimpleGrid>
      )}

      <Card withBorder radius="md" padding="lg">
        <Text fw={600} mb="md">km / L per day</Text>
        {!ready && (
          <Text c="dimmed" fz="sm" p="md">Select a date range to load the report.</Text>
        )}
        {ready && !hasData && !report.isLoading && (
          <EmptyState
            title="No efficiency data"
            description="Record odometer readings when issuing fuel to generate data for this vehicle."
          />
        )}
        {hasData && (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis {...xAxisProps} />
              <YAxis fontSize={12} unit=" km/L" width={72} />
              <Tooltip formatter={(v: number) => [`${v} km/L`]} />
              <Bar dataKey="km/L" fill={BAR_COLOR} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}
