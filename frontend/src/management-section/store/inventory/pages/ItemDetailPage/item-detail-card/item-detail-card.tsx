import { Card } from "@mantine/core";
import type { Item } from "@core/types";
import { StockPanel } from "../../../components/StockPanel";

interface ItemDetailCardProps {
  item: Item;
}

export function ItemDetailCard({ item }: ItemDetailCardProps) {
  return (
    <Card withBorder radius="md" padding="lg">
      <StockPanel item={item} />
    </Card>
  );
}
