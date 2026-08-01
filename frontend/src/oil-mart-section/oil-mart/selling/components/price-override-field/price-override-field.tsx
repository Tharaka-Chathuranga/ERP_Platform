import { Group, NumberInput, Stack, Text, Tooltip } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { MoneyText } from "../../../components/money-text";

interface PriceOverrideFieldProps {
  listUnitPrice: number | undefined;
  unitPrice: number | undefined;
  disabled?: boolean;
  onChange: (unitPrice: number | undefined, isPriceOverride: boolean) => void;
}

export function priceVariance(listUnitPrice?: number, unitPrice?: number): number {
  if (!listUnitPrice || unitPrice === undefined) return 0;
  return ((unitPrice - listUnitPrice) / listUnitPrice) * 100;
}

export function PriceOverrideField({
  listUnitPrice,
  unitPrice,
  disabled,
  onChange,
}: PriceOverrideFieldProps) {
  const overridden =
    listUnitPrice !== undefined && unitPrice !== undefined && unitPrice !== listUnitPrice;
  const variance = priceVariance(listUnitPrice, unitPrice);

  return (
    <Stack gap={4}>
      <NumberInput
        value={unitPrice ?? ""}
        onChange={(value) => {
          const next = value === "" ? undefined : Number(value);
          onChange(next, next !== undefined && next !== listUnitPrice);
        }}
        disabled={disabled}
        min={0}
        decimalScale={4}
        thousandSeparator=","
        placeholder="0.00"
        rightSection={
          overridden ? (
            <Tooltip label={`${variance > 0 ? "+" : ""}${variance.toFixed(1)}% vs list price`}>
              <IconAlertTriangle size={16} color="var(--mantine-color-orange-6)" />
            </Tooltip>
          ) : undefined
        }
      />
      <Group gap={4} wrap="nowrap">
        <Text size="xs" c="dimmed">
          List
        </Text>
        <MoneyText value={listUnitPrice} size="xs" />
        {overridden && (
          <Text size="xs" c={variance < 0 ? "red" : "teal"} fw={600}>
            ({variance > 0 ? "+" : ""}
            {variance.toFixed(1)}%)
          </Text>
        )}
      </Group>
    </Stack>
  );
}
