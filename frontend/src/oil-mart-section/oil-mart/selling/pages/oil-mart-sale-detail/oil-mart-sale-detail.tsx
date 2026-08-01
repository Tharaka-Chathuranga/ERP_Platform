import { Anchor, Breadcrumbs, Card } from "@mantine/core";
import { Link } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { OilMartSaleProgress } from "../../components/oil-mart-sale-progress";
import { useOilMartSaleDetail } from "./hooks/use-oil-mart-sale-detail";
import { OilMartSaleDetailCard } from "./oil-mart-sale-detail-card";
import { SaleStageActions } from "./sale-stage-actions";
import { ApproveSaleModal } from "./approve-sale-modal";
import { RejectSaleModal } from "./reject-sale-modal";
import { DispatchModal } from "./dispatch-modal";
import { InvoiceModal } from "./invoice-modal";

export function OilMartSaleDetailPage() {
  const {
    saleQuery,
    stockQuery,
    modal,
    setModal,
    busy,
    confirmOrder,
    approve,
    reject,
    dispatch,
    invoice,
    cancel,
  } = useOilMartSaleDetail();

  const sale = saleQuery.data;

  return (
    <div>
      <Breadcrumbs mb="sm">
        <Anchor component={Link} to="/oil-mart/sales" size="sm">
          Sales
        </Anchor>
        <Anchor size="sm" c="dimmed">
          {sale?.saleNo ?? "…"}
        </Anchor>
      </Breadcrumbs>

      <PageHeader title={sale?.saleNo ?? "Sale"} />

      <QueryBoundary loading={saleQuery.isLoading} error={saleQuery.error}>
        {sale && (
          <>
            <Card withBorder radius="md" padding="lg" mb="lg">
              <OilMartSaleProgress status={sale.status} />
            </Card>

            <SaleStageActions
              sale={sale}
              busy={busy}
              onConfirmOrder={() => confirmOrder.mutate()}
              onApprove={() => setModal("approve")}
              onReject={() => setModal("reject")}
              onDispatch={() => setModal("dispatch")}
              onInvoice={() => setModal("invoice")}
              onCancel={() => cancel.mutate("Cancelled by the oil mart assistant")}
            />

            <OilMartSaleDetailCard sale={sale} />

            <ApproveSaleModal
              opened={modal === "approve"}
              sale={sale}
              submitting={approve.isPending}
              onClose={() => setModal(null)}
              onSubmit={() => approve.mutate()}
            />

            <RejectSaleModal
              opened={modal === "reject"}
              saleNo={sale.saleNo}
              submitting={reject.isPending}
              onClose={() => setModal(null)}
              onSubmit={(reason) => reject.mutate(reason)}
            />

            <DispatchModal
              opened={modal === "dispatch"}
              sale={sale}
              stock={stockQuery.data}
              submitting={dispatch.isPending}
              onClose={() => setModal(null)}
              onSubmit={(values) => dispatch.mutate(values)}
            />

            <InvoiceModal
              opened={modal === "invoice"}
              sale={sale}
              submitting={invoice.isPending}
              onClose={() => setModal(null)}
              onSubmit={(paymentMethod) => invoice.mutate(paymentMethod)}
            />
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
