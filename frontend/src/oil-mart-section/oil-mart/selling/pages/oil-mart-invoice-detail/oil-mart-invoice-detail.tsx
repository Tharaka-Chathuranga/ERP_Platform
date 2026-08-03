import { Anchor, Breadcrumbs, Button, Group, Modal, Stack } from "@mantine/core";
import { Link } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { useCan } from "@auth/useCan";
import { OILMART_SALE_APPROVE, OILMART_SALE_CREATE } from "@auth/permissions";
import { useState } from "react";
import { PdfPreviewModal, QuotationPicker, RejectDocumentModal } from "../../components";
import { useOilMartInvoiceDetail } from "./hooks/use-oil-mart-invoice-detail";
import { OilMartInvoiceDetailCard } from "./oil-mart-invoice-detail-card";
import { InvoiceStageActions } from "./invoice-stage-actions";

export function OilMartInvoiceDetailPage() {
  const can = useCan();
  const canCreate = can(OILMART_SALE_CREATE);
  const canApprove = can(OILMART_SALE_APPROVE);
  const [replacementId, setReplacementId] = useState<string | null>(null);

  const {
    invoiceQuery,
    invoice,
    invoiceableQuery,
    pdfPath,
    modal,
    setModal,
    busy,
    approve,
    reject,
    cancel,
    reselect,
  } = useOilMartInvoiceDetail();

  return (
    <div>
      <Breadcrumbs mb="sm">
        <Anchor component={Link} to="/oil-mart/invoices" size="sm">
          Invoices
        </Anchor>
        <Anchor size="sm" c="dimmed">
          {invoice?.invoiceNo ?? "…"}
        </Anchor>
      </Breadcrumbs>

      <PageHeader title={invoice?.invoiceNo ?? "Invoice"} />

      <QueryBoundary loading={invoiceQuery.isLoading} error={invoiceQuery.error}>
        {invoice && (
          <>
            <InvoiceStageActions
              invoice={invoice}
              canCreate={canCreate}
              canApprove={canApprove}
              busy={busy}
              onApprove={() => approve.mutate()}
              onReject={() => setModal("reject")}
              onCancel={() => setModal("cancel")}
              onReselect={() => {
                setReplacementId(null);
                setModal("reselect");
              }}
              onPreviewPdf={() => setModal("preview")}
            />

            <OilMartInvoiceDetailCard invoice={invoice} />

            <RejectDocumentModal
              opened={modal === "reject"}
              documentNo={invoice.invoiceNo}
              title="Reject invoice"
              description={`${invoice.invoiceNo} goes back to whoever raised it, who can point it at the correct quotation. They are notified with your reason.`}
              confirmLabel="Reject invoice"
              submitting={reject.isPending}
              onClose={() => setModal(null)}
              onSubmit={(reason) => reject.mutate(reason)}
            />

            <RejectDocumentModal
              opened={modal === "cancel"}
              documentNo={invoice.invoiceNo}
              title="Cancel invoice"
              description={`${invoice.invoiceNo} will be cancelled. Its quotation becomes available to invoice again.`}
              confirmLabel="Cancel invoice"
              submitting={cancel.isPending}
              onClose={() => setModal(null)}
              onSubmit={(reason) => cancel.mutate(reason)}
            />

            <Modal
              opened={modal === "reselect"}
              onClose={() => setModal(null)}
              title="Select the correct quotation"
              centered
              size="lg"
            >
              <Stack gap="md">
                <QueryBoundary
                  loading={invoiceableQuery.isLoading}
                  error={invoiceableQuery.error}
                >
                  <QuotationPicker
                    quotations={invoiceableQuery.data ?? []}
                    value={replacementId}
                    onChange={setReplacementId}
                  />
                </QueryBoundary>
                <Group justify="flex-end">
                  <Button
                    variant="default"
                    onClick={() => setModal(null)}
                    disabled={reselect.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    loading={reselect.isPending}
                    disabled={!replacementId}
                    onClick={() => reselect.mutate(replacementId!)}
                  >
                    Use this quotation
                  </Button>
                </Group>
              </Stack>
            </Modal>

            <PdfPreviewModal
              opened={modal === "preview"}
              path={pdfPath}
              documentNo={invoice.invoiceNo}
              onClose={() => setModal(null)}
            />
          </>
        )}
      </QueryBoundary>
    </div>
  );
}
