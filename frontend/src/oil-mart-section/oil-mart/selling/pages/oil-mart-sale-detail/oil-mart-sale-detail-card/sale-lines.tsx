import { Group, Table, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { OilMartSale } from "@core/types";
import { MoneyText } from "../../../../components/money-text";

export function SaleLines({ sale }: { sale: OilMartSale }) {
  return (
    <Table.ScrollContainer minWidth={720}>
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Oil</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Quantity</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>List price</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Charged</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Discount</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Line total</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sale.lines.map((line) => (
            <Table.Tr key={line.id}>
              <Table.Td>
                <Text size="sm" fw={600}>
                  {line.itemName}
                </Text>
                <Text size="xs" c="dimmed">
                  {line.itemCode}
                </Text>
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {line.quantityLitres.toLocaleString()} L
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                <MoneyText value={line.listUnitPrice} />
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                <Group gap={4} justify="flex-end" wrap="nowrap">
                  {line.isPriceOverride && (
                    <IconAlertTriangle size={14} color="var(--mantine-color-orange-6)" />
                  )}
                  <MoneyText value={line.unitPrice} emphasis />
                </Group>
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {line.discountPercent ? `${line.discountPercent}%` : "—"}
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                <MoneyText value={line.lineTotal} emphasis />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
        <Table.Tfoot>
          <Table.Tr>
            <Table.Td colSpan={5} style={{ textAlign: "right" }}>
              <Text size="sm" c="dimmed">
                Subtotal
              </Text>
            </Table.Td>
            <Table.Td style={{ textAlign: "right" }}>
              <MoneyText value={sale.subtotal} />
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td colSpan={5} style={{ textAlign: "right" }}>
              <Text size="sm" c="dimmed">
                Order discount
              </Text>
            </Table.Td>
            <Table.Td style={{ textAlign: "right" }}>
              <MoneyText value={sale.discountAmount} />
            </Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td colSpan={5} style={{ textAlign: "right" }}>
              <Text size="sm" fw={700}>
                Total
              </Text>
            </Table.Td>
            <Table.Td style={{ textAlign: "right" }}>
              <MoneyText value={sale.total} fz={18} fw={700} />
            </Table.Td>
          </Table.Tr>
        </Table.Tfoot>
      </Table>
    </Table.ScrollContainer>
  );
}
