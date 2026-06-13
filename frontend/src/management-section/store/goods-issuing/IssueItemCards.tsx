import { Card, Group, SimpleGrid, Text } from "@mantine/core";
import type { ReactNode } from "react";
import { StatusBadge } from "@ui/feedback/StatusBadge";
import type { IssueLine } from "@core/types";

interface IssueItemCardsProps {
  lines: IssueLine[];
  itemLabel: (itemId: string) => string;
  renderActions?: (line: IssueLine) => ReactNode;
}

export function IssueItemCards({ lines, itemLabel, renderActions }: IssueItemCardsProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
      {lines.map((line) => (
        <Card key={line.id} withBorder radius="md" padding="md">
          <Group justify="space-between" wrap="nowrap" mb="sm">
            <Text fw={600} lineClamp={1}>
              {itemLabel(line.itemId)}
            </Text>
            <StatusBadge status={line.approvalStatus} />
          </Group>
          <Group gap="xl">
            <Stat label="Quantity" value={line.quantity} />
            <Stat label="Returnable" value={line.returnable ? "Yes" : "No"} />
            {line.returnedQuantity > 0 && <Stat label="Returned" value={line.returnedQuantity} />}
          </Group>
          {renderActions && <div style={{ marginTop: "var(--mantine-spacing-sm)" }}>{renderActions(line)}</div>}
        </Card>
      ))}
    </SimpleGrid>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text>{value}</Text>
    </div>
  );
}
