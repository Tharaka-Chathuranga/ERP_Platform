import { Box, Card, Group, ScrollArea, Table, Text } from "@mantine/core";
import type { ItemMovementSummary } from "@core/types";

interface TopMoversChartProps {
  data: ItemMovementSummary[];
  itemLabel: (id: string) => string;
}

const RECEIVED_COLOR = "var(--mantine-color-teal-5)";
const ISSUED_COLOR = "var(--mantine-color-yellow-5)";

/** A single coloured horizontal bar with its value, scaled against the busiest item. */
function MovementBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const width = max > 0 ? Math.max((value / max) * 100, value > 0 ? 2 : 0) : 0;
  return (
    <Group gap="xs" wrap="nowrap" title={`${label}: ${value}`}>
      <Box style={{ flex: 1, minWidth: 0, height: 12, borderRadius: 4, background: "var(--mantine-color-default-hover)" }}>
        <Box style={{ width: `${width}%`, height: "100%", borderRadius: 4, background: color }} />
      </Box>
      <Text size="xs" c="dimmed" ta="right" style={{ width: 40, flexShrink: 0 }}>
        {value}
      </Text>
    </Group>
  );
}

/** Received vs issued totals for the busiest items, shown as an item table with inline bars. */
export function TopMoversChart({ data, itemLabel }: TopMoversChartProps) {
  const max = Math.max(1, ...data.flatMap((d) => [d.received, d.issued]));

  return (
    <Card withBorder radius="md" padding="lg" h="100%">
      <Group justify="space-between" mb="md">
        <Text fw={600}>Top movers</Text>
        <Group gap="md">
          <Group gap={6}>
            <Box style={{ width: 10, height: 10, borderRadius: 2, background: RECEIVED_COLOR }} />
            <Text size="xs" c="dimmed">
              Received
            </Text>
          </Group>
          <Group gap={6}>
            <Box style={{ width: 10, height: 10, borderRadius: 2, background: ISSUED_COLOR }} />
            <Text size="xs" c="dimmed">
              Issued
            </Text>
          </Group>
        </Group>
      </Group>

      {data.length === 0 ? (
        <Text size="sm" c="dimmed">
          No movement recorded yet.
        </Text>
      ) : (
        <ScrollArea.Autosize mah={260} type="hover">
          <Table verticalSpacing="sm" layout="fixed" stickyHeader>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: "30%" }}>Item</Table.Th>
                <Table.Th>Movement</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.map((d) => (
                <Table.Tr key={d.itemId}>
                  <Table.Td>
                    <Text size="sm" truncate title={itemLabel(d.itemId)}>
                      {itemLabel(d.itemId)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Box>
                      <MovementBar value={d.received} max={max} color={RECEIVED_COLOR} label="Received" />
                      <Box mt={6}>
                        <MovementBar value={d.issued} max={max} color={ISSUED_COLOR} label="Issued" />
                      </Box>
                    </Box>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea.Autosize>
      )}
    </Card>
  );
}
