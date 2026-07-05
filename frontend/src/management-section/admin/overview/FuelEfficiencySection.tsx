import { useMemo, useState } from "react";
import { Badge, Grid, Text } from "@mantine/core";
import { IconChartBar, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { DataTable, TableToolbar, type Column } from "@ui/data";
import { useUserLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { getEfficiencyReport, listVehicles } from "@fuel/fuel.api";
import { OverviewCard } from "./OverviewCard";

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

const FROM = dayjs().subtract(29, "day").format("YYYY-MM-DD");
const TO = dayjs().format("YYYY-MM-DD");

export function FuelEfficiencySection() {
  const userLabel = useUserLabels();

  const report = useQuery({
    queryKey: qk.fuelEfficiency(FROM, TO),
    queryFn: () => getEfficiencyReport(FROM, TO),
  });

  const vehicles = useQuery({ queryKey: qk.vehicles(), queryFn: () => listVehicles() });

  const vehicleOptions = useMemo(() => [
    { label: "All vehicles", value: "ALL" },
    ...(vehicles.data?.content.map((v) => ({ value: v.id, label: v.vehicleNumber })) ?? []),
  ], [vehicles.data]);

  // ── Summary rows ────────────────────────────────────────────────────────────
  const summaryRows = useMemo<SummaryRow[]>(() => {
    return (report.data ?? []).map((r) => {
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
  }, [report.data]);

  const fleetAvgKmL = useMemo(() => {
    const km = summaryRows.reduce((s, r) => s + r.totalKm, 0);
    const l = summaryRows.reduce((s, r) => s + r.totalLitres, 0);
    return l > 0 ? km / l : 0;
  }, [summaryRows]);

  // ── Flag rows ───────────────────────────────────────────────────────────────
  const { declineRows, improveRows } = useMemo<{ declineRows: FlagRow[]; improveRows: FlagRow[] }>(() => {
    const declines: FlagRow[] = [];
    const improvements: FlagRow[] = [];
    for (const r of report.data ?? []) {
      const pts = r.points;
      const summary = summaryRows.find((s) => s.vehicleId === r.vehicleId);
      if (pts.length >= 2) {
        const prev = pts[pts.length - 2].kmPerLitre;
        const curr = pts[pts.length - 1].kmPerLitre;
        const change = (curr - prev) / prev;
        if (change <= -0.2) { declines.push({ vehicleId: r.vehicleId, vehicleNumber: r.vehicleNumber, driverUserId: r.driverUserId, type: "sharp-drop", currentKmL: curr, referenceKmL: prev, changePct: change * 100 }); continue; }
        if (change >= 0.2) { improvements.push({ vehicleId: r.vehicleId, vehicleNumber: r.vehicleNumber, driverUserId: r.driverUserId, type: "sharp-gain", currentKmL: curr, referenceKmL: prev, changePct: change * 100 }); continue; }
      }
      if (fleetAvgKmL > 0 && summary) {
        const gap = (summary.avgKmPerLitre - fleetAvgKmL) / fleetAvgKmL;
        if (gap <= -0.2) declines.push({ vehicleId: r.vehicleId, vehicleNumber: r.vehicleNumber, driverUserId: r.driverUserId, type: "below-average", currentKmL: summary.avgKmPerLitre, referenceKmL: fleetAvgKmL, changePct: gap * 100 });
        else if (gap >= 0.2) improvements.push({ vehicleId: r.vehicleId, vehicleNumber: r.vehicleNumber, driverUserId: r.driverUserId, type: "above-average", currentKmL: summary.avgKmPerLitre, referenceKmL: fleetAvgKmL, changePct: gap * 100 });
      }
    }
    return { declineRows: declines, improveRows: improvements };
  }, [report.data, summaryRows, fleetAvgKmL]);

  return (
    <Grid>
      <Grid.Col span={12}>
        <SummaryCard rows={summaryRows} vehicleOptions={vehicleOptions} userLabel={userLabel} loading={report.isLoading} error={report.error} />
      </Grid.Col>
      <Grid.Col span={{ base: 12, lg: 6 }}>
        <DeclineCard rows={declineRows} vehicleOptions={vehicleOptions} userLabel={userLabel} loading={report.isLoading} />
      </Grid.Col>
      <Grid.Col span={{ base: 12, lg: 6 }}>
        <ImproveCard rows={improveRows} vehicleOptions={vehicleOptions} userLabel={userLabel} loading={report.isLoading} />
      </Grid.Col>
    </Grid>
  );
}

// ── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({ rows, vehicleOptions, userLabel, loading, error }: {
  rows: SummaryRow[];
  vehicleOptions: { label: string; value: string }[];
  userLabel: (id: string) => string;
  loading: boolean;
  error: unknown;
}) {
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("ALL");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (vehicleFilter !== "ALL" && r.vehicleId !== vehicleFilter) return false;
      if (q) {
        const driver = userLabel(r.driverUserId).toLowerCase();
        if (!r.vehicleNumber.toLowerCase().includes(q) && !driver.includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, vehicleFilter, userLabel]);

  const columns: Column<SummaryRow>[] = [
    { header: "Vehicle", emphasis: true, render: (r) => r.vehicleNumber },
    { header: "Driver", render: (r) => userLabel(r.driverUserId) },
    { header: "Avg km/L", align: "right", render: (r) => r.avgKmPerLitre.toFixed(2) },
    { header: "Total km", align: "right", render: (r) => r.totalKm.toFixed(0) },
    { header: "Total litres", align: "right", render: (r) => r.totalLitres.toFixed(1) },
    { header: "Fills", align: "right", render: (r) => r.readings },
  ];

  return (
    <OverviewCard
      title="Efficiency summary"
      description="Last 30 days — all vehicles fuel consumption summary"
      icon={<IconChartBar size={22} />}
      accent="blue"
      count={rows.length}
      toolbar={
        <TableToolbar
          search={{ value: search, onChange: setSearch, placeholder: "Search vehicle or driver…" }}
          filters={[{
            label: "Vehicle",
            value: vehicleFilter,
            onChange: setVehicleFilter,
            options: vehicleOptions,
          }]}
        />
      }
    >
      <DataTable<SummaryRow>
        data={filtered}
        columns={columns}
        rowKey={(r) => r.vehicleId}
        loading={loading}
        error={error}
        withCard={false}
        empty={<Text c="dimmed" p="md">No efficiency data for the last 30 days.</Text>}
      />
    </OverviewCard>
  );
}

// ── Decline card ──────────────────────────────────────────────────────────────

function DeclineCard({ rows, vehicleOptions, userLabel, loading }: {
  rows: FlagRow[];
  vehicleOptions: { label: string; value: string }[];
  userLabel: (id: string) => string;
  loading: boolean;
}) {
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("ALL");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (vehicleFilter !== "ALL" && r.vehicleId !== vehicleFilter) return false;
      if (q) {
        const driver = userLabel(r.driverUserId).toLowerCase();
        if (!r.vehicleNumber.toLowerCase().includes(q) && !driver.includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, vehicleFilter, userLabel]);

  const columns: Column<FlagRow>[] = [
    { header: "Vehicle", emphasis: true, render: (r) => r.vehicleNumber },
    { header: "Driver", render: (r) => userLabel(r.driverUserId) },
    { header: "Reason", render: (r) => r.type === "sharp-drop" ? "Sharp drop" : "Below fleet avg" },
    { header: "Current km/L", align: "right", render: (r) => r.currentKmL.toFixed(2) },
    { header: "Change", align: "right", render: (r) => <Badge color={r.changePct < -40 ? "red" : "orange"} variant="light" radius="sm">{r.changePct.toFixed(0)}%</Badge> },
  ];

  return (
    <OverviewCard
      title="High fuel consumption"
      icon={<IconTrendingDown size={22} />}
      accent="orange"
      count={rows.length}
      toolbar={
        <TableToolbar
          search={{ value: search, onChange: setSearch, placeholder: "Search vehicle or driver…" }}
          filters={[{
            label: "Vehicle",
            value: vehicleFilter,
            onChange: setVehicleFilter,
            options: vehicleOptions,
          }]}
        />
      }
    >
      <DataTable<FlagRow>
        data={filtered}
        columns={columns}
        rowKey={(r) => r.vehicleId + r.type}
        loading={loading}
        withCard={false}
        empty={<Text c="dimmed" p="md">No high-consumption vehicles in the last 30 days.</Text>}
      />
    </OverviewCard>
  );
}

// ── Improve card ──────────────────────────────────────────────────────────────

function ImproveCard({ rows, vehicleOptions, userLabel, loading }: {
  rows: FlagRow[];
  vehicleOptions: { label: string; value: string }[];
  userLabel: (id: string) => string;
  loading: boolean;
}) {
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("ALL");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (vehicleFilter !== "ALL" && r.vehicleId !== vehicleFilter) return false;
      if (q) {
        const driver = userLabel(r.driverUserId).toLowerCase();
        if (!r.vehicleNumber.toLowerCase().includes(q) && !driver.includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, vehicleFilter, userLabel]);

  const columns: Column<FlagRow>[] = [
    { header: "Vehicle", emphasis: true, render: (r) => r.vehicleNumber },
    { header: "Driver", render: (r) => userLabel(r.driverUserId) },
    { header: "Reason", render: (r) => r.type === "sharp-gain" ? "Improved fill" : "Above fleet avg" },
    { header: "Current km/L", align: "right", render: (r) => r.currentKmL.toFixed(2) },
    { header: "Change", align: "right", render: (r) => <Badge color={r.changePct > 40 ? "teal" : "green"} variant="light" radius="sm">+{r.changePct.toFixed(0)}%</Badge> },
  ];

  return (
    <OverviewCard
      title="Improved fuel efficiency"
      icon={<IconTrendingUp size={22} />}
      accent="teal"
      count={rows.length}
      toolbar={
        <TableToolbar
          search={{ value: search, onChange: setSearch, placeholder: "Search vehicle or driver…" }}
          filters={[{
            label: "Vehicle",
            value: vehicleFilter,
            onChange: setVehicleFilter,
            options: vehicleOptions,
          }]}
        />
      }
    >
      <DataTable<FlagRow>
        data={filtered}
        columns={columns}
        rowKey={(r) => r.vehicleId + r.type}
        loading={loading}
        withCard={false}
        empty={<Text c="dimmed" p="md">No improved vehicles in the last 30 days.</Text>}
      />
    </OverviewCard>
  );
}
