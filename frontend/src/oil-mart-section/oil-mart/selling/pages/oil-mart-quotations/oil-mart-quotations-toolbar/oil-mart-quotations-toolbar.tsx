import { Badge, Button, Group, Switch } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { TableToolbar } from "@ui/data";
import type { OilMartClient } from "@core/types";

interface OilMartQuotationsToolbarProps {
  clients: OilMartClient[];
  clientId: string;
  onClientChange: (value: string) => void;
  dateRange: [Date | null, Date | null];
  onDateRangeChange: (value: [Date | null, Date | null]) => void;
  showTerminal: boolean;
  onShowTerminalChange: (value: boolean) => void;
  awaitingApproval: number;
  canCreate: boolean;
  onNew: () => void;
}

export function OilMartQuotationsToolbar({
  clients,
  clientId,
  onClientChange,
  dateRange,
  onDateRangeChange,
  showTerminal,
  onShowTerminalChange,
  awaitingApproval,
  canCreate,
  onNew,
}: OilMartQuotationsToolbarProps) {
  return (
    <TableToolbar
      leftSection={
        awaitingApproval > 0 ? (
          <Badge color="orange" variant="light" size="lg" radius="sm">
            {awaitingApproval} awaiting approval
          </Badge>
        ) : undefined
      }
      filters={[
        {
          label: "Client",
          value: clientId,
          onChange: onClientChange,
          options: [
            { value: "ALL", label: "All clients" },
            ...clients.map((client) => ({ value: client.id, label: client.name })),
          ],
        },
        { type: "daterange", label: "Issued", value: dateRange, onChange: onDateRangeChange },
      ]}
      actions={
        <Group gap="sm">
          <Switch
            label="Show rejected & cancelled"
            checked={showTerminal}
            onChange={(event) => onShowTerminalChange(event.currentTarget.checked)}
          />
          {canCreate && (
            <Button leftSection={<IconPlus size={16} />} onClick={onNew}>
              New quotation
            </Button>
          )}
        </Group>
      }
    />
  );
}
