import { Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { EmptyState } from "@ui/feedback/EmptyState";
import { MovementLogNavCard } from "../../components/MovementCards";
import { useStockMovements } from "./hooks/use-stock-movements";
import { StockMovementsToolbar } from "./stock-movements-toolbar";
import { StockMovementsKpis } from "./stock-movements-kpis";
import { StockMovementsTopItems } from "./stock-movements-top-items";
import { StockMovementsTrends } from "./stock-movements-trends";

export function StockMovementsPage() {
  const {
    itemCode,
    period,
    setPeriod,
    all,
    stats,
    topMoved,
    topCritical,
    byItemChart,
    total,
    fetched,
    truncated,
    periodLabel,
  } = useStockMovements();

  return (
    <div>
      <PageHeader title="Stock Movements" />
      <StockMovementsToolbar period={period} onPeriodChange={setPeriod} />

      {truncated && (
        <Alert
          color="yellow"
          variant="light"
          radius="md"
          icon={<IconInfoCircle size={18} />}
          mb="lg"
        >
          Showing the latest {fetched.toLocaleString()} of {total.toLocaleString()} movements.
          Stats reflect that slice.
        </Alert>
      )}

      <QueryBoundary
        loading={all.isLoading}
        error={all.error}
        isEmpty={stats.totals.count === 0}
        empty={<EmptyState title={`No movements ${periodLabel}`} description="Receiving and issuing stock records movements here." />}
      >
        <StockMovementsKpis stats={stats} />

        <StockMovementsTopItems topMoved={topMoved} topCritical={topCritical} itemCode={itemCode} />

        <StockMovementsTrends stats={stats} byItemChart={byItemChart} periodLabel={periodLabel} />

        <MovementLogNavCard to="/movements/detail" count={total} />
      </QueryBoundary>
    </div>
  );
}
