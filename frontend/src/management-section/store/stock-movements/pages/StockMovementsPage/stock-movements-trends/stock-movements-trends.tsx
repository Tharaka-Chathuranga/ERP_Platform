import { Grid } from "@mantine/core";
import { AreaChart, BarChart } from "@mantine/charts";
import { EmptyState } from "@ui/feedback/EmptyState";
import { SectionCard } from "../../../components/MovementCards";
import type { MovementStats } from "../../../utils/movementStats";

interface StockMovementsTrendsProps {
  stats: MovementStats;
  byItemChart: { item: string; In: number; Out: number }[];
  periodLabel: string;
}

export function StockMovementsTrends({ stats, byItemChart, periodLabel }: StockMovementsTrendsProps) {
  return (
    <Grid mb="lg">
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
  );
}
