import { SimpleGrid } from "@mantine/core";
import { IconAlertTriangle, IconCoin } from "@tabler/icons-react";
import { StatCard } from "@ui/feedback/StatCard";
import { formatMoney } from "../../../../components/money-text";

interface OilMartStockStatsProps {
  stockValue: number;
  lowCount: number;
  lowOnly: boolean;
  onShowLowOnly: () => void;
}

export function OilMartStockStats({
  stockValue,
  lowCount,
  lowOnly,
  onShowLowOnly,
}: OilMartStockStatsProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }}>
      <StatCard
        label="Stock value"
        value={`PGK ${formatMoney(stockValue)}`}
        icon={<IconCoin size={24} />}
        color="teal"
        hint="At current buy price"
      />
      <StatCard
        label="Below reorder level"
        value={lowCount}
        icon={<IconAlertTriangle size={24} />}
        color="red"
        onClick={lowCount > 0 && !lowOnly ? onShowLowOnly : undefined}
        hint={lowCount > 0 && !lowOnly ? "Show only these" : "Oils to restock"}
      />
    </SimpleGrid>
  );
}
