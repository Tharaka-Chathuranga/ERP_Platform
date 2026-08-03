import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Stack, Text } from "@mantine/core";
import type { OilMartInvoiceStatus } from "@core/types";
import { anOilMartInvoice, oilMartInvoiceByStatus } from "@oilmart/mocks";
import { InvoiceStageActions } from "./invoice-stage-actions";

const HANDLERS = {
  onApprove: fn(),
  onReject: fn(),
  onCancel: fn(),
  onReselect: fn(),
  onPreviewPdf: fn(),
};

const ALL_STATUSES: OilMartInvoiceStatus[] = [
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

const meta: Meta<typeof InvoiceStageActions> = {
  title: "Oil Mart/Selling/InvoiceStageActions",
  component: InvoiceStageActions,
  args: { invoice: anOilMartInvoice(), canCreate: true, canApprove: true, ...HANDLERS },
};

export default meta;
type Story = StoryObj<typeof InvoiceStageActions>;

export const PendingApprovalAsManager: Story = { args: { canCreate: false } };

export const PendingApprovalAsAssistant: Story = { args: { canApprove: false } };

export const Rejected: Story = {
  args: { invoice: oilMartInvoiceByStatus("REJECTED"), canApprove: false },
};

export const Approved: Story = { args: { invoice: oilMartInvoiceByStatus("APPROVED") } };

export const EveryStatus: Story = {
  render: (args) => (
    <Stack gap="lg">
      {ALL_STATUSES.map((status) => (
        <Stack key={status} gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {status}
          </Text>
          <InvoiceStageActions {...args} invoice={oilMartInvoiceByStatus(status)} />
        </Stack>
      ))}
    </Stack>
  ),
};
