import { Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import dayjs from "dayjs";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import { DefinitionList } from "@ui/data";
import type { OilMartClient } from "@core/types";
import { MoneyText } from "../../../../components/money-text";

export interface OilMartClientStats {
  quotationCount: number;
  approvedCount: number;
  approvedValue: number;
  inFlight: number;
  lastApprovedAt?: string;
}

interface OilMartClientSummaryCardProps {
  client: OilMartClient;
  stats: OilMartClientStats;
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text fw={700} fz={22} lh={1.2}>
        {value}
      </Text>
    </Stack>
  );
}

export function OilMartClientSummaryCard({ client, stats }: OilMartClientSummaryCardProps) {
  return (
    <Card withBorder radius="md" padding="lg" mb="lg">
      <Group justify="space-between" align="flex-start" mb="lg" wrap="nowrap">
        <Stack gap={4}>
          <Title order={3}>{client.name}</Title>
          <Group gap="xs">
            <Text size="sm" c="dimmed">
              {client.code}
            </Text>
            <StatusBadge status={client.status} />
          </Group>
        </Stack>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 4 }} mb="lg">
        <Stat label="Quotations" value={stats.quotationCount} />
        <Stat label="Approved" value={stats.approvedCount} />
        <Stat label="In flight" value={stats.inFlight} />
        <Stat label="Approved value" value={<MoneyText value={stats.approvedValue} fz={22} fw={700} />} />
      </SimpleGrid>

      <DefinitionList
        items={[
          { label: "Contact person", value: client.contactPerson },
          { label: "Phone", value: client.phone },
          { label: "Email", value: client.email },
          {
            label: "Last approved",
            value: stats.lastApprovedAt ? dayjs(stats.lastApprovedAt).format("MMM D, YYYY") : null,
          },
          { label: "Address", value: client.address },
        ]}
      />
    </Card>
  );
}
