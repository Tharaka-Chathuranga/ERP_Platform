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

/** Always today's figures — the trend below is where other periods are explored. */
export function OilMartOverviewStats({ overview }: { overview: OilMartOverview }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
      <StatCard
        label="Stock value"
        value={`PGK ${formatMoney(overview.stockValue)}`}
        icon={<IconCoin size={24} />}
        color="teal"
        to="/oil-mart/stock"
        hint="At current buy price"
      />
      <StatCard
        label="Sales today"
        value={`PGK ${formatMoney(overview.salesThisPeriod)}`}
        icon={<IconReceipt size={24} />}
        color="green"
        to="/oil-mart/invoices"
        hint={`${overview.saleCountThisPeriod} invoice${
          overview.saleCountThisPeriod === 1 ? "" : "s"
        } approved today`}
      />
      <StatCard
        label="Awaiting approval"
        value={overview.awaitingApproval}
        icon={<IconClipboardList size={24} />}
        color="yellow"
        to="/oil-mart/quotations"
        hint="Quotations & invoices needing a manager"
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
