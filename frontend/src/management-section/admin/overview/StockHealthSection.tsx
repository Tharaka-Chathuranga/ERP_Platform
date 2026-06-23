import { Grid, SimpleGrid } from "@mantine/core";
import {
  IconAlertHexagon,
  IconAlertTriangle,
  IconCircleCheck,
  IconShieldCheck,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/queryKeys";
import { StatCard } from "@ui/feedback/StatCard";
import { getStockHealth } from "../admin.api";
import { StockItemsCard } from "./StockItemsCard";

/**
 * Owns the single stock-health query and lays out the four buckets: the
 * critical-warning list (most urgent, full width) followed by warning,
 * critical and normal lists, with headline counts on top.
 */
export function StockHealthSection() {
  const health = useQuery({ queryKey: qk.stockHealth(), queryFn: getStockHealth });
  const h = health.data;
  const loading = health.isLoading;
  const error = health.error;

  return (
    <>
      <SimpleGrid cols={{ base: 2, lg: 4 }}>
        <StatCard label="Critical warnings" value={h?.criticalWarningCount ?? 0} icon={<IconAlertHexagon size={22} />} color="red" hint="Critical & below reorder" />
        <StatCard label="Warning items" value={h?.warningCount ?? 0} icon={<IconAlertTriangle size={22} />} color="orange" hint="Below reorder level" />
        <StatCard label="Critical items" value={h?.criticalCount ?? 0} icon={<IconShieldCheck size={22} />} color="grape" hint="Flagged critical" />
        <StatCard label="Normal items" value={h?.normalCount ?? 0} icon={<IconCircleCheck size={22} />} color="teal" hint="Healthy stock" />
      </SimpleGrid>

      <StockItemsCard
        title="Critical warning items"
        description="Flagged critical and below reorder — act first"
        icon={<IconAlertHexagon size={22} />}
        accent="red"
        items={h?.criticalWarningItems}
        total={h?.criticalWarningCount ?? 0}
        loading={loading}
        error={error}
        emptyText="No critical items below reorder — all good."
      />

      <Grid>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <StockItemsCard
            title="Warning items"
            description="On hand below reorder level"
            icon={<IconAlertTriangle size={22} />}
            accent="orange"
            items={h?.warningItems}
            total={h?.warningCount ?? 0}
            loading={loading}
            error={error}
            emptyText="Nothing below reorder level."
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <StockItemsCard
            title="Critical items"
            description="Flagged critical, lowest stock first"
            icon={<IconShieldCheck size={22} />}
            accent="grape"
            items={h?.criticalItems}
            total={h?.criticalCount ?? 0}
            loading={loading}
            error={error}
            emptyText="No items flagged critical."
            showPrice
          />
        </Grid.Col>
      </Grid>

      <StockItemsCard
        title="Normal items"
        description="Healthy stock at or above reorder level"
        icon={<IconCircleCheck size={22} />}
        accent="teal"
        items={h?.normalItems}
        total={h?.normalCount ?? 0}
        loading={loading}
        error={error}
        emptyText="No items at healthy stock levels."
        showPrice
      />
    </>
  );
}
