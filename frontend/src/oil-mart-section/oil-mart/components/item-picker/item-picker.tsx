import { Group, Select, Text, type SelectProps } from "@mantine/core";
import { useMemo } from "react";
import type { OilMartItem, OilMartStockBalance } from "@core/types";

interface ItemPickerProps extends Omit<SelectProps, "data" | "value" | "onChange"> {
  items: OilMartItem[];
  stock?: OilMartStockBalance[];
  value: string | null;
  onChange: (itemId: string | null) => void;
  showAvailableStock?: boolean;
  requiredLitres?: number;
}

export function ItemPicker({
  items,
  stock = [],
  value,
  onChange,
  showAvailableStock = true,
  requiredLitres,
  ...rest
}: ItemPickerProps) {
  const onHandById = useMemo(
    () => new Map(stock.map((s) => [s.itemId, s.quantityOnHand])),
    [stock],
  );

  const data = useMemo(
    () =>
      items
        .filter((item) => item.status === "ACTIVE")
        .map((item) => ({ value: item.id, label: `${item.code} — ${item.name}` })),
    [items],
  );

  const onHand = value ? onHandById.get(value) : undefined;
  const short =
    requiredLitres !== undefined && onHand !== undefined && onHand < requiredLitres;

  return (
    <Select
      data={data}
      value={value}
      onChange={onChange}
      searchable
      clearable
      nothingFoundMessage="No matching oil"
      error={short ? `Only ${onHand} L on hand` : rest.error}
      description={
        showAvailableStock && value ? (
          <Group gap={4} component="span">
            <Text component="span" size="xs" c={short ? "red" : "dimmed"}>
              {onHand === undefined ? "No stock record" : `${onHand} L available`}
            </Text>
          </Group>
        ) : undefined
      }
      {...rest}
    />
  );
}
