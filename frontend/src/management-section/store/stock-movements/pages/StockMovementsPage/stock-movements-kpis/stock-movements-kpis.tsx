import { SimpleGrid } from "@mantine/core";
import {
  IconArrowsExchange,
  IconPackageExport,
  IconPackageImport,
  IconTrendingUp,
} from "@tabler/icons-react";
import { StatCard } from "@ui/feedback/StatCard";
import type { MovementStats } from "../../../utils/movementStats";

const fmt = (n: number) => n.toLocaleString();

interface StockMovementsKpisProps {
  stats: MovementStats;
}

export function StockMovementsKpis({ stats }: StockMovementsKpisProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
      <StatCard
        label="Movements"
        value={fmt(stats.totals.count)}
        icon={<IconArrowsExchange size={22} />}
        color="brand"
        hint={`${fmt(stats.totals.itemsMoved)} items moved`}
      />
      <StatCard
        label="Total in"
        value={fmt(stats.totals.in)}
        icon={<IconPackageImport size={22} />}
        color="teal"
      />
      <StatCard
        label="Total out"
        value={fmt(stats.totals.out)}
        icon={<IconPackageExport size={22} />}
        color="red"
      />
      <StatCard
        label="Net change"
        value={`${stats.totals.net > 0 ? "+" : ""}${fmt(stats.totals.net)}`}
        icon={<IconTrendingUp size={22} />}
        color={stats.totals.net >= 0 ? "teal" : "red"}
      />
    </SimpleGrid>
  );
}
