import { Group, Switch, Text } from "@mantine/core";
import { TableToolbar } from "@ui/data";
import { OIL_TYPE_OPTIONS } from "../../../../components/oil-type-badge";
import { MoneyText } from "../../../../components/money-text";

interface OilMartStockToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  oilType: string;
  onOilTypeChange: (value: string) => void;
  lowOnly: boolean;
  onLowOnlyChange: (value: boolean) => void;
  stockValue: number;
  lowCount: number;
}

export function OilMartStockToolbar({
  search,
  onSearchChange,
  oilType,
  onOilTypeChange,
  lowOnly,
  onLowOnlyChange,
  stockValue,
  lowCount,
}: OilMartStockToolbarProps) {
  return (
    <TableToolbar
      search={{ value: search, onChange: onSearchChange, placeholder: "Search code or name" }}
      leftSection={
        <Group gap="lg">
          <Group gap={6}>
            <Text size="sm" c="dimmed">
              Stock value
            </Text>
            <MoneyText value={stockValue} emphasis />
          </Group>
          <Group gap={6}>
            <Text size="sm" c="dimmed">
              Below reorder
            </Text>
            <Text size="sm" fw={700} c={lowCount > 0 ? "red" : undefined}>
              {lowCount}
            </Text>
          </Group>
        </Group>
      }
      filters={[
        {
          label: "Oil type",
          value: oilType,
          onChange: onOilTypeChange,
          options: [{ value: "ALL", label: "All types" }, ...OIL_TYPE_OPTIONS],
        },
      ]}
      actions={
        <Switch
          label="Low stock only"
          checked={lowOnly}
          onChange={(event) => onLowOnlyChange(event.currentTarget.checked)}
        />
      }
    />
  );
}
