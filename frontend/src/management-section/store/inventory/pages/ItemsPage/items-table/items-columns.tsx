import { Badge, Group, Text } from "@mantine/core";
import { type Column } from "@ui/data";
import type { Item } from "@core/types";

interface ItemsColumnsOptions {
  onHandMap: Record<string, number>;
}

export function buildItemsColumns({ onHandMap }: ItemsColumnsOptions): Column<Item>[] {
  return [
    { header: "Code", emphasis: true, render: (i) => i.itemCode },
    { header: "Name", render: (i) => i.name },
    { header: "Category", render: (i) => i.category ?? "—" },
    { header: "Description", render: (i) => i.description ? (
      <Text size="sm" lineClamp={1}>{i.description}</Text>
    ) : "—" },
    { header: "UoM", render: (i) => i.unitOfMeasure },
    {
      header: "Qty on hand",
      align: "right",
      render: (i) => onHandMap[i.id] != null ? onHandMap[i.id] : "—",
    },
    {
      header: "Reorder level",
      align: "right",
      render: (i) => i.reorderLevel > 0 ? i.reorderLevel : "—",
    },
    {
      header: "Flags",
      render: (i) => (
        <Group gap={4}>
          {i.criticalItem && (
            <Badge size="xs" color="red" variant="light">Critical</Badge>
          )}
          {i.approvalRequiredForIssue && (
            <Badge size="xs" color="yellow" variant="light">Approval</Badge>
          )}
        </Group>
      ),
    },
  ];
}
