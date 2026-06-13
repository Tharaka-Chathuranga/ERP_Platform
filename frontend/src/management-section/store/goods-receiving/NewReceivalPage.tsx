import { useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Grid,
  Group,
  SegmentedControl,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@ui/layout/PageHeader";
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
      navigate(`/receiving/${receival.id}`);
    },
    onError: notifyError,
  });

  return (
    <div>
      <PageHeader
        title="New item receival"
      />
      <Card withBorder radius="md" padding="lg">
        <Stack>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Stack gap={4}>
                <SegmentedControl
                  value={source}
                  onChange={(v) => setSource(v as SupplierSource)}
                  data={[
                    { label: "Registered supplier", value: "registered" },
                    { label: "Unregistered", value: "unregistered" },
                  ]}
                />
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

          <div>
            <LineItemsEditor lines={lines} onChange={setLines} showUnitCost />
          </div>

          <Group justify="flex-end">
            <Button variant="default" onClick={() => navigate("/receiving")}>
              Cancel
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              loading={mutation.isPending}
              disabled={!canSubmit}
            >
              Receive items
            </Button>
          </Group>
        </Stack>
      </Card>
    </div>
  );
}
