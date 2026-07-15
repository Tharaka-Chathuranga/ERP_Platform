import { useState } from "react";
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
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
import { StepHeading } from "@ui/layout/StepHeading";
import { LineItemsEditor, newLine, type EditableLine } from "@ui/primitives/LineItemsEditor";
import { useAuth } from "@auth/AuthContext";
import { listSuppliers } from "@store/inventory/suppliers.api";
import { createReceival } from "@store/goods-receiving/receiving.api";
import { notifyError, notifySuccess } from "@core/notify";
import { qk } from "@core/queryKeys";

type SupplierSource = "registered" | "unregistered";

export function NewReceivalPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId } = useAuth();

  const suppliers = useQuery({ queryKey: qk.suppliers(), queryFn: listSuppliers });
  const [source, setSource] = useState<SupplierSource>("registered");
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [supplierName, setSupplierName] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [allReceivedForPo, setAllReceivedForPo] = useState(false);
  const [receivedAt, setReceivedAt] = useState<Date | null>(new Date());
  const [lines, setLines] = useState<EditableLine[]>([newLine(true)]);

  const hasPo = poNumber.trim().length > 0;
  const validLines = lines.filter((l) => l.itemId && l.quantity !== "" && Number(l.quantity) > 0);
  const supplierOk =
    source === "registered" ? !!supplierId : supplierName.trim().length > 0;
  const canSubmit = supplierOk && !!userId && validLines.length > 0;

  const mutation = useMutation({
    mutationFn: () =>
      createReceival({
        supplierId: source === "registered" ? supplierId! : undefined,
        supplierName: source === "unregistered" ? supplierName.trim() : undefined,
        storeKeeperId: userId!,
        poNumber: hasPo ? poNumber.trim() : undefined,
        invoiceNumber: invoiceNumber.trim() || undefined,
        allReceivedForPo: hasPo && allReceivedForPo,
        receivedAt: receivedAt ? receivedAt.toISOString() : undefined,
        receivalItems: validLines.map((l) => ({
          itemId: l.itemId!,
          quantity: Number(l.quantity),
          unitCost: l.unitCost === "" || l.unitCost == null ? undefined : Number(l.unitCost),
          rack: l.rack?.trim() || undefined,
          row: l.row?.trim() || undefined,
          column: l.column?.trim() || undefined,
        })),
      }),
    onSuccess: (receival) => {
      notifySuccess(
        receival.goodReceiveNoteId
          ? `Receival ${receival.receivalNumber} recorded — GRN generated`
          : `Receival ${receival.receivalNumber} recorded`,
      );
      qc.invalidateQueries({ queryKey: qk.receivals() });
      qc.invalidateQueries({ queryKey: qk.goodsReceipts() });
      validLines.forEach((l) => qc.invalidateQueries({ queryKey: qk.item(l.itemId!) }));
      navigate(`/receiving/${receival.id}`);
    },
    onError: notifyError,
  });

  return (
    <div>
      <PageHeader title="New item receival" />

      <Group mb="md">
        <Button variant="default" leftSection={<IconChevronLeft size={16} />} onClick={() => navigate("/receiving")}>
          Back
        </Button>
      </Group>

      <Card withBorder radius="md" padding={0} pos="relative">
        <LoadingOverlay
          visible={mutation.isPending}
          overlayProps={{ blur: 1 }}
          loaderProps={{ children: "Recording receival…" }}
        />

        {/* Step 1 — Supplier & document details */}
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

        {/* Step 2 — Items */}
        <Divider />
        <Box p="xl">
          <StepHeading number={2} title="Which items were received?" />
          <LineItemsEditor lines={lines} onChange={setLines} showUnitCost showLocation />
        </Box>

        {/* Submit */}
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
    </div>
  );
}
