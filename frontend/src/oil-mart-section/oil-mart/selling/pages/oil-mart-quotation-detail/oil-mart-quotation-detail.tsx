import { Anchor, Breadcrumbs } from "@mantine/core";
import { Link } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { useCan } from "@auth/useCan";
import { OILMART_SALE_APPROVE, OILMART_SALE_CREATE } from "@auth/permissions";
import {
  ApproveDocumentModal,
  PdfPreviewModal,
  RejectDocumentModal,
} from "../../components";
import { useOilMartQuotationDetail } from "./hooks/use-oil-mart-quotation-detail";
import { OilMartQuotationDetailCard } from "./oil-mart-quotation-detail-card";
import { QuotationStageActions } from "./quotation-stage-actions";

export function OilMartQuotationDetailPage() {
  const can = useCan();
  const canCreate = can(OILMART_SALE_CREATE);
  const canApprove = can(OILMART_SALE_APPROVE);

  const {
    quotationQuery,
    quotation,
    pdfPath,
    modal,
    setModal,
    busy,
    submitForApproval,
    approve,
    reject,
    cancel,
    openEdit,
  } = useOilMartQuotationDetail();

  return (
    <div>
      <Breadcrumbs mb="sm">
        <Anchor component={Link} to="/oil-mart/quotations" size="sm">
          Quotations
        </Anchor>
        <Anchor size="sm" c="dimmed">
          {quotation?.quotationNo ?? "…"}
        </Anchor>
      </Breadcrumbs>

      <PageHeader title={quotation?.quotationNo ?? "Quotation"} />

      <QueryBoundary loading={quotationQuery.isLoading} error={quotationQuery.error}>
        {quotation && (
          <>
            <QuotationStageActions
              quotation={quotation}
              canCreate={canCreate}
              canApprove={canApprove}
              busy={busy}
              onSubmitForApproval={() => submitForApproval.mutate()}
              onApprove={() => setModal("approve")}
              onReject={() => setModal("reject")}
              onCancel={() => setModal("cancel")}
              onEdit={openEdit}
              onPreviewPdf={() => setModal("preview")}
            />

            <OilMartQuotationDetailCard quotation={quotation} />

            <ApproveDocumentModal
              opened={modal === "approve"}
              quotation={quotation}
              submitting={approve.isPending}
              onClose={() => setModal(null)}
              onSubmit={() => approve.mutate()}
            />

            <RejectDocumentModal
              opened={modal === "reject"}
              documentNo={quotation.quotationNo}
              submitting={reject.isPending}
              onClose={() => setModal(null)}
              onSubmit={(reason) => reject.mutate(reason)}
            />

            <RejectDocumentModal
              opened={modal === "cancel"}
              documentNo={quotation.quotationNo}
              title="Cancel quotation"
              description={`${quotation.quotationNo} will be cancelled and can no longer be approved or invoiced.`}
              confirmLabel="Cancel quotation"
              submitting={cancel.isPending}
              onClose={() => setModal(null)}
              onSubmit={(reason) => cancel.mutate(reason)}
            />

            <PdfPreviewModal
              opened={modal === "preview"}
              path={pdfPath}
              documentNo={quotation.quotationNo}
              onClose={() => setModal(null)}
            />
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
