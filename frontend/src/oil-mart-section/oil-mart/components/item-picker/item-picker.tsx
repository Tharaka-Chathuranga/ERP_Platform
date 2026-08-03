import { Group, Select, Stack, Text, type SelectProps } from "@mantine/core";
import { useMemo } from "react";
import type { OilMartItem, OilMartStockBalance } from "@core/types";
import { formatQuantity } from "../quantity-text";

interface ItemPickerProps extends Omit<SelectProps, "data" | "value" | "onChange"> {
  items: OilMartItem[];
  stock?: OilMartStockBalance[];
  value: string | null;
  onChange: (itemId: string | null) => void;
  showAvailableStock?: boolean;
  requiredLitres?: number;
}

interface OptionMeta {
  code: string;
  name: string;
  unitOfMeasure: string;
  quantityOnHand?: number;
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
    () => new Map(stock.map((balance) => [balance.itemId, balance.quantityOnHand])),
    [stock],
  );

  /** Every option carries its own stock, so availability is visible before choosing. */
  const metaById = useMemo(() => {
    const map = new Map<string, OptionMeta>();
    items.forEach((item) =>
      map.set(item.id, {
        code: item.code,
        name: item.name,
        unitOfMeasure: item.unitOfMeasure,
        quantityOnHand: onHandById.get(item.id),
      }),
    );
    return map;
  }, [items, onHandById]);

  const data = useMemo(
    () =>
      items
        .filter((item) => item.status === "ACTIVE")
        .map((item) => ({ value: item.id, label: `${item.code} — ${item.name}` })),
    [items],
  );

  const selected = value ? metaById.get(value) : undefined;
  const onHand = selected?.quantityOnHand;
  const short = requiredLitres !== undefined && onHand !== undefined && onHand < requiredLitres;

  return (
    <Select
      data={data}
      value={value}
      onChange={onChange}
      searchable
      clearable
      nothingFoundMessage="No matching oil"
      error={
        short
          ? `Only ${formatQuantity(onHand)} ${selected?.unitOfMeasure ?? ""} on hand`.trim()
          : rest.error
      }
      renderOption={({ option }) => {
        const meta = metaById.get(option.value);
        const available = meta?.quantityOnHand;
        const out = available !== undefined && available <= 0;

        return (
          <Group justify="space-between" wrap="nowrap" w="100%" gap="sm">
            <Stack gap={0} style={{ minWidth: 0 }}>
              <Text size="sm" truncate>
                {meta?.name ?? option.label}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {meta?.code}
              </Text>
            </Stack>
            <Text
              size="xs"
              c={available === undefined ? "dimmed" : out ? "red" : "teal"}
              fw={600}
              style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}
            >
              {available === undefined
                ? "no stock record"
                : `${formatQuantity(available)} ${meta?.unitOfMeasure ?? ""}`.trim()}
            </Text>
          </Group>
        );
      }}
      description={
        showAvailableStock && selected ? (
          <Text component="span" size="xs" c={short ? "red" : "dimmed"}>
            {onHand === undefined
              ? "No stock record"
              : `${formatQuantity(onHand)} ${selected.unitOfMeasure} available`}
          </Text>
        ) : undefined
      }
      {...rest}
    />
  );
}
