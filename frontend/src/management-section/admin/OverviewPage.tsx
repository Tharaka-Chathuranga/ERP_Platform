import { Button, Grid, Group, SimpleGrid, Text } from "@mantine/core";
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
import { useItemLabels } from "@core/hooks/useLookups";
import { getLowStockItems } from "@store/inventory/items.api";
import { getMovementSummary } from "@store/stock-movements/movements.api";
import { listDeviations } from "@store/defects/deviations.api";
import { listCountRequests } from "@store/count-adjustments/count-requests.api";
import { listReceivals } from "@store/goods-receiving/receiving.api";
import { getQaDefectSummary } from "@qa/qa.api";
import { DataTable } from "@ui/data/DataTable";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { StatCard } from "@ui/feedback/StatCard";
import { PageHeader } from "@ui/layout/PageHeader";
import type { LowStockItem } from "@core/types";
import { getDashboardSummary, getMovementTrend } from "./admin.api";
import { MovementTrendChart } from "./MovementTrendChart";
import { TopMoversChart } from "./TopMoversChart";

const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

// ── Admin ─────────────────────────────────────────────────────────────────────

function AdminOverview() {
  const itemLabel = useItemLabels();
  const summary = useQuery({ queryKey: qk.adminSummary(), queryFn: getDashboardSummary });
  const lowStock = useQuery({ queryKey: qk.lowStock(), queryFn: getLowStockItems });
  const trend = useQuery({ queryKey: qk.movementTrend(30), queryFn: () => getMovementTrend(30) });
  const topMovers = useQuery({ queryKey: qk.movementSummary(), queryFn: () => getMovementSummary(8) });
  const s = summary.data;

  return (
    <div>
      <PageHeader title="Admin overview" />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mb="lg">
        <StatCard label="Active items" value={s?.activeItemCount ?? 0} icon={<IconBuildingWarehouse size={22} />} color="brand" to="/store" />
        <StatCard label="Low stock" value={s?.lowStockItemCount ?? 0} icon={<IconAlertTriangle size={22} />} color="red" to="/warnings" hint="Below reorder level" />
        <StatCard label="Inventory value" value={s ? currency.format(s.totalInventoryValue) : "—"} icon={<IconCoin size={22} />} color="teal" />
        <StatCard label="Pending approvals" value={s?.pendingIssueApprovalCount ?? 0} icon={<IconPackageExport size={22} />} color="yellow" />
        <StatCard label="Open defects" value={s?.pendingDeviationCount ?? 0} icon={<IconBug size={22} />} color="grape" to="/defects" />
        <StatCard label="Count requests" value={s?.pendingCountAdjustmentCount ?? 0} icon={<IconClipboardCheck size={22} />} color="indigo" to="/count-requests" hint="Awaiting approval" />
      </SimpleGrid>

      <Grid mb="lg">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <MovementTrendChart data={trend.data ?? []} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <TopMoversChart data={topMovers.data ?? []} itemLabel={itemLabel} />
        </Grid.Col>
      </Grid>

      <Text fw={600} mb="sm">Low-stock items</Text>
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
  );
}

// ── Store keeper ──────────────────────────────────────────────────────────────

function StorekeeperOverview() {
  const navigate = useNavigate();
  const lowStock = useQuery({ queryKey: qk.lowStock(), queryFn: getLowStockItems });
  const openDefects = useQuery({ queryKey: qk.deviations("INCOMING"), queryFn: () => listDeviations("INCOMING") });
  const recentReceivals = useQuery({ queryKey: qk.receivals(), queryFn: () => listReceivals() });
  const pendingCounts = useQuery({ queryKey: qk.countRequests("PENDING"), queryFn: () => listCountRequests("PENDING") });

  return (
    <div>
      <PageHeader title="Overview" />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
        <StatCard label="Low stock items" value={lowStock.data?.length ?? 0} icon={<IconAlertHexagon size={22} />} color="red" to="/warnings" hint="Below reorder level" />
        <StatCard label="Pending count requests" value={pendingCounts.data?.length ?? 0} icon={<IconClipboardCheck size={22} />} color="indigo" to="/count-requests" />
        <StatCard label="Open defects" value={openDefects.data?.length ?? 0} icon={<IconAlertTriangle size={22} />} color="orange" to="/defects" />
        <StatCard label="Total receivals" value={recentReceivals.data?.totalElements ?? 0} icon={<IconPackageImport size={22} />} color="teal" to="/receiving" />
      </SimpleGrid>

      <Group mb="lg" wrap="wrap">
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

      <Text fw={600} mb="sm">Low-stock items</Text>
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
  );
}

// ── Quality assurance ─────────────────────────────────────────────────────────

function QualityAssuranceOverview() {
  const navigate = useNavigate();
  const summary = useQuery({ queryKey: qk.qaDefectSummary(), queryFn: getQaDefectSummary });
  const s = summary.data;

  return (
    <div>
      <PageHeader
        title="Quality assurance"
        actions={
          <Button onClick={() => navigate("/qa/defects")}>
            Review defects
          </Button>
        }
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        <StatCard label="Pending review" value={s?.pendingCount ?? 0} icon={<IconAlertTriangle size={22} />} color="yellow" to="/qa/defects" hint="Awaiting your decision" />
        <StatCard label="Approved" value={s?.approvedCount ?? 0} icon={<IconCheck size={22} />} color="green" />
        <StatCard label="Rejected" value={s?.rejectedCount ?? 0} icon={<IconX size={22} />} color="red" />
        <StatCard label="Incoming" value={s?.incomingCount ?? 0} icon={<IconBug size={22} />} color="grape" hint="Workflow stage" />
        <StatCard label="In progress" value={s?.inProgressCount ?? 0} icon={<IconArrowsExchange size={22} />} color="indigo" hint="Workflow stage" />
        <StatCard label="Final" value={s?.finalCount ?? 0} icon={<IconClipboardCheck size={22} />} color="teal" hint="Workflow stage" />
      </SimpleGrid>
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────

/** Renders a role-specific overview. Each role sees only the data relevant to their job. */
export function OverviewPage() {
  const { role } = useAuth();

  if (role === "QUALITY_ASSURANCE") return <QualityAssuranceOverview />;
  if (role === "STORE_KEEPER") return <StorekeeperOverview />;

  return <AdminOverview />;
}
