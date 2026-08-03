import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Stack, Text } from "@mantine/core";
import type { OilMartQuotationStatus } from "@core/types";
import { anOilMartQuotation, oilMartQuotationByStatus } from "@oilmart/mocks";
import { QuotationStageActions } from "./quotation-stage-actions";

const HANDLERS = {
  onSubmitForApproval: fn(),
  onApprove: fn(),
  onReject: fn(),
  onCancel: fn(),
  onEdit: fn(),
  onPreviewPdf: fn(),
};

const ALL_STATUSES: OilMartQuotationStatus[] = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

const meta: Meta<typeof QuotationStageActions> = {
  title: "Oil Mart/Selling/QuotationStageActions",
  component: QuotationStageActions,
  args: { quotation: anOilMartQuotation(), canCreate: true, canApprove: true, ...HANDLERS },
};

export default meta;
type Story = StoryObj<typeof QuotationStageActions>;

export const DraftAsAssistant: Story = { args: { canApprove: false } };

export const PendingApprovalAsManager: Story = {
  args: { quotation: oilMartQuotationByStatus("PENDING_APPROVAL"), canCreate: false },
};

export const Rejected: Story = {
  args: { quotation: oilMartQuotationByStatus("REJECTED"), canApprove: false },
};

export const Expired: Story = {
  args: {
    quotation: anOilMartQuotation({
      status: "PENDING_APPROVAL",
      editable: false,
      expired: true,
      validUntil: "2026-07-01",
    }),
  },
};

export const EveryStatus: Story = {
  render: (args) => (
    <Stack gap="lg">
      {ALL_STATUSES.map((status) => (
        <Stack key={status} gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {status}
          </Text>
          <QuotationStageActions {...args} quotation={oilMartQuotationByStatus(status)} />
        </Stack>
      ))}
    </Stack>
  ),
};
