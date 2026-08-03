import { SimpleGrid } from "@mantine/core";
import { TopItemsCard } from "../../../components/MovementCards";
import type { ItemMovement } from "../../../utils/movementStats";

interface StockMovementsTopItemsProps {
  topMoved: ItemMovement[];
  topCritical: ItemMovement[];
  itemCode: (id: string) => string;
}

export function StockMovementsTopItems({ topMoved, topCritical, itemCode }: StockMovementsTopItemsProps) {
  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} mb="lg">
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
    </SimpleGrid>
  );
}
