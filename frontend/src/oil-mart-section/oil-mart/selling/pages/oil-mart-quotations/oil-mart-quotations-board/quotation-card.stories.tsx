import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Stack, Text } from "@mantine/core";
import type { OilMartQuotationStatus } from "@core/types";
import { anOilMartQuotation, oilMartQuotationByStatus } from "@oilmart/mocks";
import { QuotationCard } from "./quotation-card";

const ASSISTANT_ACTIONS = { onSubmitForApproval: fn(), onEdit: fn() };
const MANAGER_ACTIONS = { onApprove: fn(), onReject: fn() };

const ALL_STATUSES: OilMartQuotationStatus[] = [
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

const meta: Meta<typeof QuotationCard> = {
  title: "Oil Mart/Selling/QuotationCard",
  component: QuotationCard,
  args: { quotation: anOilMartQuotation(), onClick: fn() },
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof QuotationCard>;

export const Draft: Story = { args: { ...ASSISTANT_ACTIONS } };

export const PendingApproval: Story = {
  args: { quotation: oilMartQuotationByStatus("PENDING_APPROVAL"), ...MANAGER_ACTIONS },
};

export const Rejected: Story = {
  args: { quotation: oilMartQuotationByStatus("REJECTED"), ...ASSISTANT_ACTIONS },
};

export const Expired: Story = {
  args: {
    quotation: anOilMartQuotation({
      status: "APPROVED",
      editable: false,
      expired: true,
      validUntil: "2026-07-01",
    }),
  },
};

export const WithoutProfit: Story = {
  args: {
    quotation: anOilMartQuotation({ totalProfit: undefined, totalCost: undefined }),
    ...ASSISTANT_ACTIONS,
  },
};

export const EveryStatus: Story = {
  render: () => (
    <Stack gap="md">
      {ALL_STATUSES.map((status) => (
        <Stack key={status} gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {status}
          </Text>
          <QuotationCard
            quotation={oilMartQuotationByStatus(status)}
            onClick={fn()}
            {...ASSISTANT_ACTIONS}
            {...MANAGER_ACTIONS}
          />
        </Stack>
      ))}
    </Stack>
  ),
};
