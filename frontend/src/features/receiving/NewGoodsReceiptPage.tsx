import { useState } from "react";
import { Button, Card, Grid, Group, Select, Stack, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/PageHeader";
import { LineItemsEditor, newLine, type EditableLine } from "../../components/LineItemsEditor";
import { useAuth } from "../../auth/AuthContext";
import { listSuppliers } from "../../api/store/suppliers";
import { createGoodsReceipt } from "../../api/store/receiving";
import { notifyError, notifySuccess } from "../../lib/notify";

export function NewGoodsReceiptPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { userId } = useAuth();

  const suppliers = useQuery({ queryKey: ["suppliers"], queryFn: listSuppliers });
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [poNumber, setPoNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [receivedAt, setReceivedAt] = useState<Date | null>(new Date());
  const [lines, setLines] = useState<EditableLine[]>([newLine(true)]);

  const validLines = lines.filter((l) => l.itemId && l.quantity !== "" && Number(l.quantity) > 0);
  const canSubmit = !!supplierId && !!userId && validLines.length > 0;

  const mutation = useMutation({
    mutationFn: () =>
      createGoodsReceipt({
        supplierId: supplierId!,
        storeKeeperId: userId!,
        poNumber: poNumber || undefined,
        invoiceNumber: invoiceNumber || undefined,
        receivedAt: receivedAt ? receivedAt.toISOString() : undefined,
        lines: validLines.map((l) => ({
          itemId: l.itemId!,
          quantity: Number(l.quantity),
          unitCost: l.unitCost === "" || l.unitCost == null ? undefined : Number(l.unitCost),
        })),
      }),
    onSuccess: (grn) => {
      notifySuccess(`Goods receipt ${grn.grnNumber} created`);
      qc.invalidateQueries({ queryKey: ["grns"] });
      navigate(`/receiving/${grn.id}`);
    },
    onError: notifyError,
  });

  return (
    <div>
      <PageHeader title="New goods receipt" subtitle="Record items arriving from a supplier" />
      <Card withBorder radius="md" padding="lg">
        <Stack>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Supplier"
                placeholder={suppliers.data?.length ? "Select supplier" : "No suppliers"}
                searchable
                required
                data={suppliers.data?.map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` })) ?? []}
                value={supplierId}
                onChange={setSupplierId}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DateInput label="Received at" value={receivedAt} onChange={setReceivedAt} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="PO number"
                value={poNumber}
                onChange={(e) => setPoNumber(e.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Invoice number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.currentTarget.value)}
              />
            </Grid.Col>
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
              Create receipt
            </Button>
          </Group>
        </Stack>
      </Card>
    </div>
  );
}
