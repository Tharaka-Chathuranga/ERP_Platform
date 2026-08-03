import { Group, NumberInput, Text, Tooltip } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { MoneyText } from "../../../components/money-text";

interface PriceOverrideProps {
  listUnitPrice: number | undefined;
  unitPrice: number | undefined;
}

interface PriceOverrideFieldProps extends PriceOverrideProps {
  disabled?: boolean;
  onChange: (unitPrice: number | undefined, isPriceOverride: boolean) => void;
}

export function priceVariance(listUnitPrice?: number, unitPrice?: number): number {
  if (!listUnitPrice || unitPrice === undefined) return 0;
  return ((unitPrice - listUnitPrice) / listUnitPrice) * 100;
}

function isOverridden(listUnitPrice?: number, unitPrice?: number): boolean {
  return listUnitPrice !== undefined && unitPrice !== undefined && unitPrice !== listUnitPrice;
}

export function PriceOverrideField({
  listUnitPrice,
  unitPrice,
  disabled,
  onChange,
}: PriceOverrideFieldProps) {
  const overridden = isOverridden(listUnitPrice, unitPrice);
  const variance = priceVariance(listUnitPrice, unitPrice);

  return (
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
      styles={{ input: { textAlign: "right" } }}
      rightSection={
        overridden ? (
          <Tooltip label={`${variance > 0 ? "+" : ""}${variance.toFixed(1)}% vs list price`}>
            <IconAlertTriangle size={16} color="var(--mantine-color-orange-6)" />
          </Tooltip>
        ) : undefined
      }
    />
  );
}

export function PriceOverrideHint({ listUnitPrice, unitPrice }: PriceOverrideProps) {
  const overridden = isOverridden(listUnitPrice, unitPrice);
  const variance = priceVariance(listUnitPrice, unitPrice);

  return (
    <Group gap={4} wrap="nowrap" component="span" style={{ display: "inline-flex" }}>
      <Text component="span" size="xs" c="dimmed">
        List
      </Text>
      <MoneyText value={listUnitPrice} size="xs" />
      {overridden && (
        <Text component="span" size="xs" c={variance < 0 ? "red" : "teal"} fw={600}>
          ({variance > 0 ? "+" : ""}
          {variance.toFixed(1)}%)
        </Text>
      )}
    </Group>
  );
}
