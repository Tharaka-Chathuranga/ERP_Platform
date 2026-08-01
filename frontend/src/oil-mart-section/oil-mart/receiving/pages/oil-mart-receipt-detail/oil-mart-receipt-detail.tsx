import { useMemo } from "react";
import { Anchor, Breadcrumbs } from "@mantine/core";
import { Link } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { useOilMartReceiptDetail } from "./hooks/use-oil-mart-receipt-detail";
import { OilMartReceiptSummaryCard } from "./oil-mart-receipt-summary-card";
import { OilMartReceiptLines } from "./oil-mart-receipt-lines";
import { OilMartReceiptMovements } from "./oil-mart-receipt-movements";

export function OilMartReceiptDetailPage() {
  const { receiptQuery, movementsQuery } = useOilMartReceiptDetail();

  const itemNameById = useMemo(
    () => new Map((receiptQuery.data?.lines ?? []).map((line) => [line.itemId, line.itemName])),
    [receiptQuery.data],
  );

  return (
    <div>
      <Breadcrumbs mb="sm">
        <Anchor component={Link} to="/oil-mart/receipts" size="sm">
          Oil receipts
        </Anchor>
        <Anchor size="sm" c="dimmed">
          {receiptQuery.data?.receiptNo ?? "…"}
        </Anchor>
      </Breadcrumbs>

      <PageHeader title={receiptQuery.data?.receiptNo ?? "Receipt"} />

      <QueryBoundary loading={receiptQuery.isLoading} error={receiptQuery.error}>
        {receiptQuery.data && (
          <>
            <OilMartReceiptSummaryCard receipt={receiptQuery.data} />
            <OilMartReceiptLines lines={receiptQuery.data.lines} />
            <OilMartReceiptMovements
              movements={movementsQuery.data ?? []}
              itemNameById={itemNameById}
              loading={movementsQuery.isLoading}
              error={movementsQuery.error}
            />
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
