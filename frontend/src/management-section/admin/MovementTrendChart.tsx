import { ActionIcon, Card, Group, Modal, Text, Tooltip as MantineTooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowsMaximize } from "@tabler/icons-react";
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

const TITLE = "Movement trend · Last 30 days";

type TrendPoint = { day: string; received: number; issued: number };

/** The area chart itself, so the same markup renders both inline and full screen. */
function TrendAreaChart({ points, height }: { points: TrendPoint[]; height: number | string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
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
  );
}

/** Received vs issued over time. Pure presentational — data is fetched by the page. */
export function MovementTrendChart({ data }: { data: MovementTrendPoint[] }) {
  const [expanded, { open, close }] = useDisclosure(false);

  const points = data.map((p) => ({
    day: dayjs(p.day).format("MMM D"),
    received: p.received,
    issued: p.issued,
  }));

  return (
    <>
      <Card withBorder radius="md" padding="lg" h="100%">
        <Group justify="space-between" align="center" mb="md" wrap="nowrap">
          <Text fw={600}>{TITLE}</Text>
          <MantineTooltip label="Open full screen" withArrow>
            <ActionIcon variant="subtle" color="gray" onClick={open} aria-label={`Expand ${TITLE}`}>
              <IconArrowsMaximize size={18} />
            </ActionIcon>
          </MantineTooltip>
        </Group>
        <TrendAreaChart points={points} height={260} />
      </Card>

      <Modal opened={expanded} onClose={close} fullScreen radius={0} title={<Text fw={600}>{TITLE}</Text>}>
        <div style={{ height: "calc(100vh - 120px)" }}>
          <TrendAreaChart points={points} height="100%" />
        </div>
      </Modal>
    </>
  );
}
