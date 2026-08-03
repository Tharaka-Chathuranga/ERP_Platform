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
import { StockOnHandHint } from "../../../components/stock-on-hand-hint";
import { PriceOverrideField, PriceOverrideHint } from "../price-override-field";
import { DocumentTotals } from "../document-totals";
import { LineFieldCell, LineValueCell, NUMERIC_INPUT_STYLES } from "./line-cells";

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

  const requestedByItem = lines.reduce((totals, line) => {
    if (!line.itemId) return totals;
    totals.set(line.itemId, (totals.get(line.itemId) ?? 0) + (line.quantityLitres ?? 0));
    return totals;
  }, new Map<string, number>());

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

      <Table.ScrollContainer minWidth={showProfit ? 1080 : 940}>
        <Table verticalSpacing="sm" styles={{ td: { verticalAlign: "top" } }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w="24%">Description</Table.Th>
              <Table.Th w="16%" ta="right">
                Quantity
              </Table.Th>
              <Table.Th w="6%" ta="center">
                UOM
              </Table.Th>
              <Table.Th w="16%" ta="right">
                Unit price
              </Table.Th>
              <Table.Th w="11%" ta="right">
                Discount
              </Table.Th>
              <Table.Th w="13%" ta="right">
                Line total
              </Table.Th>
              {showProfit && (
                <Table.Th w="14%" ta="right">
                  Profit
                </Table.Th>
              )}
              {!readOnly && <Table.Th w={44} />}
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
                    <LineFieldCell>
                      <ItemPicker
                        items={items}
                        stock={stock}
                        showAvailableStock={false}
                        value={line.itemId}
                        onChange={(itemId) => onChange(line.key, { itemId })}
                        disabled={readOnly}
                        placeholder="Select oil"
                      />
                    </LineFieldCell>
                  </Table.Td>
                  <Table.Td>
                    <LineFieldCell
                      align="right"
                      hint={
                        line.itemId ? (
                          <StockOnHandHint
                            quantityOnHand={onHand}
                            requestedQuantity={requestedByItem.get(line.itemId)}
                            unitOfMeasure={unitOfMeasure}
                          />
                        ) : undefined
                      }
                    >
                      <LitreInput
                        value={line.quantityLitres}
                        onChange={(quantityLitres) => onChange(line.key, { quantityLitres })}
                        disabled={readOnly}
                        max={onHand}
                        placeholder="0"
                        styles={NUMERIC_INPUT_STYLES}
                      />
                    </LineFieldCell>
                  </Table.Td>
                  <Table.Td>
                    <LineValueCell align="center">
                      <Text size="sm" c="dimmed">
                        {unitOfMeasure}
                      </Text>
                    </LineValueCell>
                  </Table.Td>
                  <Table.Td>
                    <LineFieldCell
                      align="right"
                      hint={
                        <PriceOverrideHint
                          listUnitPrice={line.listUnitPrice}
                          unitPrice={line.unitPrice}
                        />
                      }
                    >
                      <PriceOverrideField
                        listUnitPrice={line.listUnitPrice}
                        unitPrice={line.unitPrice}
                        disabled={readOnly}
                        onChange={(unitPrice, isPriceOverride) =>
                          onChange(line.key, { unitPrice, isPriceOverride })
                        }
                      />
                    </LineFieldCell>
                  </Table.Td>
                  <Table.Td>
                    <LineFieldCell align="right">
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
                        styles={NUMERIC_INPUT_STYLES}
                      />
                    </LineFieldCell>
                  </Table.Td>
                  <Table.Td>
                    <LineValueCell align="right">
                      <MoneyText value={quotationLineTotal(line)} emphasis />
                    </LineValueCell>
                  </Table.Td>
                  {showProfit && (
                    <Table.Td>
                      <LineValueCell align="right">
                        {profit === undefined ? (
                          <Text size="sm" c="dimmed">
                            —
                          </Text>
                        ) : (
                          <MoneyText value={profit} c={profit < 0 ? "red" : "teal"} />
                        )}
                      </LineValueCell>
                    </Table.Td>
                  )}
                  {!readOnly && (
                    <Table.Td>
                      <LineValueCell align="center">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          aria-label="Remove line"
                          disabled={lines.length === 1}
                          onClick={() => onRemove(line.key)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </LineValueCell>
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
