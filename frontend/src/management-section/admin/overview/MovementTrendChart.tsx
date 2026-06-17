import { Card, Text } from "@mantine/core";
import dayjs from "dayjs";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MovementTrendPoint } from "@core/types";

/** Received vs issued over time. Pure presentational — data is fetched by the page. */
export function MovementTrendChart({ data }: { data: MovementTrendPoint[] }) {
  const points = data.map((p) => ({
    day: dayjs(p.day).format("MMM D"),
    received: p.received,
    issued: p.issued,
  }));

  return (
    <Card withBorder radius="md" padding="lg" h="100%">
      <Text fw={600} mb="md">
        Movement trend
      </Text>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" fontSize={12} tickMargin={8} />
          <YAxis fontSize={12} allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="received"
            name="Received"
            stroke="var(--mantine-color-teal-6)"
            fill="var(--mantine-color-teal-1)"
          />
          <Area
            type="monotone"
            dataKey="issued"
            name="Issued"
            stroke="var(--mantine-color-yellow-7)"
            fill="var(--mantine-color-yellow-1)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
