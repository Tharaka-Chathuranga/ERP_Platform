import type { Meta, StoryObj } from "@storybook/react";
import { Stack, Text } from "@mantine/core";
import type { OilMartSaleStatus } from "@core/types";
import { OilMartSaleProgress } from "./oil-mart-sale-progress";

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

const meta: Meta<typeof OilMartSaleProgress> = {
  title: "Oil Mart/Selling/OilMartSaleProgress",
  component: OilMartSaleProgress,
  args: { status: "APPROVED" },
  argTypes: { status: { control: "select", options: ALL_STATUSES } },
};

export default meta;
type Story = StoryObj<typeof OilMartSaleProgress>;

export const Quotation: Story = { args: { status: "QUOTATION" } };
export const QuotationApproval: Story = { args: { status: "QUOTATION_APPROVAL" } };
export const Ordered: Story = { args: { status: "ORDERED" } };
export const Approved: Story = { args: { status: "APPROVED" } };
export const Dispatched: Story = { args: { status: "DISPATCHED" } };
export const Invoiced: Story = { args: { status: "INVOICED" } };
export const RejectedAtQuotationApproval: Story = { args: { status: "REJECTED" } };
export const RejectedAtOrderApproval: Story = {
  args: { status: "REJECTED", orderedAt: "2026-07-29T11:30:00Z" },
};
export const Cancelled: Story = { args: { status: "CANCELLED" } };

export const EveryStage: Story = {
  render: () => (
    <Stack gap="xl">
      {ALL_STATUSES.map((status) => (
        <Stack key={status} gap={6}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {status}
          </Text>
          <OilMartSaleProgress status={status} />
        </Stack>
      ))}
    </Stack>
  ),
};
