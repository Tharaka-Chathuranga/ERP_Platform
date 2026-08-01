import { ActionIcon, Button, Card, Group, NumberInput, Stack, Table, Text } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type { OilMartItem } from "@core/types";
import { ItemPicker } from "../../../components/item-picker";
import { LitreInput } from "../../../components/litre-input";
import { MoneyText } from "../../../components/money-text";

export interface ReceiptLineDraft {
  key: string;
  itemId: string | null;
  quantityLitres: number | undefined;
  buyUnitPrice: number | undefined;
}

export function receiptLineTotal(line: ReceiptLineDraft): number {
  return (line.quantityLitres ?? 0) * (line.buyUnitPrice ?? 0);
}

interface ReceiptLineEditorProps {
  lines: ReceiptLineDraft[];
  items: OilMartItem[];
  error?: string;
  onChange: (key: string, patch: Partial<ReceiptLineDraft>) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
}

export function ReceiptLineEditor({
  lines,
  items,
  error,
  onChange,
  onAdd,
  onRemove,
}: ReceiptLineEditorProps) {
  const total = lines.reduce((sum, line) => sum + receiptLineTotal(line), 0);

  return (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between" mb="md">
        <Text fw={600}>Lines</Text>
        <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={onAdd}>
          Add line
        </Button>
      </Group>

      <Table.ScrollContainer minWidth={720}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: "40%" }}>Oil</Table.Th>
              <Table.Th style={{ width: "20%" }}>Quantity</Table.Th>
              <Table.Th style={{ width: "20%" }}>Buy price</Table.Th>
              <Table.Th style={{ width: "15%", textAlign: "right" }}>Line total</Table.Th>
              <Table.Th style={{ width: 44 }} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {lines.map((line) => (
              <Table.Tr key={line.key}>
                <Table.Td>
                  <ItemPicker
                    items={items}
                    value={line.itemId}
                    onChange={(itemId) => onChange(line.key, { itemId })}
                    showAvailableStock={false}
                    placeholder="Select oil"
                  />
                </Table.Td>
                <Table.Td>
                  <LitreInput
                    value={line.quantityLitres}
                    onChange={(quantityLitres) => onChange(line.key, { quantityLitres })}
                    placeholder="0"
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    value={line.buyUnitPrice ?? ""}
                    onChange={(value) =>
                      onChange(line.key, {
                        buyUnitPrice: value === "" ? undefined : Number(value),
                      })
                    }
                    min={0}
                    decimalScale={4}
                    thousandSeparator=","
                    placeholder="0.00"
                  />
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  <MoneyText value={receiptLineTotal(line)} emphasis />
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    aria-label="Remove line"
                    disabled={lines.length === 1}
                    onClick={() => onRemove(line.key)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {error && (
        <Text c="red" size="sm" mt="sm">
          {error}
        </Text>
      )}

      <Stack gap={4} align="flex-end" mt="lg">
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
          Total cost
        </Text>
        <MoneyText value={total} fz={24} fw={700} />
      </Stack>
    </Card>
  );
}
