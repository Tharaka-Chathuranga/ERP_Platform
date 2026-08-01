import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Stack, Text } from "@mantine/core";
import type { OilMartSaleStatus } from "@core/types";
import { oilMartSaleByStatus } from "@oilmart/mocks";
import { SaleStageActions } from "./sale-stage-actions";

const ALL_STATUSES: OilMartSaleStatus[] = [
  "QUOTATION",
  "ORDERED",
  "APPROVED",
  "DISPATCHED",
  "INVOICED",
  "REJECTED",
  "CANCELLED",
];

const meta: Meta<typeof SaleStageActions> = {
  title: "Oil Mart/Selling/SaleStageActions",
  component: SaleStageActions,
  args: {
    sale: oilMartSaleByStatus("ORDERED"),
    onConfirmOrder: fn(),
    onApprove: fn(),
    onReject: fn(),
    onDispatch: fn(),
    onInvoice: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SaleStageActions>;

export const QuotationAsAssistant: Story = {
  args: { sale: oilMartSaleByStatus("QUOTATION") },
  parameters: { role: "OIL_MART_ASSISTANT" },
};

export const OrderedAsManager: Story = { parameters: { role: "STORES_MANAGER" } };

export const OrderedAsAssistant: Story = { parameters: { role: "OIL_MART_ASSISTANT" } };

export const ApprovedAsAssistant: Story = {
  args: { sale: oilMartSaleByStatus("APPROVED") },
  parameters: { role: "OIL_MART_ASSISTANT" },
};

export const DispatchedAsAssistant: Story = {
  args: { sale: oilMartSaleByStatus("DISPATCHED") },
  parameters: { role: "OIL_MART_ASSISTANT" },
};

export const Invoiced: Story = { args: { sale: oilMartSaleByStatus("INVOICED") } };

export const Rejected: Story = { args: { sale: oilMartSaleByStatus("REJECTED") } };

export const Cancelled: Story = { args: { sale: oilMartSaleByStatus("CANCELLED") } };

export const EveryStatusAsAssistant: Story = {
  parameters: { role: "OIL_MART_ASSISTANT" },
  render: (args) => (
    <Stack gap="lg">
      {ALL_STATUSES.map((status) => (
        <Stack key={status} gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {status}
          </Text>
          <SaleStageActions {...args} sale={oilMartSaleByStatus(status)} />
        </Stack>
      ))}
    </Stack>
  ),
};

export const EveryStatusAsManager: Story = {
  parameters: { role: "STORES_MANAGER" },
  render: (args) => (
    <Stack gap="lg">
      {ALL_STATUSES.map((status) => (
        <Stack key={status} gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {status}
          </Text>
          <SaleStageActions {...args} sale={oilMartSaleByStatus(status)} />
        </Stack>
      ))}
    </Stack>
  ),
};
