import { Text, type TextProps } from "@mantine/core";

const FORMATTER = new Intl.NumberFormat("en-PG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return FORMATTER.format(value);
}

interface MoneyTextProps extends TextProps {
  value: number | null | undefined;
  currency?: string;
  emphasis?: boolean;
}

export function MoneyText({ value, currency = "PGK", emphasis, ...rest }: MoneyTextProps) {
  const blank = value === null || value === undefined || Number.isNaN(value);
  const zero = !blank && value === 0;
  const negative = !blank && (value as number) < 0;

  return (
    <Text
      component="span"
      size="sm"
      fw={emphasis ? 700 : 500}
      c={blank || zero ? "dimmed" : negative ? "red" : undefined}
      style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}
      {...rest}
    >
      {blank ? "—" : `${currency} ${FORMATTER.format(value as number)}`}
    </Text>
  );
}
