import { Button, Divider, Grid, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import {
  IconAlertHexagon,
  IconAlertTriangle,
  IconArrowsExchange,
  IconBug,
  IconBuildingWarehouse,
  IconCheck,
  IconClipboardCheck,
  IconCoin,
  IconPackageExport,
  IconPackageImport,
  IconX,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@auth/AuthContext";
import { qk } from "@core/queryKeys";
import { useItemCodes } from "@core/hooks/useLookups";
import { getLowStockItems } from "@store/inventory/items.api";
import { getMovementSummary } from "@store/stock-movements/movements.api";
import { listDeviations } from "@store/defects/deviations.api";
import { listCountRequests } from "@store/count-adjustments/count-requests.api";
import { listReceivals } from "@store/goods-receiving/receiving.api";
import { getQaDefectSummary } from "@qa/qa.api";
import { DataTable } from "@ui/data/DataTable";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { StatCard } from "@ui/feedback/StatCard";
import type { LowStockItem } from "@core/types";
import { getDashboardSummary, getMovementTrend } from "./admin.api";
import { MovementTrendChart } from "./MovementTrendChart";
import { TopMoversChart } from "./TopMoversChart";
import { FuelEfficiencySection, FuelOverviewSection, FuelTankCapacitySection, StockHealthSection, TodayIssuesCard, TodayReceivalsCard } from "./overview";

const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

const WELCOME_BANNER_STYLE = {
  background: "linear-gradient(135deg, light-dark(var(--mantine-color-brand-0), var(--mantine-color-dark-6)) 0%, light-dark(white, var(--mantine-color-dark-8)) 70%)",
  borderColor: "var(--mantine-color-default-border)",
} as const;

// ── Admin ─────────────────────────────────────────────────────────────────────

function AdminOverview() {
  const { username } = useAuth();
  const itemCode = useItemCodes();
  const summary = useQuery({ queryKey: qk.adminSummary(), queryFn: getDashboardSummary });
  const trend = useQuery({ queryKey: qk.movementTrend(30), queryFn: () => getMovementTrend(30) });
  const topMovers = useQuery({ queryKey: qk.movementSummary(), queryFn: () => getMovementSummary(8, 30) });
  const s = summary.data;

  return (
    <Stack gap="xl">

      <Paper p="xl" radius="md" withBorder style={WELCOME_BANNER_STYLE}>
        <Title order={2} fw={700} mb={4}>
          👋 Welcome back, {username}
        </Title>
        <Text c="dimmed" fz="sm">
          Here is your inventory overview for today.
        </Text>
      </Paper>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        <StatCard label="Active items" value={s?.activeItemCount ?? 0} icon={<IconBuildingWarehouse size={22} />} color="brand" to="/store" />
        <StatCard label="Low stock" value={s?.lowStockItemCount ?? 0} icon={<IconAlertTriangle size={22} />} color="red" to="/warnings" hint="Below reorder level" />
        <StatCard label="Inventory value" value={s ? currency.format(s.totalInventoryValue) : "—"} icon={<IconCoin size={22} />} color="teal" />
        <StatCard label="Pending approvals" value={s?.pendingIssueApprovalCount ?? 0} icon={<IconPackageExport size={22} />} color="yellow" />
        <StatCard label="Open defects" value={s?.pendingDeviationCount ?? 0} icon={<IconBug size={22} />} color="grape" to="/defects" />
        <StatCard label="Count requests" value={s?.pendingCountAdjustmentCount ?? 0} icon={<IconClipboardCheck size={22} />} color="indigo" to="/count-requests" hint="Awaiting approval" />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <MovementTrendChart data={trend.data ?? []} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <TopMoversChart data={topMovers.data ?? []} itemLabel={itemCode} />
        </Grid.Col>
      </Grid>

      <div>
        <Divider
          label={
            <Text fw={600} fz="xs" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
              Today's movements
            </Text>
          }
          labelPosition="left"
          mb="md"
        />
        <Grid>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <TodayReceivalsCard />
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <TodayIssuesCard />
          </Grid.Col>
        </Grid>
      </div>

      <div>
        <Divider
          label={
            <Text fw={600} fz="xs" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
              Fuel
            </Text>
          }
          labelPosition="left"
          mb="md"
        />
        <Stack gap="lg">
          <FuelOverviewSection />
          <FuelTankCapacitySection />
          <FuelEfficiencySection />
        </Stack>
      </div>

      <div>
        <Divider
          label={
            <Text fw={600} fz="xs" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
              Stock health
            </Text>
          }
          labelPosition="left"
          mb="md"
        />
        <Stack gap="lg">
          <StockHealthSection />
        </Stack>
      </div>
    </Stack>
  );
}

// ── Store keeper ──────────────────────────────────────────────────────────────

function StorekeeperOverview() {
  const navigate = useNavigate();
  const { username } = useAuth();
  const lowStock = useQuery({ queryKey: qk.lowStock(), queryFn: getLowStockItems });
  const openDefects = useQuery({ queryKey: qk.deviations("INCOMING"), queryFn: () => listDeviations("INCOMING") });
  const recentReceivals = useQuery({ queryKey: qk.receivals(), queryFn: () => listReceivals() });
  const pendingCounts = useQuery({ queryKey: qk.countRequests("PENDING"), queryFn: () => listCountRequests("PENDING") });

  return (
    <Stack gap="xl">

      <Paper p="xl" radius="md" withBorder style={WELCOME_BANNER_STYLE}>
        <Title order={2} fw={700} mb={4}>
          👋 Welcome back, {username}
        </Title>
        <Text c="dimmed" fz="sm">
          Manage stock, receivals, and defect reports from here.
        </Text>
      </Paper>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatCard label="Low stock items" value={lowStock.data?.length ?? 0} icon={<IconAlertHexagon size={22} />} color="red" to="/warnings" hint="Below reorder level" />
        <StatCard label="Pending count requests" value={pendingCounts.data?.length ?? 0} icon={<IconClipboardCheck size={22} />} color="indigo" to="/count-requests" />
        <StatCard label="Open defects" value={openDefects.data?.length ?? 0} icon={<IconAlertTriangle size={22} />} color="orange" to="/defects" />
        <StatCard label="Total receivals" value={recentReceivals.data?.totalElements ?? 0} icon={<IconPackageImport size={22} />} color="teal" to="/receiving" />
      </SimpleGrid>

      <Paper p="lg" radius="md" withBorder>
        <Text fw={600} fz="xs" tt="uppercase" c="dimmed" mb="md" style={{ letterSpacing: "0.05em" }}>
          Quick actions
        </Text>
        <Group wrap="wrap">
          <Button leftSection={<IconPackageImport size={16} />} onClick={() => navigate("/receiving/new")}>
            New receival
          </Button>
          <Button leftSection={<IconPackageExport size={16} />} variant="light" onClick={() => navigate("/issuing/new")}>
            Issue goods
          </Button>
          <Button leftSection={<IconAlertTriangle size={16} />} variant="light" color="red" onClick={() => navigate("/defects/new")}>
            Report defect
          </Button>
        </Group>
      </Paper>

      <div>
        <Divider
          label={
            <Text fw={600} fz="xs" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
              Low-stock items
            </Text>
          }
          labelPosition="left"
          mb="md"
        />
        <DataTable<LowStockItem>
          data={lowStock.data}
          loading={lowStock.isLoading}
          error={lowStock.error}
          rowKey={(r) => r.itemId}
          empty={<Text c="dimmed" p="md">Nothing below reorder level — all good.</Text>}
          columns={[
            { header: "Code", render: (r) => r.itemCode, emphasis: true },
            { header: "Name", render: (r) => r.name },
            { header: "On hand", render: (r) => `${r.quantityOnHand} ${r.unitOfMeasure}`, align: "right" },
            { header: "Reorder", render: (r) => r.reorderLevel, align: "right" },
            { header: "Flag", render: (r) => (r.criticalItem ? <StatusBadge status="CRITICAL" /> : null) },
          ]}
        />
      </div>
    </Stack>
  );
}

// ── Quality assurance ─────────────────────────────────────────────────────────

function QualityAssuranceOverview() {
  const navigate = useNavigate();
  const { username } = useAuth();
  const summary = useQuery({ queryKey: qk.qaDefectSummary(), queryFn: getQaDefectSummary });
  const s = summary.data;

  return (
    <Stack gap="xl">

      <Paper p="xl" radius="md" withBorder style={WELCOME_BANNER_STYLE}>
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
          <div>
            <Title order={2} fw={700} mb={4}>
              👋 Welcome back, {username}
            </Title>
            <Text c="dimmed" fz="sm">
              Review and action incoming defect reports.
            </Text>
          </div>
          <Button onClick={() => navigate("/qa/defects")}>Review defects</Button>
        </Group>
      </Paper>

      <div>
        <Divider
          label={
            <Text fw={600} fz="xs" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
              Outcomes
            </Text>
          }
          labelPosition="left"
          mb="md"
        />
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <StatCard label="Pending review" value={s?.pendingCount ?? 0} icon={<IconAlertTriangle size={22} />} color="yellow" to="/qa/defects" hint="Awaiting your decision" />
          <StatCard label="Approved" value={s?.approvedCount ?? 0} icon={<IconCheck size={22} />} color="green" />
          <StatCard label="Rejected" value={s?.rejectedCount ?? 0} icon={<IconX size={22} />} color="red" />
        </SimpleGrid>
      </div>

      <div>
        <Divider
          label={
            <Text fw={600} fz="xs" tt="uppercase" style={{ letterSpacing: "0.05em" }}>
              Pipeline stages
            </Text>
          }
          labelPosition="left"
          mb="md"
        />
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <StatCard label="Incoming" value={s?.incomingCount ?? 0} icon={<IconBug size={22} />} color="grape" hint="Workflow stage" />
          <StatCard label="In progress" value={s?.inProgressCount ?? 0} icon={<IconArrowsExchange size={22} />} color="indigo" hint="Workflow stage" />
          <StatCard label="Final" value={s?.finalCount ?? 0} icon={<IconClipboardCheck size={22} />} color="teal" hint="Workflow stage" />
        </SimpleGrid>
      </div>
    </Stack>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────

export function OverviewPage() {
  const { role } = useAuth();

  if (role === "QUALITY_ASSURANCE") return <QualityAssuranceOverview />;
  if (role === "STORE_KEEPER") return <StorekeeperOverview />;

  return <AdminOverview />;
}
