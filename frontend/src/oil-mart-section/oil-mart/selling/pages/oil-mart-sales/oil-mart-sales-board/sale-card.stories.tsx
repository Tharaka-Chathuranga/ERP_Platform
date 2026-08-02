import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Stack, Text } from "@mantine/core";
import type { OilMartSaleStatus } from "@core/types";
import { anOilMartSale, oilMartSaleByStatus } from "@oilmart/mocks";
import { SaleCard } from "./sale-card";

const ASSISTANT_ACTIONS = {
  onSubmitForApproval: fn(),
  onDispatch: fn(),
  onInvoice: fn(),
};

const MANAGER_ACTIONS = {
  onApproveQuotation: fn(),
  onRejectQuotation: fn(),
  onApprove: fn(),
  onReject: fn(),
};

const ALL_STATUSES: OilMartSaleStatus[] = [
  "QUOTATION",
  "QUOTATION_APPROVAL",
  "ORDERED",
  "APPROVED",
  "DISPATCHED",
  "INVOICED",
  "REJECTED",
  "CANCELLED",
];

const meta: Meta<typeof SaleCard> = {
  title: "Oil Mart/Selling/SaleCard",
  component: SaleCard,
  args: { sale: oilMartSaleByStatus("QUOTATION"), onClick: fn() },
  decorators: [(Story) => <div style={{ maxWidth: 280 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof SaleCard>;

export const QuotationReadOnly: Story = {};

export const QuotationWithSubmit: Story = { args: { ...ASSISTANT_ACTIONS } };

export const QuotationApprovalAsManager: Story = {
  args: { sale: oilMartSaleByStatus("QUOTATION_APPROVAL"), ...MANAGER_ACTIONS },
};

export const QuotationApprovalAsAssistant: Story = {
  args: { sale: oilMartSaleByStatus("QUOTATION_APPROVAL"), ...ASSISTANT_ACTIONS },
};

export const OrderedAsManager: Story = {
  args: { sale: oilMartSaleByStatus("ORDERED"), ...MANAGER_ACTIONS },
};

export const OrderedAsAssistant: Story = {
  args: { sale: oilMartSaleByStatus("ORDERED"), ...ASSISTANT_ACTIONS },
};

export const ApprovedWithDispatch: Story = {
  args: { sale: oilMartSaleByStatus("APPROVED"), ...ASSISTANT_ACTIONS },
};

export const DispatchedWithInvoice: Story = {
  args: { sale: oilMartSaleByStatus("DISPATCHED"), ...ASSISTANT_ACTIONS },
};

export const InvoicedIsTerminal: Story = {
  args: { sale: oilMartSaleByStatus("INVOICED"), ...ASSISTANT_ACTIONS, ...MANAGER_ACTIONS },
};

export const Busy: Story = {
  args: { sale: oilMartSaleByStatus("APPROVED"), ...ASSISTANT_ACTIONS, busy: true },
};

export const ExpiringSoon: Story = {
  args: {
    sale: anOilMartSale({
      validUntil: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10),
    }),
    ...ASSISTANT_ACTIONS,
  },
};

export const EveryStatusAsAssistant: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 280 }}><Story /></div>],
  render: (args) => (
    <Stack gap="md">
      {ALL_STATUSES.map((status) => (
        <Stack key={status} gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {status}
          </Text>
          <SaleCard {...args} sale={oilMartSaleByStatus(status)} {...ASSISTANT_ACTIONS} />
        </Stack>
      ))}
    </Stack>
  ),
};

export const EveryStatusAsManager: Story = {
  decorators: [(Story) => <div style={{ maxWidth: 280 }}><Story /></div>],
  render: (args) => (
    <Stack gap="md">
      {ALL_STATUSES.map((status) => (
        <Stack key={status} gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {status}
          </Text>
          <SaleCard {...args} sale={oilMartSaleByStatus(status)} {...MANAGER_ACTIONS} />
        </Stack>
      ))}
    </Stack>
  ),
};
