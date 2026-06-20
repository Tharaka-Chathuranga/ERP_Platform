import { Card, Text } from "@mantine/core";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ItemMovementSummary } from "@core/types";

interface TopMoversChartProps {
  data: ItemMovementSummary[];
  itemLabel: (id: string) => string;
}

/** Received vs issued totals for the busiest items. */
export function TopMoversChart({ data, itemLabel }: TopMoversChartProps) {
  const bars = data.map((d) => ({
    item: itemLabel(d.itemId),
    received: d.received,
    issued: d.issued,
  }));

  return (
    <Card withBorder radius="md" padding="lg" h="100%">
      <Text fw={600} mb="md">
        Top movers
      </Text>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={bars} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="item" fontSize={11} tickMargin={8} interval={0} angle={-20} height={50} />
          <YAxis fontSize={12} allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="received" name="Received" fill="var(--mantine-color-teal-5)" />
          <Bar dataKey="issued" name="Issued" fill="var(--mantine-color-yellow-5)" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
