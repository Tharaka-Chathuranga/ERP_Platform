import { ActionIcon, Button, Card, Divider, Group, NumberInput, Stack, Table, Text } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type { OilMartItem, OilMartStockBalance } from "@core/types";
import { ItemPicker } from "../../../components/item-picker";
import { LitreInput } from "../../../components/litre-input";
import { MoneyText } from "../../../components/money-text";
import { PriceOverrideField } from "../price-override-field";

export interface SaleLineDraft {
  key: string;
  itemId: string | null;
  quantityLitres: number | undefined;
  listUnitPrice: number | undefined;
  unitPrice: number | undefined;
  isPriceOverride: boolean;
  discountPercent: number;
}

export function saleLineTotal(line: SaleLineDraft): number {
  const gross = (line.quantityLitres ?? 0) * (line.unitPrice ?? 0);
  return gross * (1 - (line.discountPercent || 0) / 100);
}

interface SaleLineEditorProps {
  lines: SaleLineDraft[];
  items: OilMartItem[];
  stock?: OilMartStockBalance[];
  discountAmount: number;
  readOnly?: boolean;
  error?: string;
  onChange: (key: string, patch: Partial<SaleLineDraft>) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
  onDiscountAmountChange: (value: number) => void;
}

export function SaleLineEditor({
  lines,
  items,
  stock,
  discountAmount,
  readOnly,
  error,
  onChange,
  onAdd,
  onRemove,
  onDiscountAmountChange,
}: SaleLineEditorProps) {
  const subtotal = lines.reduce((sum, line) => sum + saleLineTotal(line), 0);
  const total = subtotal - (discountAmount || 0);

  return (
    <Card withBorder radius="md" padding="lg">
      <Group justify="space-between" mb="md">
        <Text fw={600}>Lines</Text>
        {!readOnly && (
          <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={onAdd}>
            Add line
          </Button>
        )}
      </Group>

      <Table.ScrollContainer minWidth={860}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: "30%" }}>Oil</Table.Th>
              <Table.Th style={{ width: "16%" }}>Quantity</Table.Th>
              <Table.Th style={{ width: "20%" }}>Unit price</Table.Th>
              <Table.Th style={{ width: "13%" }}>Discount</Table.Th>
              <Table.Th style={{ width: "17%", textAlign: "right" }}>Line total</Table.Th>
              {!readOnly && <Table.Th style={{ width: 44 }} />}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {lines.map((line) => (
              <Table.Tr key={line.key}>
                <Table.Td>
                  <ItemPicker
                    items={items}
                    stock={stock}
                    value={line.itemId}
                    onChange={(itemId) => onChange(line.key, { itemId })}
                    requiredLitres={line.quantityLitres}
                    disabled={readOnly}
                    placeholder="Select oil"
                  />
                </Table.Td>
                <Table.Td>
                  <LitreInput
                    value={line.quantityLitres}
                    onChange={(quantityLitres) => onChange(line.key, { quantityLitres })}
                    disabled={readOnly}
                    placeholder="0"
                  />
                </Table.Td>
                <Table.Td>
                  <PriceOverrideField
                    listUnitPrice={line.listUnitPrice}
                    unitPrice={line.unitPrice}
                    disabled={readOnly}
                    onChange={(unitPrice, isPriceOverride) =>
                      onChange(line.key, { unitPrice, isPriceOverride })
                    }
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    value={line.discountPercent}
                    onChange={(value) =>
                      onChange(line.key, { discountPercent: value === "" ? 0 : Number(value) })
                    }
                    disabled={readOnly}
                    min={0}
                    max={100}
                    decimalScale={2}
                    suffix="%"
                  />
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  <MoneyText value={saleLineTotal(line)} emphasis />
                </Table.Td>
                {!readOnly && (
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
                )}
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

      <Divider my="lg" />

      <Stack gap="xs" align="flex-end">
        <Group gap="xl">
          <Text size="sm" c="dimmed">
            Subtotal
          </Text>
          <MoneyText value={subtotal} />
        </Group>
        <Group gap="xl" align="center">
          <Text size="sm" c="dimmed">
            Order discount
          </Text>
          {readOnly ? (
            <MoneyText value={discountAmount} />
          ) : (
            <NumberInput
              value={discountAmount}
              onChange={(value) => onDiscountAmountChange(value === "" ? 0 : Number(value))}
              min={0}
              decimalScale={2}
              thousandSeparator=","
              w={160}
            />
          )}
        </Group>
        <Group gap="xl" align="baseline">
          <Text size="sm" fw={600}>
            Total
          </Text>
          <MoneyText value={total} fz={24} fw={700} />
        </Group>
      </Stack>
    </Card>
  );
}
