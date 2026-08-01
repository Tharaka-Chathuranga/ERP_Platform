import { Alert, Button, Group, Modal, Stack, Table, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { OilMartSale } from "@core/types";
import { MoneyText } from "../../../../components/money-text";

interface ApproveSaleModalProps {
  opened: boolean;
  sale?: OilMartSale;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function ApproveSaleModal({
  opened,
  sale,
  submitting,
  onClose,
  onSubmit,
}: ApproveSaleModalProps) {
  const overrides = sale?.lines.filter((line) => line.isPriceOverride) ?? [];

  return (
    <Modal opened={opened} onClose={onClose} title="Approve sale" centered size="lg">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {sale?.saleNo} for {sale?.clientName} will move to Approved and become ready for
          dispatch.
        </Text>

        {overrides.length > 0 && (
          <Alert
            color="orange"
            variant="light"
            icon={<IconAlertTriangle size={18} />}
            title={`${overrides.length} line${overrides.length === 1 ? "" : "s"} priced below or above list`}
          >
            <Table verticalSpacing={4} mt="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Oil</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>List</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Charged</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {overrides.map((line) => (
                  <Table.Tr key={line.id}>
                    <Table.Td>{line.itemName}</Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <MoneyText value={line.listUnitPrice} size="xs" />
                    </Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <MoneyText value={line.unitPrice} size="xs" emphasis />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Alert>
        )}

        <Group justify="space-between" align="baseline">
          <Text size="sm" fw={600}>
            Order total
          </Text>
          <MoneyText value={sale?.total} fz={22} fw={700} />
        </Group>

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button color="blue" loading={submitting} onClick={onSubmit}>
            Approve
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
