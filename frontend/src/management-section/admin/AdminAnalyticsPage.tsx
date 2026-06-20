import { Grid, SimpleGrid, Text } from "@mantine/core";
import {
  IconAlertTriangle,
  IconBug,
  IconBuildingWarehouse,
  IconCoin,
  IconClipboardCheck,
  IconPackageExport,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useItemLabels } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { getLowStockItems } from "@store/inventory/items.api";
import { getMovementSummary } from "@store/stock-movements/movements.api";
import { DataTable } from "@ui/data/DataTable";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { StatCard } from "@ui/feedback/StatCard";
import { PageHeader } from "@ui/layout/PageHeader";
import type { LowStockItem } from "@core/types";
import { getDashboardSummary, getMovementTrend } from "./admin.api";
import { MovementTrendChart } from "./MovementTrendChart";
import { TopMoversChart } from "./TopMoversChart";

const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" });

export function AdminAnalyticsPage() {
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
        <StatCard
          label="Active items"
          value={s?.activeItemCount ?? 0}
          icon={<IconBuildingWarehouse size={22} />}
          color="brand"
          to="/store"
        />
        <StatCard
          label="Low stock"
          value={s?.lowStockItemCount ?? 0}
          icon={<IconAlertTriangle size={22} />}
          color="red"
          to="/warnings"
          hint="Below reorder level"
        />
        <StatCard
          label="Inventory value"
          value={s ? currency.format(s.totalInventoryValue) : "—"}
          icon={<IconCoin size={22} />}
          color="teal"
        />
        <StatCard
          label="Pending approvals"
          value={s?.pendingIssueApprovalCount ?? 0}
          icon={<IconPackageExport size={22} />}
          color="yellow"
        />
        <StatCard
          label="Open defects"
          value={s?.pendingDeviationCount ?? 0}
          icon={<IconBug size={22} />}
          color="grape"
          to="/defects"
        />
        <StatCard
          label="Count requests"
          value={s?.pendingCountAdjustmentCount ?? 0}
          icon={<IconClipboardCheck size={22} />}
          color="indigo"
          to="/count-requests"
          hint="Awaiting approval"
        />
      </SimpleGrid>

      <Grid mb="lg">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <MovementTrendChart data={trend.data ?? []} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 5 }}>
          <TopMoversChart data={topMovers.data ?? []} itemLabel={itemLabel} />
        </Grid.Col>
      </Grid>

      <Text fw={600} mb="sm">
        Low-stock items
      </Text>
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
          {
            header: "Flag",
            render: (r) => (r.criticalItem ? <StatusBadge status="CRITICAL" /> : null),
          },
        ]}
      />
    </div>
  );
}
