import { Card, Text } from "@mantine/core";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EmptyState } from "@ui/feedback/EmptyState";

const BAR_COLOR = "var(--mantine-color-blue-5)";

interface EfficiencyChartProps {
  chartData: { date: string; "km/L": number }[];
  ready: boolean;
  hasData: boolean;
  loading: boolean;
}

export function EfficiencyChart({ chartData, ready, hasData, loading }: EfficiencyChartProps) {
  const xAxisProps = {
    dataKey: "date",
    fontSize: 11,
    tickMargin: 8,
    interval: Math.max(0, Math.floor(chartData.length / 10) - 1),
    angle: chartData.length > 14 ? -35 : 0,
    textAnchor: (chartData.length > 14 ? "end" : "middle") as "end" | "middle",
    height: chartData.length > 14 ? 48 : 30,
  };

  return (
    <Card withBorder radius="md" padding="lg">
      <Text fw={600} mb="md">km / L per day</Text>
      {!ready && (
        <Text c="dimmed" fz="sm" p="md">Select a date range to load the report.</Text>
      )}
      {ready && !hasData && !loading && (
        <EmptyState
          title="No efficiency data"
          description="Record odometer readings when issuing fuel to generate data for this vehicle."
        />
      )}
      {hasData && (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis {...xAxisProps} />
            <YAxis fontSize={12} unit=" km/L" width={72} />
            <Tooltip formatter={(v: number) => [`${v} km/L`]} />
            <Bar dataKey="km/L" fill={BAR_COLOR} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
