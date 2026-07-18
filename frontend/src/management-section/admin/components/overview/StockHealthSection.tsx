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
import { getStockHealth } from "../../api";
import { StockItemsCard } from "./StockItemsCard";

export function StockHealthSection() {
  const health = useQuery({ queryKey: qk.stockHealth(), queryFn: getStockHealth });
  const h = health.data;
  const loading = health.isLoading;
  const error = health.error;

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2 }}>
        <StatCard label="Critical items" value={h?.criticalCount ?? 0} icon={<IconShieldCheck size={22} />} color="grape" hint="Flagged critical" />
        <StatCard label="Normal items" value={h?.normalCount ?? 0} icon={<IconCircleCheck size={22} />} color="teal" hint="Healthy stock" />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <StockItemsCard
            title="Critical warning items"
            icon={<IconAlertHexagon size={22} />}
            accent="red"
            items={h?.criticalWarningItems}
            total={h?.criticalWarningCount ?? 0}
            loading={loading}
            error={error}
            emptyText="No critical items below reorder — all good."
            filterByStockLevel={false}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <StockItemsCard
            title="Warning items"
            icon={<IconAlertTriangle size={22} />}
            accent="orange"
            items={h?.warningItems}
            total={h?.warningCount ?? 0}
            loading={loading}
            error={error}
            emptyText="Nothing below reorder level."
            filterByStockLevel={false}
          />
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <StockItemsCard
            title="Critical items"
            icon={<IconShieldCheck size={22} />}
            accent="grape"
            items={h?.criticalItems}
            total={h?.criticalCount ?? 0}
            loading={loading}
            error={error}
            emptyText="No items flagged critical."
            showPrice
            showStatus={false}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <StockItemsCard
            title="Normal items"
            icon={<IconCircleCheck size={22} />}
            accent="teal"
            items={h?.normalItems}
            total={h?.normalCount ?? 0}
            loading={loading}
            error={error}
            emptyText="No items at healthy stock levels."
            showPrice
            showStatus={false}
          />
        </Grid.Col>
      </Grid>
    </>
  );
}
