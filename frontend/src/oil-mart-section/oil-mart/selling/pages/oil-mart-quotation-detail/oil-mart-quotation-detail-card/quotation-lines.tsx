import { Table, Text } from "@mantine/core";
import type { OilMartQuotation } from "@core/types";
import { MoneyText } from "../../../../components/money-text";

export function QuotationLines({ quotation }: { quotation: OilMartQuotation }) {
  const showProfit = quotation.lines.some((line) => line.lineProfit !== undefined);

  return (
    <Table.ScrollContainer minWidth={showProfit ? 900 : 760}>
      <Table verticalSpacing="sm" striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Oil</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Quantity</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Unit price</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Discount</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Line total</Table.Th>
            {showProfit && <Table.Th style={{ textAlign: "right" }}>Profit</Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {quotation.lines.map((line) => (
            <Table.Tr key={line.id}>
              <Table.Td>
                <Text size="sm" fw={500}>
                  {line.itemName}
                </Text>
                <Text size="xs" c="dimmed">
                  {line.itemCode}
                  {line.isPriceOverride ? " · price overridden" : ""}
                </Text>
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {line.quantityLitres.toLocaleString()} L
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                <MoneyText value={line.unitPrice} />
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {line.discountPercent ? `${line.discountPercent}%` : "—"}
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                <MoneyText value={line.lineTotal} emphasis />
              </Table.Td>
              {showProfit && (
                <Table.Td style={{ textAlign: "right" }}>
                  <MoneyText
                    value={line.lineProfit}
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
