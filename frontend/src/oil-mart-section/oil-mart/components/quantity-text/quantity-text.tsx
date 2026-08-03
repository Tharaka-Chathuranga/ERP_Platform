import { Text, type TextProps } from "@mantine/core";

/**
 * Renders a quantity without trailing zeros — 25 stays 25, 25.50 becomes 25.5.
 * The unit of measure is deliberately not appended: it varies per item and is
 * shown in its own column.
 */
export function formatQuantity(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

interface QuantityTextProps extends TextProps {
  value: number | null | undefined;
}

export function QuantityText({ value, ...rest }: QuantityTextProps) {
  return (
    <Text
      component="span"
      size="sm"
      style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}
      {...rest}
    >
      {formatQuantity(value)}
    </Text>
  );
}
