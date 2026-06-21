import { useState } from "react";
import {
  Badge,
  Button,
  Divider,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { DataTable, TableToolbar, type Column } from "@ui/data";
import { EmptyState } from "@ui/feedback/EmptyState";
import { getMovements, getOnHand, postMovement } from "@store/inventory/items.api";
import { notifyError, notifySuccess } from "@core/notify";
import type { Item, MovementType, StockMovement } from "@core/types";

const MOVEMENT_TYPES: { value: MovementType; label: string }[] = [
  { value: "RECEIPT", label: "Receipt (+)" },
  { value: "ISSUE", label: "Issue (−)" },
  { value: "ADJUSTMENT_IN", label: "Adjustment +" },
  { value: "ADJUSTMENT_OUT", label: "Adjustment −" },
];

export function StockPanel({ item, showHeader = true }: { item: Item; showHeader?: boolean }) {
  const qc = useQueryClient();
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
  const [type, setType] = useState<MovementType>("RECEIPT");
  const [quantity, setQuantity] = useState<number | "">("");
  const [reference, setReference] = useState("");

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

  const mutation = useMutation({
    mutationFn: () =>
      postMovement({
        itemId: item.id,
        type,
        quantity: Number(quantity),
        reference: reference || undefined,
      }),
    onSuccess: () => {
      notifySuccess("Movement posted");
      setQuantity("");
      setReference("");
      qc.invalidateQueries({ queryKey: ["onHand", item.id] });
      qc.invalidateQueries({ queryKey: ["movements", item.id] });
    },
    onError: notifyError,
  });

  return (
    <Stack gap="sm">
      {showHeader && (
        <div>
          <Title order={4}>{item.itemCode}</Title>
          <Text c="dimmed" size="sm">
            {item.name}
          </Text>
        </div>
      )}

      <Group>
        <Badge size="lg" variant="light">
          On hand: {onHand.data?.quantityOnHand ?? "…"} {item.unitOfMeasure}
        </Badge>
        {item.reorderLevel > 0 &&
          onHand.data != null &&
          onHand.data.quantityOnHand <= item.reorderLevel && (
            <Badge size="lg" color="red" variant="light">
              At / below reorder ({item.reorderLevel})
            </Badge>
          )}
      </Group>

      {item.locations.length > 0 && (
        <Text size="sm" c="dimmed">
          Location:{" "}
          {item.locations
            .map((l) => [l.rack, l.row, l.column].filter(Boolean).join("/"))
            .join(", ")}
        </Text>
      )}

      <Divider label="Post movement" labelPosition="left" />
      <Group align="flex-end" gap="sm">
        <Select
          label="Type"
          data={MOVEMENT_TYPES}
          value={type}
          onChange={(v) => setType((v as MovementType) ?? "RECEIPT")}
          w={150}
          allowDeselect={false}
        />
        <NumberInput
          label="Quantity"
          min={0}
          value={quantity}
          onChange={(v) => setQuantity(v === "" ? "" : Number(v))}
          w={120}
        />
        <Button
          onClick={() => mutation.mutate()}
          loading={mutation.isPending}
          disabled={quantity === "" || Number(quantity) <= 0}
        >
          Post
        </Button>
      </Group>

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
