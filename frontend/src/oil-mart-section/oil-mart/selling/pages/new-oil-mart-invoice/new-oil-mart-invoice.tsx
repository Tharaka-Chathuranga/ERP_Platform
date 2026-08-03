import { Alert, Button, Card, Group, Textarea } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconInfoCircle } from "@tabler/icons-react";
import { PageHeader } from "@ui/layout/PageHeader";
import { QueryBoundary } from "@ui/feedback/QueryBoundary";
import { QuotationPicker } from "../../components";
import { useNewOilMartInvoice } from "./hooks/use-new-oil-mart-invoice";

export function NewOilMartInvoicePage() {
  const {
    quotationsQuery,
    quotationId,
    setQuotationId,
    selected,
    invoiceDate,
    setInvoiceDate,
    note,
    setNote,
    showErrors,
    create,
    submit,
    cancel,
  } = useNewOilMartInvoice();

  return (
    <div>
      <PageHeader title="New invoice" />

      <QueryBoundary loading={quotationsQuery.isLoading} error={quotationsQuery.error}>
        <QuotationPicker
          quotations={quotationsQuery.data ?? []}
          value={quotationId}
          onChange={setQuotationId}
          error={showErrors && !quotationId ? "Select a quotation to invoice" : undefined}
        />

        <Card withBorder radius="md" padding="lg" mt="lg">
          <Group grow align="flex-start" mb="md">
            <DateInput
              label="Invoice date"
              withAsterisk
              value={invoiceDate}
              onChange={setInvoiceDate}
              valueFormat="MMM D, YYYY"
              error={showErrors && !invoiceDate ? "Select the invoice date" : undefined}
            />
          </Group>
          <Textarea
            label="Note"
            description="Printed on the client PDF, e.g. payment terms."
            autosize
            minRows={2}
            value={note}
            onChange={(event) => setNote(event.currentTarget.value)}
          />
        </Card>

        <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />} mt="lg">
          The invoice copies the quotation as it stands now. Stock leaves only when a manager
          approves the invoice.
        </Alert>

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={cancel} disabled={create.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} loading={create.isPending} disabled={selected?.expired}>
            Raise invoice
          </Button>
        </Group>
      </QueryBoundary>
    </div>
  );
}
