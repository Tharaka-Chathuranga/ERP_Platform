import { useState } from "react";
import {
  Badge,
  Button,
  Divider,
  Group,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { getMovements, getOnHand, postMovement } from "../../api/store/items";
import { notifyError, notifySuccess } from "../../lib/notify";
import type { Item, MovementType } from "../../types";

const MOVEMENT_TYPES: { value: MovementType; label: string }[] = [
  { value: "RECEIPT", label: "Receipt (+)" },
  { value: "ISSUE", label: "Issue (−)" },
  { value: "ADJUSTMENT_IN", label: "Adjustment +" },
  { value: "ADJUSTMENT_OUT", label: "Adjustment −" },
];

export function StockPanel({ item }: { item: Item }) {
  const qc = useQueryClient();
  const onHand = useQuery({ queryKey: ["onHand", item.id], queryFn: () => getOnHand(item.id) });
  const movements = useQuery({
    queryKey: ["movements", item.id],
    queryFn: () => getMovements(item.id),
  });

  const [type, setType] = useState<MovementType>("RECEIPT");
  const [quantity, setQuantity] = useState<number | "">("");
  const [reference, setReference] = useState("");

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
      <div>
        <Title order={4}>{item.itemCode}</Title>
        <Text c="dimmed" size="sm">
          {item.name}
        </Text>
      </div>

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
      <Table fz="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>When</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Qty</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {movements.data?.content.map((m) => (
            <Table.Tr key={m.id}>
              <Table.Td>{dayjs(m.occurredAt).format("MM-DD HH:mm")}</Table.Td>
              <Table.Td>{m.type.replace(/_/g, " ")}</Table.Td>
              <Table.Td>{m.quantity}</Table.Td>
            </Table.Tr>
          ))}
          {movements.data?.content.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={3}>
                <Text c="dimmed" size="sm">
                  No movements yet.
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
