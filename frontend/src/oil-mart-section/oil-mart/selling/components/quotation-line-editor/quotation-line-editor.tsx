import {
  ActionIcon,
  Button,
  Card,
  Group,
  NumberInput,
  Table,
  Text,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import type { OilMartItem, OilMartStockBalance } from "@core/types";
import { ItemPicker } from "../../../components/item-picker";
import { LitreInput } from "../../../components/litre-input";
import { MoneyText } from "../../../components/money-text";
import { PriceOverrideField } from "../price-override-field";
import { DocumentTotals } from "../document-totals";

export interface QuotationLineDraft {
  key: string;
  itemId: string | null;
  quantityLitres: number | undefined;
  listUnitPrice: number | undefined;
  unitPrice: number | undefined;
  unitCost: number | undefined;
  isPriceOverride: boolean;
  discountPercent: number;
}

export function quotationLineTotal(line: QuotationLineDraft): number {
  const gross = (line.quantityLitres ?? 0) * (line.unitPrice ?? 0);
  return gross * (1 - (line.discountPercent || 0) / 100);
}

export function quotationLineProfit(line: QuotationLineDraft): number | undefined {
  if (line.unitCost === undefined) return undefined;
  return quotationLineTotal(line) - (line.quantityLitres ?? 0) * line.unitCost;
}

interface QuotationLineEditorProps {
  lines: QuotationLineDraft[];
  items: OilMartItem[];
  stock?: OilMartStockBalance[];
  gstRatePercent: number;
  showProfit?: boolean;
  readOnly?: boolean;
  error?: string;
  onChange: (key: string, patch: Partial<QuotationLineDraft>) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
}

export function QuotationLineEditor({
  lines,
  items,
  stock,
  gstRatePercent,
  showProfit,
  readOnly,
  error,
  onChange,
  onAdd,
  onRemove,
}: QuotationLineEditorProps) {
  const onHandById = new Map((stock ?? []).map((balance) => [balance.itemId, balance.quantityOnHand]));
  const uomById = new Map(items.map((item) => [item.id, item.unitOfMeasure]));

  const subtotal = lines.reduce((sum, line) => sum + quotationLineTotal(line), 0);
  const totalProfit = showProfit
    ? lines.reduce((sum, line) => sum + (quotationLineProfit(line) ?? 0), 0)
    : undefined;

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

      <Table.ScrollContainer minWidth={showProfit ? 1000 : 860}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: "24%" }}>Oil</Table.Th>
              <Table.Th style={{ width: "14%" }}>Quantity</Table.Th>
              <Table.Th style={{ width: "6%" }}>UOM</Table.Th>
              <Table.Th style={{ width: "17%" }}>Unit price</Table.Th>
              <Table.Th style={{ width: "12%" }}>Discount</Table.Th>
              <Table.Th style={{ width: "15%", textAlign: "right" }}>Line total</Table.Th>
              {showProfit && (
                <Table.Th style={{ width: "14%", textAlign: "right" }}>Profit</Table.Th>
              )}
              {!readOnly && <Table.Th style={{ width: 44 }} />}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {lines.map((line) => {
              const onHand = line.itemId ? onHandById.get(line.itemId) : undefined;
              const unitOfMeasure = line.itemId ? (uomById.get(line.itemId) ?? "—") : "—";
              const profit = quotationLineProfit(line);
              return (
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
                      max={onHand}
                      placeholder="0"
                    />
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      {unitOfMeasure}
                    </Text>
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
                    <MoneyText value={quotationLineTotal(line)} emphasis />
                  </Table.Td>
                  {showProfit && (
                    <Table.Td style={{ textAlign: "right" }}>
                      {profit === undefined ? (
                        <Text size="sm" c="dimmed">
                          —
                        </Text>
                      ) : (
                        <MoneyText value={profit} c={profit < 0 ? "red" : "teal"} />
                      )}
                    </Table.Td>
                  )}
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
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {error && (
        <Text c="red" size="sm" mt="sm">
          {error}
        </Text>
      )}

      <DocumentTotals
        subtotal={subtotal}
        gstRatePercent={gstRatePercent}
        totalProfit={totalProfit}
      />
    </Card>
  );
}
