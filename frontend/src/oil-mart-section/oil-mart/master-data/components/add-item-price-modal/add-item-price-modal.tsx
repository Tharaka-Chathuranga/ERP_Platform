import { Alert, Button, Group, Modal, NumberInput, Stack, Textarea } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconInfoCircle } from "@tabler/icons-react";
import { useEffect } from "react";
import dayjs from "dayjs";
import type { OilMartItemPrice } from "@core/types";
import type { AddOilMartItemPriceInput } from "../../api";

interface AddItemPriceModalProps {
  opened: boolean;
  currentPrice?: OilMartItemPrice;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: AddOilMartItemPriceInput) => void;
}

interface FormValues {
  buyPrice: number;
  sellPrice: number;
  effectiveFrom: Date | null;
  note: string;
}

export function AddItemPriceModal({
  opened,
  currentPrice,
  submitting,
  onClose,
  onSubmit,
}: AddItemPriceModalProps) {
  const minFrom = currentPrice ? dayjs(currentPrice.effectiveFrom).add(1, "day").toDate() : undefined;

  const form = useForm<FormValues>({
    initialValues: { buyPrice: 0, sellPrice: 0, effectiveFrom: new Date(), note: "" },
    validate: {
      buyPrice: (value) => (value > 0 ? null : "Buy price must be greater than zero"),
      sellPrice: (value, values) =>
        value > 0
          ? value >= values.buyPrice
            ? null
            : "Sell price is below the buy price"
          : "Sell price must be greater than zero",
      effectiveFrom: (value) => {
        if (!value) return "Effective from is required";
        if (minFrom && dayjs(value).isBefore(dayjs(minFrom), "day")) {
          return `Must start after the current price period (${dayjs(currentPrice!.effectiveFrom).format("MMM D, YYYY")})`;
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (!opened) return;
    form.setValues({
      buyPrice: currentPrice?.buyPrice ?? 0,
      sellPrice: currentPrice?.sellPrice ?? 0,
      effectiveFrom: minFrom ?? new Date(),
      note: "",
    });
  }, [opened, currentPrice]);

  const handleSubmit = (values: FormValues) =>
    onSubmit({
      buyPrice: values.buyPrice,
      sellPrice: values.sellPrice,
      effectiveFrom: dayjs(values.effectiveFrom).format("YYYY-MM-DD"),
      note: values.note.trim() || undefined,
    });

  return (
    <Modal opened={opened} onClose={onClose} title="Add price" centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="sm">
          {currentPrice && (
            <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />}>
              The current period starting{" "}
              {dayjs(currentPrice.effectiveFrom).format("MMM D, YYYY")} will be closed the day
              before this one begins.
            </Alert>
          )}
          <Group grow>
            <NumberInput
              label="Buy price"
              withAsterisk
              min={0}
              decimalScale={4}
              thousandSeparator=","
              {...form.getInputProps("buyPrice")}
            />
            <NumberInput
              label="Sell price"
              withAsterisk
              min={0}
              decimalScale={4}
              thousandSeparator=","
              {...form.getInputProps("sellPrice")}
            />
          </Group>
          <DateInput
            label="Effective from"
            withAsterisk
            minDate={minFrom}
            valueFormat="MMM D, YYYY"
            {...form.getInputProps("effectiveFrom")}
          />
          <Textarea label="Note" autosize minRows={2} {...form.getInputProps("note")} />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Add price
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
