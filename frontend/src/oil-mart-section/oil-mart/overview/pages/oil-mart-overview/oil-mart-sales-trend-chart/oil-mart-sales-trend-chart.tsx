import {
  ActionIcon,
  Box,
  Card,
  Group,
  LoadingOverlay,
  Modal,
  ScrollArea,
  Select,
  Table,
  Text,
  Tooltip as MantineTooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowsMaximize } from "@tabler/icons-react";
import dayjs from "dayjs";
import type { OilMartOverview, OilMartOverviewPeriod, OilMartTrendBucket } from "@core/types";
import { formatMoney } from "../../../../components/money-text";
import {
  OIL_MART_CHART_PERIOD_OPTIONS,
  oilMartPeriodLabel,
} from "../oil-mart-overview-period";

/** Seven rows fit without scrolling; anything longer scrolls inside the card. */
const VISIBLE_ROWS = 7;
const ROW_HEIGHT = 44;
const BAR_COLOR = "var(--mantine-color-teal-6)";

type TrendRow = { key: string; label: string; total: number; future: boolean };

function bucketLabel(bucketStart: string, bucket: OilMartTrendBucket): string {
  return dayjs(bucketStart).format(bucket === "HOURS" ? "HH:mm" : "ddd, MMM D");
}

/** A single bar scaled against the busiest bucket in the period. */
function SalesBar({ value, max }: { value: number; max: number }) {
  const width = max > 0 ? Math.max((value / max) * 100, value > 0 ? 2 : 0) : 0;
  return (
    <Box
      style={{
        flex: 1,
        minWidth: 0,
        height: 12,
        borderRadius: 4,
        background: "var(--mantine-color-default-hover)",
      }}
    >
      <Box style={{ width: `${width}%`, height: "100%", borderRadius: 4, background: BAR_COLOR }} />
    </Box>
  );
}

function TrendTable({ rows, max, mah }: { rows: TrendRow[]; max: number; mah: number | string }) {
  if (rows.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        No sales recorded in this period yet.
      </Text>
    );
  }

  return (
    <ScrollArea.Autosize mah={mah} type="hover">
      <Table verticalSpacing="sm" layout="fixed" stickyHeader>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: "26%" }}>Date</Table.Th>
            <Table.Th>Sales</Table.Th>
            <Table.Th style={{ width: "22%", textAlign: "right" }}>Amount</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            <Table.Tr key={row.key}>
              <Table.Td>
                <Text size="sm" c={row.future ? "dimmed" : undefined}>
                  {row.label}
                </Text>
              </Table.Td>
              <Table.Td>
                <SalesBar value={row.total} max={max} />
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                <Text
                  size="sm"
                  c={row.total === 0 ? "dimmed" : undefined}
                  fw={row.total > 0 ? 600 : 400}
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {row.future && row.total === 0 ? "—" : formatMoney(row.total)}
                </Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea.Autosize>
  );
}

interface OilMartSalesTrendChartProps {
  overview: OilMartOverview;
  period: OilMartOverviewPeriod;
  onPeriodChange: (period: OilMartOverviewPeriod) => void;
  loading?: boolean;
}

export function OilMartSalesTrendChart({
  overview,
  period,
  onPeriodChange,
  loading,
}: OilMartSalesTrendChartProps) {
  const [expanded, { open, close }] = useDisclosure(false);
  const title = `Sales trend · ${oilMartPeriodLabel(period)}`;

  const now = dayjs();
  const rows: TrendRow[] = overview.salesTrend.map((point) => ({
    key: point.bucketStart,
    label: bucketLabel(point.bucketStart, overview.trendBucket),
    total: point.total,
    future: dayjs(point.bucketStart).isAfter(now),
  }));
  const max = Math.max(1, ...rows.map((row) => row.total));

  const periodSelect = (
    <Select
      size="xs"
      w={130}
      allowDeselect={false}
      data={OIL_MART_CHART_PERIOD_OPTIONS}
      value={period}
      onChange={(value) => value && onPeriodChange(value as OilMartOverviewPeriod)}
      aria-label="Sales trend period"
    />
  );

  return (
    <>
      <Card withBorder radius="md" padding="lg" pos="relative">
        <LoadingOverlay visible={Boolean(loading)} overlayProps={{ blur: 1 }} zIndex={1} />
        <Group justify="space-between" mb="md" wrap="nowrap">
          <Text fw={600}>{title}</Text>
          <Group gap="xs" wrap="nowrap">
            {periodSelect}
            <MantineTooltip label="Open full screen" withArrow>
              <ActionIcon variant="subtle" color="gray" onClick={open} aria-label={`Expand ${title}`}>
                <IconArrowsMaximize size={18} />
              </ActionIcon>
            </MantineTooltip>
          </Group>
        </Group>
        <TrendTable rows={rows} max={max} mah={VISIBLE_ROWS * ROW_HEIGHT} />
      </Card>

      <Modal
        opened={expanded}
        onClose={close}
        fullScreen
        radius={0}
        title={<Text fw={600}>{title}</Text>}
      >
        <Group justify="flex-end" mb="md">
          {periodSelect}
        </Group>
        <TrendTable rows={rows} max={max} mah="calc(100vh - 160px)" />
      </Modal>
    </>
  );
}
