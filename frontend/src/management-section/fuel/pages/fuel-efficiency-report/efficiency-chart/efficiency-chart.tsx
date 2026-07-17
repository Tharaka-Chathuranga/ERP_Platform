import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { VehicleEfficiencyReport } from "@core/types";
import { ChartTooltip } from "./chart-tooltip";

const LINE_COLORS = [
  "var(--mantine-color-blue-5)",
  "var(--mantine-color-teal-5)",
  "var(--mantine-color-grape-5)",
  "var(--mantine-color-orange-5)",
  "var(--mantine-color-pink-5)",
  "var(--mantine-color-cyan-5)",
  "var(--mantine-color-yellow-5)",
  "var(--mantine-color-red-5)",
];

interface EfficiencyChartProps {
  chartData: Record<string, string | number | null>[];
  vehicles: VehicleEfficiencyReport[];
  vehicleDriverMap: Map<string, string>;
  userLabel: (id: string) => string;
}

export function EfficiencyChart({ chartData, vehicles, vehicleDriverMap, userLabel }: EfficiencyChartProps) {
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
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis {...xAxisProps} />
        <YAxis fontSize={12} unit=" km/L" width={72} />
        <Tooltip
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <ChartTooltip
                label={label}
                entries={payload.map((p) => ({
                  key: String(p.dataKey),
                  color: String(p.color),
                  value: Number(p.value),
                  driver: userLabel(vehicleDriverMap.get(String(p.dataKey)) ?? ""),
                }))}
              />
            ) : null
          }
        />
        <Legend />
        {vehicles.map((r, i) => (
          <Line
            key={r.vehicleId}
            type="monotone"
            dataKey={r.vehicleNumber}
            stroke={LINE_COLORS[i % LINE_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
