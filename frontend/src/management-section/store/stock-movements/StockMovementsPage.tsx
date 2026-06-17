import { useMemo, useState } from "react";
import { Alert, Grid, Group, SegmentedControl, SimpleGrid } from "@mantine/core";
import { AreaChart, BarChart } from "@mantine/charts";
import { IconInfoCircle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { EmptyState } from "@ui/feedback/EmptyState";
import { useCriticalItems, useItemCodes } from "@core/hooks/useLookups";
import { qk } from "@core/queryKeys";
import { listMovements } from "./movements.api";
import {
  computeMovementStats,
  criticalItems,
  inPeriod,
  type Period,
} from "./movementStats";
import { MovementLogNavCard, SectionCard, SummaryCard, TopItemsCard } from "./MovementCards";

const PERIODS: { label: string; value: Period }[] = [
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
];

export function StockMovementsPage() {
  const itemCode = useItemCodes();
  const isCritical = useCriticalItems();
  const [period, setPeriod] = useState<Period>("week");

  const all = useQuery({ queryKey: qk.allMovements(), queryFn: listMovements });

  const rows = useMemo(() => inPeriod(all.data?.content ?? [], period), [all.data, period]);
  const stats = useMemo(() => computeMovementStats(rows), [rows]);
  const topMoved = stats.byItem.slice(0, 5);
  const topCritical = useMemo(
    () => criticalItems(stats.byItem, isCritical).slice(0, 5),
    [stats.byItem, isCritical],
  );

  const byItemChart = stats.byItem
    .slice(0, 12)
    .map((i) => ({ item: itemCode(i.itemId), In: i.in, Out: i.out }));

  // Did we only fetch a slice of a larger ledger?
  const total = all.data?.totalElements ?? 0;
  const fetched = all.data?.content.length ?? 0;
  const truncated = total > fetched;

  const periodLabel = period === "week" ? "this week" : "this month";

  return (
    <div>
      <Group justify="space-between" align="center" mb="md" wrap="wrap">
        <PageHeader title="Stock Movements" />
        <SegmentedControl
          value={period}
          onChange={(v) => setPeriod(v as Period)}
          data={PERIODS}
        />
      </Group>

      {truncated && (
        <Alert
          color="yellow"
          variant="light"
          radius="md"
          icon={<IconInfoCircle size={18} />}
          mb="md"
        >
          Showing the latest {fetched.toLocaleString()} of {total.toLocaleString()} movements.
          Stats reflect that slice.
        </Alert>
      )}

      {/* SECTION 1 — Overview cards */}
      <QueryBoundary
        loading={all.isLoading}
        error={all.error}
        isEmpty={stats.totals.count === 0}
        empty={<EmptyState title={`No movements ${periodLabel}`} description="Receiving and issuing stock records movements here." />}
      >
        <SimpleGrid cols={{ base: 1, lg: 3 }} mb="xl">
          <TopItemsCard
            title="Top 5 moved items"
            subtitle="Busiest items — critical or not."
            rows={topMoved}
            itemCode={itemCode}
            emptyTitle="No movement yet"
          />
          <TopItemsCard
            title="Top 5 critical items"
            subtitle="Flagged-critical items, most drained first (out/in)."
            rows={topCritical}
            itemCode={itemCode}
            emptyTitle="No critical items moved"
          />
          <SummaryCard totals={stats.totals} />
        </SimpleGrid>

        {/* SECTION 2 — Trends */}
        <Grid mb="xl">
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <SectionCard title="In vs out over time" subtitle={`Daily inflow and outflow, ${periodLabel}.`}>
              {stats.byDay.length === 0 ? (
                <EmptyState title="No movement data yet" />
              ) : (
                <AreaChart
                  h={300}
                  data={stats.byDay}
                  dataKey="date"
                  series={[
                    { name: "In", color: "teal.6" },
                    { name: "Out", color: "red.6" },
                  ]}
                  curveType="monotone"
                  withLegend
                />
              )}
            </SectionCard>
          </Grid.Col>
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <SectionCard title="In vs out by item" subtitle="Busiest items first — all movement types.">
              {byItemChart.length === 0 ? (
                <EmptyState title="No movement data yet" />
              ) : (
                <BarChart
                  h={300}
                  data={byItemChart}
                  dataKey="item"
                  series={[
                    { name: "In", color: "teal.6" },
                    { name: "Out", color: "red.6" },
                  ]}
                  tickLine="y"
                  withLegend
                />
              )}
            </SectionCard>
          </Grid.Col>
        </Grid>

        {/* SECTION 3 — Detail log (own page) */}
        <MovementLogNavCard to="/movements/detail" count={total} />
      </QueryBoundary>
    </div>
  );
}
