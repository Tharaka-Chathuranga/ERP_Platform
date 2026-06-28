import { useState, type ReactNode } from "react";
import { Badge, Divider, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { DataTable, TableToolbar, type Column } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import { getMovements, getOnHand } from "@store/inventory/items.api";
import type { Item, MovementType, StockMovement } from "@core/types";

const MOVEMENT_TYPES: { value: MovementType; label: string }[] = [
  { value: "RECEIPT", label: "Receipt (+)" },
  { value: "ISSUE", label: "Issue (−)" },
  { value: "ADJUSTMENT_IN", label: "Adjustment +" },
  { value: "ADJUSTMENT_OUT", label: "Adjustment −" },
];

/** A single labelled detail (uppercase caption above the value). */
function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={2}>
        {label}
      </Text>
      <Text size="sm">{value}</Text>
    </div>
  );
}

export function StockPanel({ item }: { item: Item }) {
  const onHand = useQuery({ queryKey: ["onHand", item.id], queryFn: () => getOnHand(item.id) });
  const movements = useQuery({
    queryKey: ["movements", item.id],
    queryFn: () => getMovements(item.id),
  });

  const movementColumns: Column<StockMovement>[] = [
    { header: "When", render: (m) => dayjs(m.occurredAt).format("MMM DD, h:mm A") },
    { header: "Type", render: (m) => m.type.replace(/_/g, " ") },
    { header: "Qty", render: (m) => m.quantity },
  ];

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const TYPE_FILTER_OPTIONS = [
    { value: "ALL", label: "All types" },
    ...MOVEMENT_TYPES.map((t) => ({ value: t.value, label: t.label })),
  ];

  const term = search.trim().toLowerCase();
  const filteredMovements = (movements.data?.content ?? []).filter((m) => {
    if (typeFilter !== "ALL" && m.type !== typeFilter) return false;
    if (term && !m.type.replace(/_/g, " ").toLowerCase().includes(term) && !(m.reference ?? "").toLowerCase().includes(term)) return false;
    return true;
  });

  const quantityOnHand = onHand.data?.quantityOnHand;
  const belowReorder =
    item.reorderLevel > 0 && quantityOnHand != null && quantityOnHand <= item.reorderLevel;
  const locationText = item.locations
    .map((l) => [l.rack, l.row, l.column].filter(Boolean).join("/"))
    .filter(Boolean)
    .join(", ");

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Title order={3}>{item.name}</Title>
          <Group gap="xs" mt={6}>
            <Text c="dimmed" size="sm">
              {item.itemCode}
            </Text>
            {item.category && (
              <Badge variant="light" color="gray" radius="sm">
                {item.category}
              </Badge>
            )}
          </Group>
        </div>
        <Paper withBorder radius="md" p="md" miw={150} ta="right">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            On hand
          </Text>
          <Text fw={700} size="xl" c={belowReorder ? "red" : undefined}>
            {quantityOnHand != null ? quantityOnHand : "…"}{" "}
            <Text span size="sm" c="dimmed">
              {item.unitOfMeasure}
            </Text>
          </Text>
        </Paper>
      </Group>

      <Group gap="sm">
        <Badge color={belowReorder ? "red" : "green"} variant="light" radius="sm">
          {belowReorder ? "Below reorder level" : "Stock above reorder"}
        </Badge>
        <Badge color={item.criticalItem ? "red" : "gray"} variant="light" radius="sm">
          {item.criticalItem ? "Critical item" : "Non-critical"}
        </Badge>
        <Badge color={item.approvalRequiredForIssue ? "grape" : "gray"} variant="light" radius="sm">
          {item.approvalRequiredForIssue ? "Approval required to issue" : "No issue approval"}
        </Badge>
      </Group>

      <Paper withBorder radius="md" p="md">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" verticalSpacing="md">
          <Detail label="Reorder level" value={`${item.reorderLevel} ${item.unitOfMeasure}`} />
          <Detail label="Unit of measure" value={item.unitOfMeasure} />
          <Detail label="Location" value={locationText || "—"} />
          <Detail label="Description" value={item.description || "—"} />
        </SimpleGrid>
      </Paper>

      <Divider label="Recent movements" labelPosition="left" />
      <TableToolbar
        filters={[{ label: "Type", value: typeFilter, onChange: setTypeFilter, options: TYPE_FILTER_OPTIONS }]}
        search={{ value: search, onChange: setSearch, placeholder: "Search reference…" }}
      />
      <DataTable
        withCard={false}
        columns={movementColumns}
        data={filteredMovements}
        rowKey={(m) => m.id}
        loading={movements.isLoading}
        empty={<EmptyState title="No movements yet" />}
      />
    </Stack>
  );
}
