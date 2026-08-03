import { Text, type TextProps } from "@mantine/core";
import { formatQuantity } from "../quantity-text";

interface StockOnHandHintProps extends TextProps {
  quantityOnHand: number | undefined;
  requestedQuantity?: number;
  /** The item's own unit; never assume litres. */
  unitOfMeasure?: string;
}

export function StockOnHandHint({
  quantityOnHand,
  requestedQuantity,
  unitOfMeasure,
  ...rest
}: StockOnHandHintProps) {
  const unit = unitOfMeasure ? ` ${unitOfMeasure}` : "";

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
      {formatQuantity(quantityOnHand)}
      {unit} on hand
      {requested > 0 &&
        (short
          ? ` · over by ${formatQuantity(-remaining)}${unit}`
          : ` · ${formatQuantity(remaining)}${unit} left`)}
    </Text>
  );
}
