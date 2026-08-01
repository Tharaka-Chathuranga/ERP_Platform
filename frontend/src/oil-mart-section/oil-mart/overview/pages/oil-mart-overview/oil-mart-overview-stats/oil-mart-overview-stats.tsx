import { SimpleGrid } from "@mantine/core";
import {
  IconAlertTriangle,
  IconClipboardList,
  IconCoin,
  IconReceipt,
} from "@tabler/icons-react";
import { StatCard } from "@ui/feedback/StatCard";
import type { OilMartOverview } from "@core/types";
import { formatMoney } from "../../../../components/money-text";

export function OilMartOverviewStats({ overview }: { overview: OilMartOverview }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="lg">
      <StatCard
        label="Stock value"
        value={`Rs ${formatMoney(overview.stockValue)}`}
        icon={<IconCoin size={24} />}
        color="teal"
        to="/oil-mart/stock"
        hint="At current buy price"
      />
      <StatCard
        label="Sales this period"
        value={`Rs ${formatMoney(overview.salesThisPeriod)}`}
        icon={<IconReceipt size={24} />}
        color="green"
        to="/oil-mart/sales"
        hint={`${overview.saleCountThisPeriod} sales`}
      />
      <StatCard
        label="Awaiting approval"
        value={overview.awaitingApproval}
        icon={<IconClipboardList size={24} />}
        color="yellow"
        to="/oil-mart/sales"
        hint="Orders needing a manager"
      />
      <StatCard
        label="Below reorder level"
        value={overview.lowStockCount}
        icon={<IconAlertTriangle size={24} />}
        color="red"
        to="/oil-mart/stock"
        hint="Oils to restock"
      />
    </SimpleGrid>
  );
}
