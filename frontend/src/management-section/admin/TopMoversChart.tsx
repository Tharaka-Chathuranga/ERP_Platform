import { ActionIcon, Box, Card, Group, Modal, ScrollArea, Select, Table, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowsMaximize } from "@tabler/icons-react";
import type { ItemMovementSummary } from "@core/types";

const TITLE = "Top movers";

interface TopMoversChartProps {
  data: ItemMovementSummary[];
  itemLabel: (id: string) => string;
  days: number;
  onDaysChange: (days: number) => void;
}

const RECEIVED_COLOR = "var(--mantine-color-teal-5)";
const ISSUED_COLOR = "var(--mantine-color-yellow-5)";

const RANGE_OPTIONS = [
  { value: "1", label: "Today" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "0", label: "All time" },
];

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

/** Legend + movement table, so the same markup renders both inline and full screen. */
function TopMoversBody({
  data,
  itemLabel,
  max,
  mah,
}: {
  data: ItemMovementSummary[];
  itemLabel: (id: string) => string;
  max: number;
  mah: number | string;
}) {
  return (
    <>
      <Group gap="md" mb="sm">
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

      {data.length === 0 ? (
        <Text size="sm" c="dimmed">
          No movement recorded yet.
        </Text>
      ) : (
        <ScrollArea.Autosize mah={mah} type="hover">
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
    </>
  );
}

/** Received vs issued totals for the busiest items, shown as an item table with inline bars. */
export function TopMoversChart({ data, itemLabel, days, onDaysChange }: TopMoversChartProps) {
  const [expanded, { open, close }] = useDisclosure(false);
  const max = Math.max(1, ...data.flatMap((d) => [d.received, d.issued]));

  const rangeSelect = (
    <Select
      size="xs"
      w={130}
      allowDeselect={false}
      data={RANGE_OPTIONS}
      value={String(days)}
      onChange={(value) => onDaysChange(Number(value))}
      aria-label="Top movers time range"
    />
  );

  return (
    <>
      <Card withBorder radius="md" padding="lg" h="100%">
        <Group justify="space-between" mb="md" wrap="nowrap">
          <Text fw={600}>{TITLE}</Text>
          <Group gap="xs" wrap="nowrap">
            {rangeSelect}
            <Tooltip label="Open full screen" withArrow>
              <ActionIcon variant="subtle" color="gray" onClick={open} aria-label={`Expand ${TITLE}`}>
                <IconArrowsMaximize size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
        <TopMoversBody data={data} itemLabel={itemLabel} max={max} mah={260} />
      </Card>

      <Modal opened={expanded} onClose={close} fullScreen radius={0} title={<Text fw={600}>{TITLE}</Text>}>
        <Group justify="flex-end" mb="md">
          {rangeSelect}
        </Group>
        <TopMoversBody data={data} itemLabel={itemLabel} max={max} mah="calc(100vh - 160px)" />
      </Modal>
    </>
  );
}
