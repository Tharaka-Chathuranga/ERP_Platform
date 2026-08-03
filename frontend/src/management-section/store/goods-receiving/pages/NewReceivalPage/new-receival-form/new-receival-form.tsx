import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Grid,
  Group,
  LoadingOverlay,
  Radio,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconChevronRight } from "@tabler/icons-react";
import { StepHeading } from "@ui/layout/StepHeading";
import { LineItemsEditor } from "@ui/primitives/LineItemsEditor";
import { useNewReceival, type SupplierSource } from "../hooks/use-new-receival";

export function NewReceivalForm() {
  const {
    navigate,
    suppliers,
    source,
    setSource,
    supplierId,
    setSupplierId,
    supplierName,
    setSupplierName,
    poNumber,
    setPoNumber,
    invoiceNumber,
    setInvoiceNumber,
    allReceivedForPo,
    setAllReceivedForPo,
    receivedAt,
    setReceivedAt,
    lines,
    setLines,
    hasPo,
    canSubmit,
    mutation,
  } = useNewReceival();

  return (
    <Card withBorder radius="md" padding={0} pos="relative">
      <LoadingOverlay
        visible={mutation.isPending}
        overlayProps={{ blur: 1 }}
        loaderProps={{ children: "Recording receival…" }}
      />

      <Box p="xl">
        <StepHeading number={1} title="Who supplied the items?" />
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="xs">
              <Radio.Group
                value={source}
                onChange={(v) => setSource(v as SupplierSource)}
              >
                <Group gap="lg">
                  <Radio value="registered" label="Registered supplier" />
                  <Radio value="unregistered" label="Unregistered" />
                </Group>
              </Radio.Group>
              {source === "registered" ? (
                <Select
                  label="Supplier"
                  placeholder={suppliers.data?.length ? "Select supplier" : "No suppliers"}
                  searchable
                  required
                  data={
                    suppliers.data?.map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` })) ??
                    []
                  }
                  value={supplierId}
                  onChange={setSupplierId}
                />
              ) : (
                <TextInput
                  label="Supplier name"
                  placeholder="e.g. ABC Traders"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.currentTarget.value)}
                />
              )}
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <DateInput label="Received at" value={receivedAt} onChange={setReceivedAt} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="Invoice number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.currentTarget.value)}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              label="PO number"
              value={poNumber}
              onChange={(e) => setPoNumber(e.currentTarget.value)}
            />
          </Grid.Col>
          {hasPo && (
            <Grid.Col span={12}>
              <Checkbox
                label="All items received for this purchase order"
                checked={allReceivedForPo}
                onChange={(e) => setAllReceivedForPo(e.currentTarget.checked)}
              />
            </Grid.Col>
          )}
        </Grid>
      </Box>

      <Divider />
      <Box p="xl">
        <StepHeading number={2} title="Which items were received?" />
        <LineItemsEditor lines={lines} onChange={setLines} showUnitCost showLocation />
      </Box>

      <Box p="xl" pt={0}>
        <Group justify="space-between">
          <Button variant="default" onClick={() => navigate("/receiving")}>
            Cancel
          </Button>
          <Button
            radius="md"
            rightSection={<IconChevronRight size={16} />}
            onClick={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={!canSubmit}
          >
            Receive items
          </Button>
        </Group>
      </Box>
    </Card>
  );
}
