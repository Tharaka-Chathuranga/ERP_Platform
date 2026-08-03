import { Text, type TextProps } from "@mantine/core";
import { formatQuantity } from "../quantity-text";

interface StockOnHandHintProps extends TextProps {
  quantityOnHand: number | undefined;
  requestedQuantity?: number;
}

export function StockOnHandHint({
  quantityOnHand,
  requestedQuantity,
  ...rest
}: StockOnHandHintProps) {
  if (quantityOnHand === undefined) {
    return (
      <Text component="span" size="xs" c="dimmed" {...rest}>
        No stock record
      </Text>
    );
  }

  const requested = requestedQuantity ?? 0;
  const remaining = quantityOnHand - requested;
  const short = remaining < 0;

  return (
    <Text component="span" size="xs" c={short ? "red" : "dimmed"} {...rest}>
      {formatQuantity(quantityOnHand)} L on hand
      {requested > 0 &&
        (short
          ? ` · over by ${formatQuantity(-remaining)} L`
          : ` · ${formatQuantity(remaining)} L left`)}
    </Text>
  );
}
