import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  LoadingOverlay,
  Textarea,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconChevronRight, IconInfoCircle } from "@tabler/icons-react";
import { PageHeader } from "@ui/layout/PageHeader";
import { StepHeading } from "@ui/layout/StepHeading";
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

      <Card withBorder radius="md" padding={0} pos="relative">
        <LoadingOverlay
          visible={create.isPending}
          overlayProps={{ blur: 1 }}
          loaderProps={{ children: "Creating invoice…" }}
        />

        <Box p="xl">
          <StepHeading number={1} title="Which quotation is this invoice for?" />
          <QueryBoundary loading={quotationsQuery.isLoading} error={quotationsQuery.error}>
            <QuotationPicker
              quotations={quotationsQuery.data ?? []}
              value={quotationId}
              onChange={setQuotationId}
              error={showErrors && !quotationId ? "Select a quotation to invoice" : undefined}
            />
          </QueryBoundary>
        </Box>

        <Divider />
        <Box p="xl">
          <StepHeading number={2} title="When is it issued, and on what terms?" />
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <DateInput
                label="Invoice date"
                withAsterisk
                value={invoiceDate}
                onChange={setInvoiceDate}
                valueFormat="MMM D, YYYY"
                error={showErrors && !invoiceDate ? "Select the invoice date" : undefined}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 8 }}>
              <Textarea
                label="Note"
                description="Printed on the client PDF, e.g. payment terms."
                autosize
                minRows={2}
                value={note}
                onChange={(event) => setNote(event.currentTarget.value)}
              />
            </Grid.Col>
          </Grid>

          <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />} mt="lg">
            The invoice copies the quotation as it stands now. Stock leaves only when a manager
            approves the invoice.
          </Alert>
        </Box>

        <Box p="xl" pt={0}>
          <Group justify="space-between">
            <Button variant="default" onClick={cancel} disabled={create.isPending}>
              Cancel
            </Button>
            <Button
              radius="md"
              rightSection={<IconChevronRight size={16} />}
              onClick={submit}
              loading={create.isPending}
              disabled={selected?.expired}
            >
              Create invoice
            </Button>
          </Group>
        </Box>
      </Card>
    </div>
  );
}
