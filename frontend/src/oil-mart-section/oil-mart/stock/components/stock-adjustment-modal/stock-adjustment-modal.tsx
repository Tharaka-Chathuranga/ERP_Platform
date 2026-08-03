import { Button, Group, Modal, SegmentedControl, Stack, Text, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useMemo } from "react";
import type {
  OilMartItem,
  OilMartStockAdjustmentDirection,
  OilMartStockBalance,
} from "@core/types";
import { ItemPicker } from "../../../components/item-picker";
import { LitreInput } from "../../../components/litre-input";
import { formatQuantity } from "../../../components/quantity-text";
import type { AdjustOilMartStockInput } from "../../api";

const DIRECTION_OPTIONS = [
  { value: "IN", label: "Stock in" },
  { value: "OUT", label: "Stock out" },
];

interface StockAdjustmentModalProps {
  opened: boolean;
  items: OilMartItem[];
  balances: OilMartStockBalance[];
  defaultItemId?: string;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: AdjustOilMartStockInput) => void;
}

interface FormValues {
  itemId: string | null;
  direction: OilMartStockAdjustmentDirection;
  quantityLitres: number | undefined;
  reason: string;
}

const EMPTY_VALUES: FormValues = {
  itemId: null,
  direction: "IN",
  quantityLitres: undefined,
  reason: "",
};

export function StockAdjustmentModal({
  opened,
  items,
  balances,
  defaultItemId,
  submitting,
  onClose,
  onSubmit,
}: StockAdjustmentModalProps) {
  const form = useForm<FormValues>({
    initialValues: EMPTY_VALUES,
    validate: {
      itemId: (value) => (value ? null : "Pick the oil being restocked"),
      quantityLitres: (value) => (value && value > 0 ? null : "Quantity must be greater than zero"),
      reason: (value) => (value.trim() ? null : "A reason keeps the ledger auditable"),
    },
  });

  useEffect(() => {
    if (!opened) return;
    form.setValues({ ...EMPTY_VALUES, itemId: defaultItemId ?? null });
  }, [opened, defaultItemId]);

  const selectedItem = items.find((item) => item.id === form.values.itemId);
  const balance = balances.find((entry) => entry.itemId === form.values.itemId);
  const unit = selectedItem?.unitOfMeasure ?? "L";

  const nextOnHand = useMemo(() => {
    if (balance === undefined || !form.values.quantityLitres) return undefined;
    const delta =
      form.values.direction === "IN" ? form.values.quantityLitres : -form.values.quantityLitres;
    return balance.quantityOnHand + delta;
  }, [balance, form.values.direction, form.values.quantityLitres]);

  const takesMoreThanOnHand = nextOnHand !== undefined && nextOnHand < 0;

  const handleSubmit = (values: FormValues) =>
    onSubmit({
      itemId: values.itemId!,
      quantityLitres: values.quantityLitres!,
      direction: values.direction,
      reason: values.reason.trim(),
    });

  return (
    <Modal opened={opened} onClose={onClose} title="Restock oil" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          <ItemPicker
            label="Oil"
            withAsterisk
            items={items}
            stock={balances}
            value={form.values.itemId}
            onChange={(itemId) => form.setFieldValue("itemId", itemId)}
            requiredLitres={
              form.values.direction === "OUT" ? form.values.quantityLitres : undefined
            }
            error={form.errors.itemId}
          />

          <SegmentedControl
            fullWidth
            data={DIRECTION_OPTIONS}
            value={form.values.direction}
            onChange={(value) =>
              form.setFieldValue("direction", value as OilMartStockAdjustmentDirection)
            }
          />

          <LitreInput
            label={`Quantity (${unit})`}
            withAsterisk
            value={form.values.quantityLitres}
            onChange={(value) => form.setFieldValue("quantityLitres", value)}
            error={form.errors.quantityLitres}
          />

          <Textarea
            label="Reason"
            withAsterisk
            autosize
            minRows={2}
            placeholder="Physical count correction, spillage, opening balance…"
            {...form.getInputProps("reason")}
          />

          {balance && (
            <Text size="sm" c={takesMoreThanOnHand ? "red" : "dimmed"}>
              On hand {formatQuantity(balance.quantityOnHand)} {unit}
              {nextOnHand !== undefined && ` → ${formatQuantity(nextOnHand)} ${unit}`}
              {takesMoreThanOnHand && " — more than is on hand"}
            </Text>
          )}

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting} disabled={takesMoreThanOnHand}>
              Restock
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
