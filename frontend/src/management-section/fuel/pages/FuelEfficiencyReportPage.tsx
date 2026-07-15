import { useMemo, useState } from "react";
import { Badge, Box, Card, Group, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { DatePickerInput } from "@mantine/dates";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { PageHeader } from "@ui/layout/PageHeader";
import { DataTable, type Column } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import { useUserLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { getEfficiencyReport } from "../api";

const LINE_COLORS = [
  "var(--mantine-color-blue-5)",
  "var(--mantine-color-teal-5)",
  "var(--mantine-color-grape-5)",
  "var(--mantine-color-orange-5)",
  "var(--mantine-color-pink-5)",
  "var(--mantine-color-cyan-5)",
  "var(--mantine-color-yellow-5)",
  "var(--mantine-color-red-5)",
];

interface SummaryRow {
  vehicleId: string;
  vehicleNumber: string;
  driverUserId: string;
  avgKmPerLitre: number;
  totalKm: number;
  totalLitres: number;
  readings: number;
}

interface FlagRow {
  vehicleId: string;
  vehicleNumber: string;
  driverUserId: string;
  type: "sharp-drop" | "below-average" | "sharp-gain" | "above-average";
  currentKmL: number;
  referenceKmL: number;
  changePct: number;
}

export function FuelEfficiencyReportPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState<[Date | null, Date | null]>([
    dayjs().subtract(29, "day").toDate(),
    dayjs().toDate(),
  ]);

  const [from, to] = range;
  const fromStr = from ? dayjs(from).format("YYYY-MM-DD") : null;
  const toStr = to ? dayjs(to).format("YYYY-MM-DD") : null;
  const ready = !!fromStr && !!toStr;

  const report = useQuery({
    queryKey: qk.fuelEfficiency(fromStr ?? "", toStr ?? ""),
    queryFn: () => getEfficiencyReport(fromStr!, toStr!),
    enabled: ready,
  });

  const userLabel = useUserLabels();
  const vehicles = report.data ?? [];

  // vehicleNumber → driverUserId, for tooltip lookup
  const vehicleDriverMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of vehicles) map.set(v.vehicleNumber, v.driverUserId);
    return map;
  }, [vehicles]);

  // ISO date → { vehicleNumber: kmPerLitre }
  const dateLookup = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    for (const v of vehicles) {
      for (const pt of v.points) {
        if (!map.has(pt.date)) map.set(pt.date, {});
        map.get(pt.date)![v.vehicleNumber] = Number(pt.kmPerLitre.toFixed(2));
      }
    }
    return map;
  }, [vehicles]);

  // One entry per day; null for vehicles with no fill that day so lines don't drop to zero
  const chartData = useMemo(() => {
    if (!fromStr || !toStr || vehicles.length === 0) return [];
    const rows: Record<string, string | number | null>[] = [];
    let cursor = dayjs(fromStr);
    const end = dayjs(toStr);
    while (!cursor.isAfter(end)) {
      const iso = cursor.format("YYYY-MM-DD");
      const fills = dateLookup.get(iso) ?? {};
      const entry: Record<string, string | number | null> = { date: cursor.format("MMM D") };
      for (const v of vehicles) entry[v.vehicleNumber] = fills[v.vehicleNumber] ?? null;
      rows.push(entry);
      cursor = cursor.add(1, "day");
    }
    return rows;
  }, [vehicles, fromStr, toStr, dateLookup]);

  const summaryRows = useMemo<SummaryRow[]>(() => {
    return vehicles.map((r) => {
      const totalKm = r.points.reduce((s, p) => s + p.kmDriven, 0);
      const totalLitres = r.points.reduce((s, p) => s + p.litresConsumed, 0);
      return {
        vehicleId: r.vehicleId,
        vehicleNumber: r.vehicleNumber,
        driverUserId: r.driverUserId,
        avgKmPerLitre: totalLitres > 0 ? totalKm / totalLitres : 0,
        totalKm,
        totalLitres,
        readings: r.points.length,
      };
    });
  }, [vehicles]);

  const fleetAvgKmL = useMemo(() => {
    const totalKm = summaryRows.reduce((s, r) => s + r.totalKm, 0);
    const totalL = summaryRows.reduce((s, r) => s + r.totalLitres, 0);
    return totalL > 0 ? totalKm / totalL : 0;
  }, [summaryRows]);

  const { declineRows, improveRows } = useMemo<{ declineRows: FlagRow[]; improveRows: FlagRow[] }>(() => {
    const declines: FlagRow[] = [];
    const improvements: FlagRow[] = [];

    for (const r of vehicles) {
      const pts = r.points;
      const summary = summaryRows.find((s) => s.vehicleId === r.vehicleId);

      if (pts.length >= 2) {
        const prev = pts[pts.length - 2].kmPerLitre;
        const curr = pts[pts.length - 1].kmPerLitre;
        const change = (curr - prev) / prev;
        if (change <= -0.2) {
          declines.push({ vehicleId: r.vehicleId, vehicleNumber: r.vehicleNumber, driverUserId: r.driverUserId, type: "sharp-drop", currentKmL: curr, referenceKmL: prev, changePct: change * 100 });
          continue;
        }
        if (change >= 0.2) {
          improvements.push({ vehicleId: r.vehicleId, vehicleNumber: r.vehicleNumber, driverUserId: r.driverUserId, type: "sharp-gain", currentKmL: curr, referenceKmL: prev, changePct: change * 100 });
          continue;
        }
      }

      if (fleetAvgKmL > 0 && summary) {
        const gap = (summary.avgKmPerLitre - fleetAvgKmL) / fleetAvgKmL;
        if (gap <= -0.2) {
          declines.push({ vehicleId: r.vehicleId, vehicleNumber: r.vehicleNumber, driverUserId: r.driverUserId, type: "below-average", currentKmL: summary.avgKmPerLitre, referenceKmL: fleetAvgKmL, changePct: gap * 100 });
        } else if (gap >= 0.2) {
          improvements.push({ vehicleId: r.vehicleId, vehicleNumber: r.vehicleNumber, driverUserId: r.driverUserId, type: "above-average", currentKmL: summary.avgKmPerLitre, referenceKmL: fleetAvgKmL, changePct: gap * 100 });
        }
      }
    }

    return { declineRows: declines, improveRows: improvements };
  }, [vehicles, summaryRows, fleetAvgKmL]);

  const declineColumns: Column<FlagRow>[] = [
    { header: "Vehicle", emphasis: true, render: (r) => r.vehicleNumber },
    { header: "Driver", render: (r) => userLabel(r.driverUserId) },
    { header: "Reason", render: (r) => r.type === "sharp-drop" ? "Sharp drop since last fill" : "Below fleet average" },
    { header: "Current km/L", align: "right", render: (r) => r.currentKmL.toFixed(2) },
    { header: "Reference km/L", align: "right", render: (r) => r.referenceKmL.toFixed(2) },
    { header: "Change", align: "right", render: (r) => <Badge color={r.changePct < -40 ? "red" : "orange"} variant="light" radius="sm">{r.changePct.toFixed(0)}%</Badge> },
  ];

  const improveColumns: Column<FlagRow>[] = [
    { header: "Vehicle", emphasis: true, render: (r) => r.vehicleNumber },
    { header: "Driver", render: (r) => userLabel(r.driverUserId) },
    { header: "Reason", render: (r) => r.type === "sharp-gain" ? "Improved since last fill" : "Above fleet average" },
    { header: "Current km/L", align: "right", render: (r) => r.currentKmL.toFixed(2) },
    { header: "Reference km/L", align: "right", render: (r) => r.referenceKmL.toFixed(2) },
    { header: "Change", align: "right", render: (r) => <Badge color={r.changePct > 40 ? "teal" : "green"} variant="light" radius="sm">+{r.changePct.toFixed(0)}%</Badge> },
  ];

  const hasData = chartData.length > 0 && vehicles.length > 0;

  const xAxisProps = {
    dataKey: "date",
    fontSize: 11,
    tickMargin: 8,
    interval: Math.max(0, Math.floor(chartData.length / 10) - 1),
    angle: chartData.length > 14 ? -35 : 0,
    textAnchor: (chartData.length > 14 ? "end" : "middle") as "end" | "middle",
    height: chartData.length > 14 ? 48 : 30,
  };

  const goToVehicle = (vehicleId: string) => navigate(`/fuel/efficiency/${vehicleId}`);

  return (
    <div>
      <PageHeader title="Fleet fuel efficiency" />

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

      <Card withBorder radius="md" padding="lg" mb="lg">
        <Text fw={600} mb="md">km / L per vehicle</Text>
        {!ready && <Text c="dimmed" fz="sm" p="md">Select a date range to load the report.</Text>}
        {ready && !hasData && !report.isLoading && (
          <EmptyState title="No efficiency data" description="Record odometer readings when issuing fuel to generate this report." />
        )}
        {hasData && (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis {...xAxisProps} />
              <YAxis fontSize={12} unit=" km/L" width={72} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const entries = payload.filter((p) => p.value !== null && p.value !== 0);
                  if (!entries.length) return null;
                  return (
                    <Paper withBorder shadow="sm" p="sm" radius="md" style={{ minWidth: 180 }}>
                      <Text fw={600} fz="sm" mb="xs">{label}</Text>
                      {entries.map((p) => (
                        <Group key={String(p.dataKey)} gap="xs" mb={4} wrap="nowrap" align="flex-start">
                          <Box mt={3} style={{ width: 10, height: 10, borderRadius: 2, background: String(p.color), flexShrink: 0 }} />
                          <Stack gap={0}>
                            <Text fz="xs" fw={600}>{p.dataKey}</Text>
                            <Text fz="xs" c="dimmed">{userLabel(vehicleDriverMap.get(String(p.dataKey)) ?? "")}</Text>
                            <Text fz="xs" fw={700}>{Number(p.value).toFixed(2)} km/L</Text>
                          </Stack>
                        </Group>
                      ))}
                    </Paper>
                  );
                }}
              />
              <Legend />
              {vehicles.map((r, i) => (
                <Line
                  key={r.vehicleId}
                  type="monotone"
                  dataKey={r.vehicleNumber}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {hasData && declineRows.length > 0 && (
        <Card withBorder radius="md" padding="lg" mb="lg">
          <Group gap="xs" mb="md">
            <ThemeIcon size="sm" variant="light" color="orange" radius="xl">
              <IconAlertTriangle size={13} />
            </ThemeIcon>
            <Text fw={600}>High fuel consumption</Text>
            <Badge color="orange" variant="light" radius="sm" size="sm">{declineRows.length}</Badge>
          </Group>
          <Text fz="xs" c="dimmed" mb="md">
            Vehicles with a sharp drop in km/L since their last fill, or averaging more than 20% below the fleet average. These may need inspection.
          </Text>
          <DataTable<FlagRow> data={declineRows} columns={declineColumns} rowKey={(r) => r.vehicleId + r.type} onRowClick={(r) => goToVehicle(r.vehicleId)} />
        </Card>
      )}

      {hasData && improveRows.length > 0 && (
        <Card withBorder radius="md" padding="lg" mb="lg">
          <Group gap="xs" mb="md">
            <ThemeIcon size="sm" variant="light" color="teal" radius="xl">
              <IconAlertTriangle size={13} style={{ transform: "rotate(180deg)" }} />
            </ThemeIcon>
            <Text fw={600}>Improved fuel efficiency</Text>
            <Badge color="teal" variant="light" radius="sm" size="sm">{improveRows.length}</Badge>
          </Group>
          <Text fz="xs" c="dimmed" mb="md">
            Vehicles showing a significant improvement in km/L since their last fill, or consistently above the fleet average.
          </Text>
          <DataTable<FlagRow> data={improveRows} columns={improveColumns} rowKey={(r) => r.vehicleId + r.type} onRowClick={(r) => goToVehicle(r.vehicleId)} />
        </Card>
      )}

      {hasData && (
        <Stack gap="xs">
          <Text fw={600} fz="sm" tt="uppercase" c="dimmed" style={{ letterSpacing: "0.05em" }}>Summary</Text>
          <DataTable<SummaryRow>
            data={summaryRows}
            columns={[
              { header: "Vehicle", emphasis: true, render: (r) => r.vehicleNumber },
              { header: "Driver", render: (r) => userLabel(r.driverUserId) },
              { header: "Avg km/L", align: "right", render: (r) => r.avgKmPerLitre.toFixed(2) },
              { header: "Total km", align: "right", render: (r) => r.totalKm.toFixed(1) },
              { header: "Total litres", align: "right", render: (r) => r.totalLitres.toFixed(2) },
              { header: "Data points", align: "right", render: (r) => r.readings },
            ]}
            rowKey={(r) => r.vehicleId}
            loading={report.isLoading}
            error={report.error}
            onRowClick={(r) => goToVehicle(r.vehicleId)}
          />
        </Stack>
      )}
    </div>
  );
}
