import { Alert, Button, Group, Modal, Stack, Table, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { OilMartQuotation } from "@core/types";
import { MoneyText } from "../../../components/money-text";

interface ApproveDocumentModalProps {
  opened: boolean;
  quotation?: OilMartQuotation;
  title?: string;
  description?: string;
  confirmLabel?: string;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function ApproveDocumentModal({
  opened,
  quotation,
  title = "Approve quotation",
  description,
  confirmLabel = "Approve",
  submitting,
  onClose,
  onSubmit,
}: ApproveDocumentModalProps) {
  const overrides = quotation?.lines.filter((line) => line.isPriceOverride) ?? [];

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="lg">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {description ??
            `${quotation?.quotationNo} for ${quotation?.clientName} will be approved and can then be invoiced.`}
        </Text>

        {quotation?.expired && (
          <Alert color="red" variant="light" icon={<IconAlertTriangle size={18} />}>
            This quotation expired on {quotation.validUntil}. It must be edited with current dates
            before it can be approved.
          </Alert>
        )}

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

        <Stack gap={4}>
          <Group justify="space-between" align="baseline">
            <Text size="sm" fw={600}>
              Grand total
            </Text>
            <MoneyText value={quotation?.grandTotal} fz={22} fw={700} />
          </Group>
          {quotation?.totalProfit !== undefined && (
            <Group justify="space-between" align="baseline">
              <Text size="sm" c="dimmed">
                Total profit
              </Text>
              <MoneyText
                value={quotation.totalProfit}
                fw={600}
                c={quotation.totalProfit < 0 ? "red" : "teal"}
              />
            </Group>
          )}
        </Stack>

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button color="green" loading={submitting} onClick={onSubmit} disabled={quotation?.expired}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
