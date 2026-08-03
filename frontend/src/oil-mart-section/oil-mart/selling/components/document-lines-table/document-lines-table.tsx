import { Table, Text } from "@mantine/core";
import type { OilMartInvoiceLine, OilMartQuotationLine } from "@core/types";
import { formatQuantity } from "../../../components/quantity-text";
import { MoneyText } from "../../../components/money-text";

type DocumentLine = OilMartQuotationLine | OilMartInvoiceLine;

interface DocumentLinesTableProps {
  lines: DocumentLine[];
  /** Adds the internal profit column; never shown on the client PDF. */
  showProfit?: boolean;
}

/**
 * Mirrors the printed quotation/invoice: same columns, same order, so an
 * approver reviews exactly the shape the client receives.
 */
export function DocumentLinesTable({ lines, showProfit }: DocumentLinesTableProps) {
  const withProfit = showProfit && lines.some((line) => line.lineProfit !== undefined);

  return (
    <Table.ScrollContainer minWidth={withProfit ? 1040 : 900}>
      <Table verticalSpacing="xs" withTableBorder withColumnBorders>
        <Table.Thead style={{ backgroundColor: "var(--mantine-color-gray-1)" }}>
          <Table.Tr>
            <Table.Th w="10%">Code</Table.Th>
            <Table.Th w={withProfit ? "26%" : "32%"}>Item Description</Table.Th>
            <Table.Th w="8%" ta="right">
              Ordered
            </Table.Th>
            <Table.Th w="7%" ta="right">
              B/Ord
            </Table.Th>
            <Table.Th w="8%" ta="right">
              Supplied
            </Table.Th>
            <Table.Th w="6%" ta="center">
              UOM
            </Table.Th>
            <Table.Th w="11%" ta="right">
              Unit Price
            </Table.Th>
            <Table.Th w="7%" ta="right">
              Disc %
            </Table.Th>
            <Table.Th w="13%" ta="right">
              Line Total
            </Table.Th>
            {withProfit && (
              <Table.Th w="12%" ta="right">
                Profit
              </Table.Th>
            )}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {lines.map((line) => (
            <Table.Tr key={line.id}>
              <Table.Td>
                <Text size="xs">{line.itemCode}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{line.itemName}</Text>
                {line.isPriceOverride && (
                  <Text size="xs" c="orange">
                    Price overridden
                  </Text>
                )}
              </Table.Td>
              <Table.Td ta="right">{formatQuantity(line.quantityLitres)}</Table.Td>
              <Table.Td ta="right">0</Table.Td>
              <Table.Td ta="right">{formatQuantity(line.quantityLitres)}</Table.Td>
              <Table.Td ta="center">
                <Text size="xs" c="dimmed">
                  {line.unitOfMeasure}
                </Text>
              </Table.Td>
              <Table.Td ta="right">
                <MoneyText value={line.unitPrice} currency="" />
              </Table.Td>
              <Table.Td ta="right">
                {line.discountPercent ? `${formatQuantity(line.discountPercent)}%` : "—"}
              </Table.Td>
              <Table.Td ta="right">
                <MoneyText value={line.lineTotal} currency="" emphasis />
              </Table.Td>
              {withProfit && (
                <Table.Td ta="right">
                  <MoneyText
                    value={line.lineProfit}
                    currency=""
                    c={(line.lineProfit ?? 0) < 0 ? "red" : "teal"}
                  />
                </Table.Td>
              )}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
